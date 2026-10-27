# orders-data Specification

## Purpose
Define el modelo de datos persistente y compartido de los pedidos, y la conexión a la base
de datos que lo respalda: una tabla única `orders` desnormalizada (un pedido = una tarjeta
del tablero) sobre la que la API pública escribe de forma idempotente y el tablero del
operador lee y transiciona estados.

## Requirements

### Requirement: Almacenamiento persistente y compartido de pedidos
El sistema SHALL persistir cada pedido en una tabla `orders` en una base de datos Postgres
compartida (Neon), de forma que sobreviva a refrescos de página y reinicios de la aplicación
y sea legible desde cualquier sesión que consulte la base.

#### Scenario: Un pedido escrito es legible desde otra conexión
- **WHEN** se inserta una fila en `orders` a través de una conexión a la base de datos
- **THEN** una consulta posterior desde una conexión distinta devuelve esa fila con todos sus
  campos intactos

### Requirement: Esquema desnormalizado de `orders`
El sistema SHALL definir la tabla `orders` con las columnas: `id` (uuid, PK, generado con
`gen_random_uuid()`), `items` (JSON con el snapshot de productos: `productId`, `title`,
`unitPrice`, `qty`), `subtotal` (entero), `delivery_fee` (entero), `total` (entero),
`customer_name`, `customer_phone`, `address`, `zone_id`, `zone_name` (texto), `date`
(fecha), `slot` (texto: `manana` | `tarde`), `status` (texto, default `NUEVO`), `notes`
(texto, nullable), `created_at` y `updated_at` (timestamp con zona horaria) e
`idempotency_key` (uuid), sin tablas relacionadas separadas para clientes, productos o zonas.

#### Scenario: notes es opcional
- **WHEN** se inserta un pedido sin especificar `notes`
- **THEN** la fila se guarda con `notes` en null, sin error

#### Scenario: Campos obligatorios se exigen
- **WHEN** se intenta insertar un pedido omitiendo un campo obligatorio (por ejemplo
  `customer_phone`)
- **THEN** la base de datos rechaza el insert

#### Scenario: El pedido nace en NUEVO
- **WHEN** se inserta un pedido sin especificar `status`
- **THEN** la fila se guarda con `status = 'NUEVO'`

### Requirement: Snapshot de ítems y montos calculados por el servidor
La columna `items` SHALL guardar el snapshot de productos (id, título, precio unitario,
cantidad) calculado por el servidor contra el catálogo de `src/data/content.js`, y
`subtotal`, `delivery_fee` y `total` SHALL ser los montos calculados por el servidor; nunca
los que mande el cliente.

#### Scenario: El pedido conserva los precios del momento de la compra
- **WHEN** un pedido se guardó y después cambia el precio de un producto en el catálogo
- **THEN** la fila conserva en `items` el título y el precio unitario vigentes al momento de
  la compra

### Requirement: Clave de idempotencia única por intento de compra
El sistema SHALL almacenar en cada pedido una `idempotency_key` (uuid) obligatoria y SHALL
impedir, a nivel de base de datos (constraint `UNIQUE`), que existan dos filas con la misma
`idempotency_key`. Esta SHALL ser la única restricción de unicidad además de la PK.

#### Scenario: Clave de idempotencia duplicada
- **WHEN** dos inserts usan el mismo valor de `idempotency_key`, aunque el resto de campos
  difiera
- **THEN** el segundo insert es rechazado por la base de datos por violación de la
  restricción de unicidad

### Requirement: Estados del pedido como texto validado en la aplicación
`status` SHALL ser texto con exactamente cinco valores posibles — `NUEVO`, `PREPARANDO`,
`EN_CAMINO`, `ENTREGADO`, `CANCELADO` — validados en `src/lib/orders.js` (`STATUSES`), no
con un enum de base de datos.

#### Scenario: Estado fuera de la lista
- **WHEN** la capa de aplicación recibe un estado que no está en `STATUSES`
- **THEN** lo rechaza antes de escribir en la base

### Requirement: Índice para los filtros del tablero
La tabla SHALL tener un índice compuesto sobre `(date, zone_id)` para servir los filtros por
día y zona del tablero del operador.

#### Scenario: Listado filtrado
- **WHEN** el tablero consulta los pedidos de un día y una zona
- **THEN** la consulta se resuelve usando el índice `(date, zone_id)`

### Requirement: Conexión compatible con funciones serverless
El sistema SHALL exponer un cliente Prisma único (`src/lib/db.js`) construido con el adapter
de Neon (`@prisma/adapter-neon` sobre `DATABASE_URL`) y cacheado en `globalThis`, apto para
invocaciones serverless de Vercel y para el hot-reload de desarrollo.

#### Scenario: Consulta desde una invocación fría
- **WHEN** se ejecuta una consulta desde una invocación serverless nueva, sin estado previo
- **THEN** la consulta se completa sin agotar el límite de conexiones de la base de datos
