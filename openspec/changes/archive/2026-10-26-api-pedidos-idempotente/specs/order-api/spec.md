## ADDED Requirements

### Requirement: Creación de pedido con montos del servidor
`POST /api/orders` SHALL recibir un body JSON con `items` (`[{ productId, qty }]`),
`customerName`, `customerPhone`, `address`, `zoneId`, `date`, `slot`, `notes` (opcional) e
`idempotencyKey` (uuid), insertar el pedido con los montos calculados por el servidor y
responder `201` con el pedido creado (incluye `id`, `status: "NUEVO"`, el snapshot de
`items`, `subtotal`, `deliveryFee`, `total`, `zoneName` y `date` como `YYYY-MM-DD`). La
respuesta SHALL no cachearse (`Cache-Control: no-store`).

#### Scenario: Pedido válido
- **WHEN** se envía un POST con ítems del catálogo, datos de entrega válidos, una franja
  pedible y una `idempotencyKey` nueva
- **THEN** responde `201` con el pedido en estado `NUEVO` y la fila existe en la base

#### Scenario: Precio alterado por el cliente
- **WHEN** el body incluye precios o totales propios junto a `productId` y `qty` válidos
- **THEN** el pedido se guarda con el título y el precio unitario del catálogo y con
  `subtotal`, `deliveryFee` (tarifa de la zona) y `total` calculados por el servidor

### Requirement: Idempotencia por idempotencyKey
Ante una violación de constraint única (`P2002`), el servidor SHALL buscar el pedido por
`idempotency_key` (única constraint `UNIQUE` además del id): si existe responde `200` con el
pedido ya almacenado; si no existe responde `500 { error: "INTERNAL_ERROR" }`. La
`idempotencyKey` SHALL normalizarse a minúsculas antes de insertar.

#### Scenario: Replay con la misma clave
- **WHEN** se repite un POST exitoso con la misma `idempotencyKey` (doble clic o reintento
  de red)
- **THEN** responde `200` con el pedido ya almacenado y no se crea una segunda fila

#### Scenario: Concurrencia con la misma clave
- **WHEN** dos POST con la misma `idempotencyKey` llegan simultáneamente
- **THEN** exactamente uno inserta (`201`) y el otro recibe el mismo pedido (`200`); la base
  contiene una sola fila

### Requirement: Validación de campos con lista de errores
El servidor SHALL responder `422 { error: "VALIDATION_ERROR", fields: [...] }` con los
nombres de los campos faltantes o inválidos: `customerName`, `customerPhone` y `address`
strings no vacíos (tras trim); `customerPhone` solo con dígitos, espacios y `+ ( ) - .` y
con 7 a 15 dígitos; `address` de al menos 8 caracteres; `notes` opcional de hasta 500
caracteres; `idempotencyKey` con forma de uuid; y `fields: ["body"]` cuando el body no es
JSON objeto.

#### Scenario: Campos faltantes
- **WHEN** se omite `customerName` y `customerPhone`
- **THEN** responde `422 VALIDATION_ERROR` con `fields` conteniendo ambos nombres y no
  inserta nada

#### Scenario: Teléfono inválido
- **WHEN** `customerPhone` trae letras o menos de 7 dígitos
- **THEN** responde `422 VALIDATION_ERROR` con `customerPhone` en `fields`

#### Scenario: Body que no es JSON
- **WHEN** el body no se puede parsear como JSON o no es un objeto
- **THEN** responde `422 VALIDATION_ERROR` con `fields: ["body"]`

### Requirement: El catálogo y la tabla de zonas son autoridad del servidor
El servidor SHALL validar cada `items[].productId` contra el catálogo
(`catalog.products` de `src/data/content.js`), sin productos repetidos, con `qty` entero
entre 1 y `catalog.maxQtyPerProduct` (10) y al menos un ítem; y `zoneId` contra
`delivery.zones`, tomando de allí `zoneName` y `deliveryFee`. Si no pertenecen, SHALL
responder `422 VALIDATION_ERROR` con `items` o `zoneId` en `fields`.

#### Scenario: Producto fuera del catálogo
- **WHEN** un ítem trae un `productId` que no existe, está repetido o con `qty` 0 o mayor a 10
- **THEN** responde `422 VALIDATION_ERROR` con `items` en `fields` y no inserta nada

#### Scenario: Zona fuera de cobertura
- **WHEN** `zoneId` no está en la tabla de zonas
- **THEN** responde `422 VALIDATION_ERROR` con `zoneId` en `fields`

### Requirement: La franja se re-valida contra el reloj del servidor
El servidor SHALL validar que `date` sea una fecha real (`YYYY-MM-DD`), que `slot` sea una
franja del catálogo (`manana` | `tarde`) y que la combinación siga siendo pedible según
`isSlotOrderable` (lunes a sábado y antes del corte) al momento del POST; si el corte ya
pasó, SHALL responder `422 VALIDATION_ERROR` con `slot` en `fields`. No SHALL construir
`Date` desde `date`/horas fuera de `src/lib/time.js`.

#### Scenario: Franja cerrada entre elegir y enviar
- **WHEN** el cliente eligió la franja `tarde` de hoy a las 11:55 y envía el pedido a las
  12:05 (hora de Bogotá)
- **THEN** responde `422 VALIDATION_ERROR` con `slot` en `fields` y no inserta nada

#### Scenario: Fecha de domingo
- **WHEN** `date` cae domingo
- **THEN** responde `422 VALIDATION_ERROR` con `slot` en `fields`

### Requirement: Consulta de franjas pedibles
`GET /api/orders/slots` SHALL responder `200 { slots: [{ date, slot }, ...] }` con las
franjas pedibles de los próximos 7 días según el reloj del servidor en la zona del negocio
(`upcomingSlots`), sin cachear la respuesta (`Cache-Control: no-store`): el cliente nunca
decide qué franja es válida.

#### Scenario: Consulta en la mañana de un día hábil
- **WHEN** se consulta antes de las 08:00 de Bogotá de un día hábil
- **THEN** `slots` incluye `manana` y `tarde` de hoy y las franjas de los días hábiles
  siguientes, sin domingos

#### Scenario: Respuesta sin caché
- **WHEN** se consulta el endpoint
- **THEN** la respuesta lleva `Cache-Control: no-store`

### Requirement: Errores inesperados no filtran detalles
Ante un error no previsto, los endpoints SHALL responder `500 { error: "INTERNAL_ERROR" }`
sin exponer detalles internos, registrando el error en el log del servidor.

#### Scenario: Falla de base de datos
- **WHEN** el INSERT falla por una causa distinta a `P2002`
- **THEN** responde `500 { error: "INTERNAL_ERROR" }`
