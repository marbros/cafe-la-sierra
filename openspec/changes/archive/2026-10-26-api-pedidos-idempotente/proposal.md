## Why

El flujo de compra todavía no puede escribir nada: existe la tabla `orders` (#2) y el módulo
de tiempo (#3), pero no hay contrato HTTP. Para que el cliente compre solo desde la landing
(PRD) hacen falta los endpoints públicos que creen el pedido con validación server-side —
catálogo, zonas y franjas como autoridad del servidor — de forma idempotente (caso borde 5:
doble envío), y que publiquen qué franjas siguen pedibles (casos borde 3 y 6). Es el backlog
#4 y desbloquea la conexión del checkout (#5).

## What Changes

- Nuevo `POST /api/orders`: valida en el servidor (campos, teléfono 7–15 dígitos, dirección
  mínima, productos y cantidades contra `catalog`, zona contra `delivery.zones`, franja
  re-validada con `isSlotOrderable`), calcula snapshot y montos, hace `INSERT` directo y es
  idempotente por `idempotencyKey` (`201` creado, `200` replay ante `P2002`,
  `422 VALIDATION_ERROR` con `fields`, `500 INTERNAL_ERROR`).
- Nuevo `GET /api/orders/slots`: franjas pedibles de los próximos 7 días según el reloj del
  servidor en la zona del negocio (`upcomingSlots`), sin caché.
- Helpers en `src/lib/orders.js`: `parseOrderBody` (validación + montos del servidor),
  `dateToColumn` y `serializeOrder`; constantes `STATUSES` y `TRANSITIONS`.
- Fuera de alcance: UI del checkout (#5), `/api/admin/*` (#6, #7) y rate limiting (riesgo
  aceptado POC).

## Capabilities

### New Capabilities
- `order-api`: contrato HTTP público de creación idempotente de pedidos y consulta de
  franjas pedibles.

### Modified Capabilities
<!-- ninguna: orders-data y business-time se consumen sin cambiar sus requisitos -->

## Impact

- Código nuevo: `src/app/api/orders/route.js`, `src/app/api/orders/slots/route.js`,
  `src/lib/orders.js`, `src/lib/orders.test.js`.
- Usa `src/lib/db.js` (Prisma) y `src/lib/time.js` (único origen de "hoy", cortes e
  instantes). Respuestas con `Cache-Control: no-store` y `dynamic = 'force-dynamic'`. Sin
  dependencias ni migraciones nuevas.
