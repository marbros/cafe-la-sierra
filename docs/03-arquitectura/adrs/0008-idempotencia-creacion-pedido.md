# ADR-0008 — Creación de pedido idempotente por constraint UNIQUE

- Estado: aceptada · Fecha: 2026-10-26

## Contexto

PRD caso borde 5: doble clic en "Confirmar". Deshabilitar el botón cubre el doble clic,
pero no el reintento de red (timeout + retry) ni un refresh que re-envía el formulario:
ambos crearían pedidos duplicados y domicilios fantasma que cuestan plata.

## Decisión

El checkout genera una **`idempotencyKey` (uuid) por intento de compra** y la manda en el
body. La columna `idempotency_key` es **UNIQUE**: ante el error `P2002`, el handler busca el
pedido existente por esa clave y responde **`200` con el mismo pedido** (replay), nunca crea
otro. La garantía vive en la base de datos, no en el frontend.

## Consecuencias

- (+) Cero pedidos duplicados bajo doble clic, retry o refresh — verificable por test E2E.
- (+) El cliente puede reintentar con confianza ("tu pedido no se duplicará").
- (−) Una columna y un roundtrip extra en el caso raro de replay; irrelevante.

## Hallazgo origen

Revisión adversarial #1 sobre el diseño v1 (que confiaba solo en `disabled`).
