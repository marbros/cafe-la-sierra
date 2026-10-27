# ADR-0009 — El servidor es la fuente de verdad: precios y totales nunca vienen del cliente

- Estado: aceptada · Fecha: 2026-10-26

## Contexto

El body de `POST /api/orders` lo arma un navegador cualquiera: con DevTools se puede mandar
`unitPrice: 1`, una zona inexistente con tarifa 0 o un producto inventado.

## Decisión

`parseOrderBody` (`src/lib/orders.js`) valida **todo** el body y reconstruye los datos
económicos contra `src/data/content.js`: los ítems solo aportan `productId` y `qty`
(1..10, sin repetidos); título y precio unitario salen del catálogo; la tarifa sale de la
tabla de zonas; `subtotal`, `delivery_fee` y `total` se calculan en el servidor. Teléfono
(7–15 dígitos), dirección (≥8 chars), franja (corte, lunes-sábado) y `idempotencyKey`
(uuid) se validan con `422 {fields}` por campo.

## Consecuencias

- (+) Manipular el DOM o el fetch no altera lo que se cobra (test unitario lo cubre).
- (+) Mensajes de error por campo reutilizables por el checkout.
- (−) Catálogo nuevo ⇒ deploy (ADR-0010, aceptado en el PRD).
