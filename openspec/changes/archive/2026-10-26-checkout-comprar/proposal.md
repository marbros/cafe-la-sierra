## Why

La API de pedidos (#4) ya existe pero la ruta `/comprar` sigue sin flujo real: el cliente
interesado todavía no puede comprar solo (PRD: fricción de venta). Este change conecta la UI
al contrato de `order-api`: carrito sobre el catálogo, formulario con zona y tarifa visible,
franjas servidas por el servidor, envío idempotente con botón deshabilitado (caso borde 5) y
pantalla de confirmación. Es el backlog #5.

## What Changes

- Nuevo `src/components/checkout/ComprarCafe.jsx` (client component) renderizado en
  `/comprar`:
  - Carrito con steppers de cantidad (0 a `catalog.maxQtyPerProduct`) sobre los 2 cafés,
    con subtotal, tarifa de la zona y total en vivo.
  - Formulario: nombre, teléfono, dirección, selector de zona con tarifa visible
    (`Zona — domicilio $X`), selector de día y franja poblado con `GET /api/orders/slots`,
    y notas opcionales.
  - Validación en el cliente espejo de la del servidor, con errores visibles a partir del
    primer intento de envío.
  - `idempotencyKey` (`crypto.randomUUID()`) generada una sola vez por intento de compra;
    botón "Confirmar pedido" deshabilitado mientras envía ("Confirmando…").
  - Manejo de franja cerrada (`422` con `slot` en `fields`): limpia la franja, recarga los
    slots y pide elegir otra; error de red informa que el reintento no duplica.
  - Pantalla de confirmación con los valores devueltos por el servidor (id corto, ítems,
    domicilio, total en efectivo, franja y dirección).
- Fuera de alcance: pagos online, cuentas de cliente y notificaciones (No alcance del PRD);
  tablero del operador (#6, #7).

## Capabilities

### New Capabilities
- `checkout-flow`: comportamiento del flujo de compra en `/comprar`.

### Modified Capabilities
<!-- ninguna: app-shell ya definía /comprar como destino; order-api se consume sin cambios -->

## Impact

- Código nuevo: `src/components/checkout/ComprarCafe.jsx`; `src/app/comprar/page.jsx`
  renderiza el flujo entre `Header` y `Footer`.
- Consume `GET /api/orders/slots` y `POST /api/orders`; usa `formatDateLabel` de
  `src/lib/time.js` y `delivery.slotLabels`/`formatCop` de `src/data/content.js`. Sin
  dependencias ni migraciones nuevas.
