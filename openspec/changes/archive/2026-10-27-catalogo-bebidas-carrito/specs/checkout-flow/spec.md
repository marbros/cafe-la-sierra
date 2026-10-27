## ADDED Requirements

### Requirement: Integración con el carrito persistente
Al montar, `/comprar` SHALL precargar las cantidades desde el carrito persistido en
localStorage (`readCart` de `src/lib/cart.js`, saneado contra el catálogo: solo ids
válidos, cantidades enteras positivas con tope `maxQtyPerProduct`). Cada cambio de
cantidad SHALL escribirse de vuelta al carrito (`writeCart`), de modo que el contador del
navbar y la landing reflejen el mismo estado. Tras un pedido aceptado por el servidor
(`201` o `200` de replay), el flujo SHALL vaciar el carrito (`clearCart`) antes de mostrar
la pantalla de confirmación. El carrito es solo conveniencia de UI: el servidor re-valida
productos, cantidades y precios contra el catálogo en cada POST (ADR-0009).

#### Scenario: Llegar al checkout con el carrito armado
- **WHEN** el usuario agregó 2 cappuccinos y 1 café medio desde la landing y abre
  `/comprar`
- **THEN** las cantidades aparecen precargadas (2 y 1) y el subtotal refleja los precios
  del catálogo

#### Scenario: Cambiar cantidades en el checkout
- **WHEN** el usuario sube o baja una cantidad en `/comprar`
- **THEN** el carrito en localStorage se actualiza y el contador del navbar muestra el
  nuevo total de unidades

#### Scenario: El carrito se vacía al confirmar
- **WHEN** el servidor acepta el pedido y se muestra la confirmación
- **THEN** el carrito queda vacío: al volver a la landing el ícono del navbar no muestra
  badge

## MODIFIED Requirements

### Requirement: Carrito sobre el catálogo con totales en vivo
`/comprar` SHALL mostrar los productos del catálogo (`catalog.products`) — bebidas y café
en grano — con su presentación y precio (y el tueste para el grano), y un control de
cantidad por producto (de 0 a `catalog.maxQtyPerProduct`). El resumen SHALL mostrar
subtotal, tarifa de domicilio de la zona elegida y total (efectivo contra entrega),
recalculados en vivo.

#### Scenario: Agregar unidades
- **WHEN** el usuario sube la cantidad de un producto a 2
- **THEN** el subtotal muestra 2 × el precio del catálogo y el total se actualiza

#### Scenario: Tope de cantidad
- **WHEN** el usuario intenta pasar de 10 unidades de un producto
- **THEN** la cantidad se queda en 10
