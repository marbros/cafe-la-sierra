## 1. API del tablero

- [x] 1.1 `GET /api/admin/orders`: sesión autoritativa, filtros `date` (fecha real) y `zone`
      (de `delivery.zones`) con 422 ante valores inválidos, orden `date`/`slot`/`createdAt`
      ascendente y `Cache-Control: no-store`
- [x] 1.2 `TRANSITIONS` en `src/lib/orders.js` (NUEVO→PREPARANDO→EN_CAMINO→ENTREGADO,
      CANCELADO desde cualquier no final; finales sin salida)
- [x] 1.3 `PATCH /api/admin/orders/:id`: 404 con id no uuid o inexistente, 422 con status
      fuera de `STATUSES`, 409 `INVALID_TRANSITION` con `{ from, to }`, `updateMany`
      condicional al estado leído (count 0 → 409 `from: "STALE"`) y 200 con el pedido
      actualizado

## 2. Tablero

- [x] 2.1 `src/components/admin/Tablero.jsx`: 5 columnas en orden con etiquetas de
      `board.statusLabels`, contador por columna y "Sin pedidos" en columnas vacías
- [x] 2.2 Tarjeta: cliente, fecha legible + franja, zona y dirección, teléfono, ítems, notas
      y total; botones solo de las transiciones válidas con `board.actionLabels`
- [x] 2.3 Semáforo por tarjeta con `trafficLight`: verde "Con tiempo", amarillo "Entrega
      hoy", rojo parpadeante (`animate-pulse-danger`) "Franja vencida"; leyenda en el
      encabezado
- [x] 2.4 Filtros por día (input date) y zona (select con "Todas") + botón "Limpiar
      filtros"; recarga automática cada 60 s; `401` → redirección a `/admin/login`; PATCH
      fallido → recarga para re-sincronizar
- [x] 2.5 `/admin` renderiza `Tablero` tras la verificación autoritativa de sesión

## 3. Verificación

- [x] 3.1 `npm run test:unit` (transiciones y semáforo) y `npm run build` en verde
- [x] 3.2 curl del PATCH: transición válida 200, salto inválido 409, estado pisado 409
      STALE, sin cookie 401
- [x] 3.3 E2E Playwright: login, pedido visible en NUEVO, moverlo hasta ENTREGADO y filtros
      por día y zona
