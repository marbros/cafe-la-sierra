# ADR-0004 — Una sola tabla `orders` desnormalizada

- Estado: aceptada · Fecha: 2026-10-26

## Contexto

El dominio tiene 2 productos estáticos, 4 zonas estáticas y compra como invitado (sin
cuentas, PRD no-alcance). Normalizar (orders, order_items, products, customers, zones)
agregaría joins y migraciones sin ningún caso de uso que los pida.

## Decisión

Una tabla **`orders`**: los ítems como snapshot `jsonb` (`productId`, `title`, `unitPrice`,
`qty` calculados por el servidor), la zona como `zone_id` + `zone_name` snapshot, y los
montos (`subtotal`, `delivery_fee`, `total`) materializados. El catálogo y las zonas viven
en `src/data/content.js` (ADR-0010).

## Consecuencias

- (+) Un pedido = una fila = una tarjeta del tablero; el historial no cambia si el dueño
  renombra un café o sube una tarifa (snapshot).
- (+) Queries del tablero triviales (`where date/zone`, índice `(date, zone_id)`).
- (−) Reportes por producto requerirían leer el jsonb; los reportes están fuera de alcance.

## Reemplaza a

Diseño v1 con `order_items` normalizado: descartado por complejidad sin beneficio.
