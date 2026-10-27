# admin-board Specification

## Purpose
Acceso y tablero del operador: login con clave única y cookie firmada con HMAC, API de
listado y transición de estados de pedidos protegida en el servidor, y tablero kanban de 5
columnas con semáforo contra la franja comprometida y filtros por día y zona.

## Requirements

### Requirement: Login emite una cookie de sesión firmada
`POST /api/admin/login` SHALL comparar la clave recibida con `ADMIN_PASSWORD` (comparación en
tiempo constante vía HMAC de ambas) y, si coincide, responder `200 { ok: true }` con una
cookie `admin_session` `HttpOnly`, `SameSite=Lax`, `Path=/`, `Secure` en producción, cuyo
valor es `<expiraEnMs>.<firmaHex>` firmado con HMAC-SHA256 usando `ADMIN_SESSION_SECRET`, con
expiración de `ADMIN_SESSION_TTL_HOURS` horas (default 168).

#### Scenario: Clave correcta
- **WHEN** se envía `POST /api/admin/login` con la clave correcta
- **THEN** responde `200` y un `Set-Cookie` de `admin_session` con `HttpOnly` y
  `SameSite=Lax` (y `Secure` en producción)

#### Scenario: Clave incorrecta
- **WHEN** se envía una clave incorrecta
- **THEN** responde `401 { "error": "INVALID_CREDENTIALS" }` sin `Set-Cookie`

#### Scenario: Body que no es JSON
- **WHEN** el body no se puede parsear como JSON
- **THEN** responde `422 { "error": "VALIDATION_ERROR", "fields": ["body"] }` sin cookie

#### Scenario: Servidor sin configurar
- **WHEN** `ADMIN_PASSWORD` o `ADMIN_SESSION_SECRET` no están definidas
- **THEN** responde `503 { "error": "ADMIN_NOT_CONFIGURED" }` y no emite cookie

### Requirement: Las cookies inválidas o vencidas no otorgan acceso
El sistema SHALL rechazar cookies con firma incorrecta, mal formadas o cuya expiración
firmada sea anterior al instante actual.

#### Scenario: Cookie manipulada
- **WHEN** se presenta una cookie con firma alterada o expiración modificada
- **THEN** se trata como sin sesión

#### Scenario: Cookie expirada
- **WHEN** la expiración firmada es anterior al instante actual
- **THEN** se trata como sin sesión

### Requirement: Rutas de admin protegidas en el servidor
El proxy (`src/proxy.js`) SHALL actuar como barrera optimista sobre `/admin/*` y
`/api/admin/*` (salvo `/admin/login` y `/api/admin/login`): sin sesión válida, las APIs
responden `401 { error: "UNAUTHORIZED" }` y las páginas redirigen a `/admin/login`. Además,
cada handler y página de admin SHALL re-verificar la sesión de forma autoritativa
(`hasValidAdminSession`), sin depender solo del proxy.

#### Scenario: API sin cookie
- **WHEN** `GET /api/admin/orders` se llama sin cookie válida
- **THEN** responde `401` y el cuerpo no contiene datos de pedidos

#### Scenario: Página sin sesión
- **WHEN** se navega a `/admin` sin cookie válida
- **THEN** la respuesta redirige a `/admin/login` sin renderizar datos

### Requirement: UI de acceso del operador
`/admin/login` SHALL ofrecer un formulario de clave que llama a `POST /api/admin/login`, con
el botón deshabilitado mientras la clave está vacía o el envío está en curso; ante `401`
SHALL mostrar "Clave incorrecta." sin navegar. Con sesión válida, `/admin/login` SHALL
redirigir a `/admin` y, al autenticar, el formulario SHALL navegar a `/admin`.

#### Scenario: Autenticación exitosa
- **WHEN** el operador envía la clave correcta en `/admin/login`
- **THEN** se navega a `/admin` y el tablero carga

#### Scenario: Clave incorrecta en el formulario
- **WHEN** se envía una clave incorrecta
- **THEN** se muestra "Clave incorrecta." y no se navega

### Requirement: Listado de pedidos con filtros por día y zona
`GET /api/admin/orders` con sesión válida SHALL responder `200 { orders: [...] }` con los
pedidos serializados (`date` como `YYYY-MM-DD`) ordenados por `date`, `slot` y `createdAt`
ascendentes, aceptando los filtros opcionales `?date=YYYY-MM-DD` (fecha real, si no `422
VALIDATION_ERROR` con `date`) y `?zone=<id>` (zona de `delivery.zones`, si no `422` con
`zone`). La respuesta SHALL no cachearse.

#### Scenario: Listado completo ordenado
- **WHEN** existen pedidos insertados en desorden y se llama sin filtros
- **THEN** la lista llega ordenada por fecha, franja y hora de creación ascendentes

#### Scenario: Filtro por día y zona
- **WHEN** se llama con `?date=2026-11-03&zone=centro`
- **THEN** la lista contiene solo los pedidos de esa fecha y esa zona

#### Scenario: Filtro inválido
- **WHEN** se llama con `?date=abc` o `?zone=oriente`
- **THEN** responde `422 VALIDATION_ERROR` con el campo correspondiente en `fields`

