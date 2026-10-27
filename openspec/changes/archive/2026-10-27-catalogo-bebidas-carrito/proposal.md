## Why

Tras entregar el MVP, el dueño amplió el alcance (PRD, Ampliación v1.1): además de los 2
cafés en grano, el negocio quiere vender las 3 bebidas de la casa — Cappuccino $12.000,
Latte $13.000 y Mocha $14.000, en vaso de 12 oz — y bajar la fricción entre la vitrina y el
checkout: hoy el cliente elige mentalmente en la landing pero vuelve a armar las cantidades
desde cero en `/comprar`. El "carrito simple o compra directa" que el alcance original
dejaba abierto queda resuelto como **carrito persistente en localStorage, sin cuentas**.
La API y el modelo de datos no cambian: el servidor ya valida ítems, cantidades y precios
contra el catálogo de `src/data/content.js` en cada POST (ADR-0009), así que ampliar el
catálogo y agregar el carrito es un cambio de datos + UI.

## What Changes

- `src/data/content.js`: el catálogo pasa de 2 a 5 productos. Nuevo campo `kind`
  (`'grano'` | `'bebida'`) para separar el café en grano (340g, con `roast`) de las
  bebidas de la casa (Vaso 12 oz, con `rating` e `image` — solo UI; el id y el precio
  siguen siendo autoridad del servidor).
- Nuevo `src/lib/cart.js`: carrito del cliente como `{ productId: qty }` persistido en
  localStorage (clave `cls-cart`). Lectura saneada (solo ids del catálogo, cantidades
  enteras positivas con tope `maxQtyPerProduct`), `addToCart`/`writeCart`/`clearCart`/
  `cartCount` y hook `useCart` sincronizado entre componentes (evento `cls-cart-changed`)
  y entre pestañas (evento `storage`).
- `src/components/Catalog.jsx`: la vitrina separa `DrinkCard` (taza flotante con `image`,
  insignia de `rating`) de `BeanCard` (ícono de grano, chip de tueste y presentación);
  cada tarjeta tiene un botón "+" que agrega 1 unidad al carrito sin salir de la landing,
  y la sección cierra con el enlace "Completar mi pedido" → `/comprar`.
- `src/components/Header.jsx`: ícono de carrito en el navbar (desktop y móvil) que navega
  a `/comprar`, con `aria-label` que anuncia el número de productos y un badge con el
  total de unidades cuando el carrito no está vacío, actualizado en vivo vía `useCart`.
- `src/components/checkout/ComprarCafe.jsx`: al montar precarga las cantidades desde el
  carrito (`readCart`); cada cambio de cantidad se escribe de vuelta (`writeCart`) para
  que el badge del navbar vea el mismo estado; al confirmar el pedido con éxito se vacía
  el carrito (`clearCart`). El resto del flujo (validación, idempotencia, franjas,
  confirmación) no cambia.
- E2E nuevo `tests/carrito.spec.js`: agregar bebidas y grano desde la landing, contador
  del navbar, checkout precargado, confirmación y carrito vacío al volver.
- Sin cambios en API routes, `src/lib/orders.js`, `src/lib/time.js` ni migraciones: el
  catálogo ampliado entra por la misma validación server-side existente (ADR-0009).

## Capabilities

### New Capabilities
<!-- ninguna: el carrito es conveniencia de UI sobre capacidades existentes -->

### Modified Capabilities
- `app-shell`: la vitrina de la landing muestra bebidas (`kind: 'bebida'`) y grano
  (`kind: 'grano'`) con botón "+" que agrega al carrito, y el navbar suma el ícono de
  carrito con contador (desktop y móvil) que lleva a `/comprar`.
- `checkout-flow`: `/comprar` se integra con el carrito persistente — precarga las
  cantidades al montar, las sincroniza al cambiarlas y lo vacía al confirmar el pedido.

## Impact

- Código modificado: `src/data/content.js`, `src/components/Catalog.jsx`,
  `src/components/Header.jsx`, `src/components/checkout/ComprarCafe.jsx`.
- Código nuevo: `src/lib/cart.js`; test nuevo `tests/carrito.spec.js`.
- Sin impacto de backend: no cambian API routes, validaciones del servidor, esquema ni
  migraciones; `order-api` y `orders-data` quedan intactas (ADR-0009 ya cubría el
  catálogo como autoridad del servidor).
- Documentación: `docs/01-producto/PRD.md` (Ampliación v1.1) y
  `docs/04-backlog/BACKLOG.md` (ítem 9).
