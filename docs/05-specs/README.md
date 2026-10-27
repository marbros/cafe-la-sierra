# Specs — OpenSpec

Las specs viven en [`openspec/`](../../openspec/) en la raíz del repo (es donde las lee la
herramienta):

- **`openspec/specs/<capacidad>/spec.md`** — el comportamiento **vigente** de cada capacidad:
  `app-shell` (landing), `orders-data` (modelo), `business-time` (franjas y semáforo),
  `order-api` (API de pedidos), `checkout-flow` (compra) y `admin-board` (acceso + tablero).
- **`openspec/changes/archive/2026-10-26-*/`** — el **historial**: un change por ítem del
  [`BACKLOG`](../04-backlog/BACKLOG.md), cada uno con su `proposal.md`, `tasks.md` (ejecutadas)
  y los deltas de spec que introdujo.

Flujo usado: `propose → apply → archive`. Ningún comportamiento se implementó sin su spec;
si una spec y el código divergen, gana la spec y el código se corrige (o se propone un change).
