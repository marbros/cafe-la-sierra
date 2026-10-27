## 1. Catálogo ampliado

- [x] 1.1 Agregar en `src/data/content.js` las 3 bebidas de la casa — Cappuccino $12.000,
      Latte $13.000 y Mocha $14.000, presentación "Vaso 12 oz" — con `rating` e `image`
      (`/cup-1/2/3.png`), y el campo `kind` (`'bebida'` | `'grano'`) en los 5 productos
- [x] 1.2 Verificar que `POST /api/orders` acepta los ids nuevos sin tocar código del
      servidor: la validación existente recorre `catalog.products` (ADR-0009)

## 2. Carrito persistente

- [x] 2.1 Crear `src/lib/cart.js`: `readCart` saneado contra el catálogo (ids válidos,
      enteros positivos, tope `maxQtyPerProduct`), `writeCart` (persiste en localStorage
      `cls-cart` y emite `cls-cart-changed`), `addToCart`, `clearCart` y `cartCount`
- [x] 2.2 Hook `useCart`: carrito vivo sincronizado entre componentes (evento
      `cls-cart-changed`) y entre pestañas (evento `storage`), seguro ante SSR
      (`typeof window === 'undefined'`)

## 3. Vitrina y navbar

- [x] 3.1 `Catalog.jsx`: separar la vitrina por `kind` — `DrinkCard` con taza flotante,
      insignia de `rating` y precio; `BeanCard` con ícono de grano y chip
      `tueste · presentación` — conservando los `data-testid="producto-<id>"`
- [x] 3.2 Botón "+" (`Agregar <producto> al carrito`) en ambas tarjetas, que suma 1 unidad
      vía `addToCart` sin navegar; enlace "Completar mi pedido" → `/comprar` al cierre de
      la sección
- [x] 3.3 `Header.jsx`: ícono de carrito hacia `/comprar` en desktop
      (`data-testid="carrito"`) y en móvil, con `aria-label` del número de productos y
      badge (`data-testid="carrito-badge"`) con el total de unidades solo cuando hay
      carrito

## 4. Checkout conectado

- [x] 4.1 `ComprarCafe.jsx`: precargar las cantidades desde `readCart()` al montar, sobre
      el mapa vacío de los 5 productos
- [x] 4.2 Sincronizar cada cambio de cantidad con `writeCart` para que el badge del navbar
      y la landing vean el mismo carrito; mostrar el tueste solo para `kind: 'grano'`
- [x] 4.3 Vaciar el carrito con `clearCart()` al confirmar el pedido (respuesta ok del
      POST), antes de mostrar la pantalla de confirmación

## 5. Verificación

- [x] 5.1 E2E nuevo `tests/carrito.spec.js`: 2 Cappuccinos + 1 Café Medio desde la
      landing, badge en 3, checkout precargado (subtotal $49.000), confirmación con total
      $53.000 (Zona Centro) y carrito vacío al volver al inicio
- [x] 5.2 `npm run build` y `npm run test:e2e` en verde (flujos de compra y tablero
      existentes intactos)