### Requirement: Transiciones de estado válidas
El sistema SHALL permitir solo las transiciones del tablero: `NUEVO → PREPARANDO`,
`PREPARANDO → EN_CAMINO`, `EN_CAMINO → ENTREGADO`, y `→ CANCELADO` desde cualquier estado no
final; `ENTREGADO` y `CANCELADO` SHALL no tener transiciones de salida (`TRANSITIONS` en
`src/lib/orders.js`).

#### Scenario: Saltarse un paso
- **WHEN** se intenta mover un pedido `NUEVO` directamente a `ENTREGADO`
- **THEN** la transición se rechaza

#### Scenario: Cancelar en cualquier punto del flujo
- **WHEN** se mueve un pedido `NUEVO`, `PREPARANDO` o `EN_CAMINO` a `CANCELADO`
- **THEN** la transición se acepta

### Requirement: PATCH de estado condicional al estado actual
`PATCH /api/admin/orders/:id` con sesión válida y body `{ status }` SHALL: responder `404
NOT_FOUND` si el `id` no es uuid o el pedido no existe; `422 VALIDATION_ERROR` si el body no
es JSON o `status` no está en `STATUSES`; `409 { error: "INVALID_TRANSITION", from, to }` si
la transición no está permitida desde el estado actual; y aplicar el update de forma
condicional al estado leído (`updateMany where { id, status: actual }`) respondiendo `409`
con `from: "STALE"` si otra sesión ya movió el pedido. En éxito SHALL responder `200` con el
pedido actualizado.

#### Scenario: Transición válida
- **WHEN** se envía `{ "status": "PREPARANDO" }` para un pedido `NUEVO`
- **THEN** responde `200` con el pedido en `PREPARANDO`

#### Scenario: Transición inválida
- **WHEN** se envía `{ "status": "ENTREGADO" }` para un pedido `NUEVO`
- **THEN** responde `409 { "error": "INVALID_TRANSITION", "from": "NUEVO", "to": "ENTREGADO" }`
  y el pedido no cambia

#### Scenario: Pedido movido por otra pestaña
- **WHEN** dos pestañas intentan mover el mismo pedido y la segunda llega con el estado ya
  cambiado
- **THEN** la segunda recibe `409` con `from: "STALE"` y el estado no se pisa

#### Scenario: Sin sesión
- **WHEN** se llama al PATCH sin cookie válida
- **THEN** responde `401 UNAUTHORIZED` y el pedido no cambia

### Requirement: Tablero kanban de 5 columnas
`/admin` con sesión válida SHALL renderizar el tablero con exactamente cinco columnas en
orden — `NUEVO`, `PREPARANDO`, `EN_CAMINO`, `ENTREGADO`, `CANCELADO` — con las etiquetas de
`board.statusLabels` y el contador de tarjetas por columna. Cada tarjeta SHALL mostrar
cliente, fecha legible y franja, zona y dirección, teléfono, ítems, notas (si hay) y total, y
SHALL ofrecer solo los botones de las transiciones válidas desde su estado
(`board.actionLabels`).

#### Scenario: Columnas y tarjetas
- **WHEN** el operador abre `/admin` con pedidos en varios estados
- **THEN** cada pedido aparece como tarjeta en la columna de su estado y las columnas vacías
  muestran "Sin pedidos"

#### Scenario: Acciones según el estado
- **WHEN** una tarjeta está en `NUEVO`
- **THEN** sus únicos botones son "Preparar" y "Devolver / Cancelar"; una tarjeta `ENTREGADO`
  o `CANCELADO` no tiene botones

#### Scenario: Mover una tarjeta
- **WHEN** el operador pulsa una acción y el PATCH responde `200`
- **THEN** la tarjeta se mueve a la columna del nuevo estado; si el PATCH falla (`409`), el
  tablero se recarga para re-sincronizar

### Requirement: Semáforo visible en cada tarjeta
Cada tarjeta no final SHALL mostrar el semáforo calculado con `trafficLight` contra la franja
comprometida: punto verde con "Con tiempo", punto amarillo con "Entrega hoy", punto rojo
parpadeante con "Franja vencida". El tablero SHALL explicar la convención en su encabezado y
SHALL refrescar pedidos y semáforo automáticamente (recarga periódica cada 60 segundos).

#### Scenario: Pedido en riesgo
- **WHEN** una tarjeta `NUEVO` tiene su franja vencida
- **THEN** muestra el punto rojo parpadeante con la etiqueta "Franja vencida"

#### Scenario: Refresco automático
- **WHEN** el tablero queda abierto
- **THEN** los pedidos se recargan solos periódicamente sin interacción del operador

### Requirement: Filtros del tablero por día y zona
El tablero SHALL ofrecer un filtro por día (input de fecha) y por zona (selector con las
zonas de `delivery.zones` más "Todas"), que recargan el listado vía `GET /api/admin/orders`
con los parámetros correspondientes, y un botón "Limpiar filtros" visible solo cuando hay
algún filtro activo. Si el listado responde `401`, el tablero SHALL redirigir a
`/admin/login`.

#### Scenario: Filtrar por zona
- **WHEN** el operador elige una zona en el filtro
- **THEN** el tablero muestra solo los pedidos de esa zona en todas las columnas

#### Scenario: Sesión vencida con el tablero abierto
- **WHEN** el listado responde `401` (cookie vencida)
- **THEN** el navegador va a `/admin/login`
