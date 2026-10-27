## Why

Los pedidos ya entran por la web (#5) pero el dueño sigue sin visibilidad: no hay dónde ver
qué se debe entregar y cuándo (PRD: caos operativo). Con el acceso de admin ya montado (#6),
este change entrega el tablero kanban con los 5 estados, el semáforo contra la franja
comprometida y los filtros por día y zona. Es el último ítem del backlog (#7).

## What Changes

- Nuevo `GET /api/admin/orders`: listado para el tablero con filtros opcionales
  `?date=YYYY-MM-DD` y `?zone=<id>` (validados; `422 VALIDATION_ERROR` si son inválidos),
  ordenado por `date`, `slot` y `createdAt` ascendentes; `401` sin sesión.
- Nuevo `PATCH /api/admin/orders/:id`: transición de estado con las reglas de `TRANSITIONS`
  (`NUEVO → PREPARANDO → EN_CAMINO → ENTREGADO`, `CANCELADO` desde cualquier no final);
  `404` si no existe, `422` si el status no es válido, `409 INVALID_TRANSITION` si el salto
  no está permitido, y update condicional al estado leído (`409` con `from: "STALE"` si otra
  pestaña ya lo movió).
- Nuevo `src/components/admin/Tablero.jsx` renderizado en `/admin`: 5 columnas con contador,
  tarjetas con los datos del pedido y solo los botones de transición válidos
  (`board.actionLabels`), semáforo por tarjeta (`trafficLight`: verde "Con tiempo", amarillo
  "Entrega hoy", rojo parpadeante "Franja vencida"), filtros por día y zona con "Limpiar
  filtros", recarga automática cada 60 s y redirección a `/admin/login` ante `401`.
- Fuera de alcance: asignación de domiciliarios, ruteo, reportes y notificaciones al cliente
  (No alcance del PRD).

## Capabilities

### New Capabilities
<!-- ninguna nueva: se amplía admin-board -->

### Modified Capabilities
- `admin-board`: a la parte de acceso (#6) se le agregan el listado con filtros, las
  transiciones de estado condicionales, el tablero de 5 columnas y el semáforo.

## Impact

- Código nuevo: `src/app/api/admin/orders/route.js`, `src/app/api/admin/orders/[id]/route.js`,
  `src/components/admin/Tablero.jsx`; `/admin` pasa de placeholder protegido a renderizar el
  tablero.
- Usa `STATUSES`/`TRANSITIONS`/`serializeOrder` de `src/lib/orders.js`,
  `trafficLight`/`formatDateLabel` de `src/lib/time.js` y el copy de `board` en
  `src/data/content.js`. Sin dependencias ni migraciones nuevas (el índice `(date, zone_id)`
  ya existía, #2).
