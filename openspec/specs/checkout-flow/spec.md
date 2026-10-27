# checkout-flow Specification

## Purpose
Comportamiento del flujo de compra en `/comprar` (`ComprarCafe.jsx`): cantidades sobre el
catálogo conectadas al carrito persistente del navegador (`src/lib/cart.js`), formulario de
datos de entrega con zona y tarifa visible, franjas servidas por la API, envío idempotente
con botón deshabilitado y pantalla de confirmación. El componente solo guía y evita errores
obvios: el servidor re-valida todo.

## Requirements

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

### Requirement: Zona con tarifa de domicilio visible
El selector de zona SHALL listar las zonas de `delivery.zones` mostrando en cada opción el
nombre y la tarifa (`Zona — domicilio $X`), y al elegir una zona el resumen SHALL mostrar esa
tarifa sumada al total. Sin zona elegida, la tarifa se muestra como pendiente (`—`).

#### Scenario: Elegir zona
- **WHEN** el usuario elige "Zona Centro — domicilio $4.000"
- **THEN** el resumen muestra el domicilio de $4.000 y el total = subtotal + 4.000

### Requirement: Las franjas vienen del servidor
El selector de día y franja SHALL poblarse con `GET /api/orders/slots` (opciones
`fecha legible — etiqueta de franja`), SHALL estar deshabilitado mientras cargan las franjas
y no SHALL ofrecer ninguna franja que el servidor no haya devuelto.

#### Scenario: Carga de franjas
- **WHEN** el usuario abre `/comprar`
- **THEN** el selector muestra "Cargando franjas…" deshabilitado y, al responder la API,
  ofrece exactamente las franjas devueltas

### Requirement: Validación en el cliente antes de enviar
El formulario SHALL validar en el cliente — al menos 1 bolsa, nombre no vacío, teléfono de 7
a 15 dígitos, dirección de al menos 8 caracteres, zona elegida y franja elegida — y SHALL
mostrar los mensajes de error solo a partir del primer intento de envío, sin llamar a la API
mientras haya errores.

#### Scenario: Envío con formulario incompleto
- **WHEN** el usuario pulsa "Confirmar pedido" sin elegir café ni zona
- **THEN** se muestran los mensajes de error bajo los campos correspondientes y no se hace
  ningún POST

### Requirement: Envío idempotente con botón deshabilitado
El flujo SHALL generar una `idempotencyKey` (`crypto.randomUUID()`) una sola vez por intento
de compra (al montar el componente) y enviarla en el POST; el botón "Confirmar pedido" SHALL
deshabilitarse y mostrar "Confirmando…" mientras el envío está en curso (PRD caso borde 5).
Un error de red SHALL informar que el reintento no duplicará el pedido.

#### Scenario: Doble clic en confirmar
- **WHEN** el usuario hace clic dos veces seguidas en "Confirmar pedido"
- **THEN** el segundo clic no dispara otro envío (el botón está deshabilitado) y, de haber
  reintento, el servidor devuelve el mismo pedido por la misma `idempotencyKey`

#### Scenario: Error de red
- **WHEN** el POST falla por conexión
- **THEN** se muestra "Hubo un problema de conexión. Intenta de nuevo: tu pedido no se
  duplicará." y el botón vuelve a habilitarse

### Requirement: Manejo de franja cerrada durante el llenado
Cuando el servidor responde `422` con `slot` en `fields`, el flujo SHALL limpiar la franja
seleccionada, recargar las franjas desde `GET /api/orders/slots` y mostrar el mensaje "Esa
franja ya cerró mientras completabas el pedido. Elige otra, por favor."; otros errores del
servidor SHALL mostrar un mensaje genérico sin perder lo diligenciado.

#### Scenario: El corte pasó mientras se llenaba el formulario
- **WHEN** el POST responde `422` con `fields` que incluye `slot`
- **THEN** el selector de franja queda vacío, se recargan las franjas vigentes y se muestra
  el mensaje de franja cerrada

### Requirement: Pantalla de confirmación del pedido
Tras un `201` (o un `200` de replay), el flujo SHALL reemplazar el formulario por la pantalla
de confirmación con: los primeros 8 caracteres del `id`, el teléfono de contacto, el detalle
de ítems con sus montos, el domicilio con el nombre de la zona, el total a pagar en efectivo
(el que calculó el servidor), la fecha legible con la etiqueta de la franja, la dirección, la
nota de pago contra entrega y un enlace para volver al inicio.

#### Scenario: Pedido confirmado
- **WHEN** el servidor responde con el pedido creado
- **THEN** se muestra "¡Pedido confirmado!" con el resumen (ítems, domicilio, total, franja y
  dirección) usando los valores devueltos por el servidor, no los del formulario
