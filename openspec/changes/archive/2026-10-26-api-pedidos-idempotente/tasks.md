## 1. Helpers

- [x] 1.1 `src/lib/orders.js`: `parseOrderBody` con validación campo a campo (`fields`),
      snapshot de ítems y `subtotal`/`deliveryFee`/`total` calculados contra
      `src/data/content.js`, franja re-validada con `isSlotOrderable`, `idempotencyKey`
      uuid normalizada a minúsculas
- [x] 1.2 `dateToColumn` (valor `@db.Date` desde `YYYY-MM-DD`) y `serializeOrder` (fila
      Prisma → JSON público con `date` como `YYYY-MM-DD`)

## 2. Endpoints

- [x] 2.1 `src/app/api/orders/route.js`: POST con orden body JSON → `parseOrderBody` →
      INSERT directo → ante `P2002`, `findUnique({ idempotencyKey })` y `200` replay;
      errores inesperados `500 INTERNAL_ERROR` sin detalles
- [x] 2.2 `src/app/api/orders/slots/route.js`: GET con `upcomingSlots(new Date(), 7)` y
      `Cache-Control: no-store`

## 3. Verificación

- [x] 3.1 `src/lib/orders.test.js` con `node:test`: campos faltantes, teléfono/dirección
      inválidos, producto repetido o fuera de catálogo, zona desconocida, franja pasada su
      corte, montos del servidor ante precios alterados
- [x] 3.2 `npm run test:unit` y `npm run build` en verde
- [x] 3.3 curl contra `npm run dev` + rama dev de Neon: 201, replay 200 con la misma clave,
      422 con `fields`, slots sin domingos ni franjas cortadas
