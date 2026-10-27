# ADR-0005 — API REST simple y máquina de estados explícita del pedido

- Estado: aceptada · Fecha: 2026-10-26

## Contexto

Dos clientes de la API (checkout y tablero), ambos propios. El tablero mueve pedidos entre
5 estados y puede estar abierto en varias pestañas a la vez.

## Decisión

REST mínimo con códigos semánticos (`201/200/401/404/409/422/5xx`) y errores
`{error: CODE, fields?}`. Los estados y sus transiciones son datos
(`TRANSITIONS` en `src/lib/orders.js`):
`NUEVO → PREPARANDO → EN_CAMINO → ENTREGADO`, con `CANCELADO` (devuelto/cancelado) como
final alternativo desde cualquier estado no final. El `PATCH` de estado es **condicional
al estado actual** (`updateMany where {id, status}`): si otra pestaña movió la tarjeta
primero, responde `409 INVALID_TRANSITION` y el tablero se re-sincroniza.

## Consecuencias

- (+) Imposible saltar estados o "resucitar" un pedido entregado, incluso con requests a mano.
- (+) Concurrencia de pestañas resuelta sin locks: última lectura no pisa al otro.
- (−) No hay endpoint genérico de edición; cambiar datos de entrega queda fuera de alcance.
