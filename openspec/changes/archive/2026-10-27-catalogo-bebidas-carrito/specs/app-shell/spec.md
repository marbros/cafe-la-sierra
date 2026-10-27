## ADDED Requirements

### Requirement: Vitrina con bebidas y grano y botón de agregar al carrito
La sección `Catalog` de la landing SHALL mostrar los productos de `catalog.products`
separados por `kind`: las bebidas de la casa (`kind: 'bebida'`) como tarjetas con la taza
flotante (`image`), insignia de `rating` y precio; y los cafés en grano (`kind: 'grano'`)
como tarjetas con ícono de grano y chip de `tueste · presentación`. Cada tarjeta SHALL
tener un botón "+" con `aria-label` `Agregar <producto> al carrito` que suma 1 unidad al
carrito persistente sin salir de la landing, y la sección SHALL cerrar con el enlace
"Completar mi pedido" hacia `/comprar`.

#### Scenario: Agregar desde una tarjeta de la vitrina
- **WHEN** el usuario pulsa el botón "+" de una tarjeta (bebida o grano)
- **THEN** el carrito suma 1 unidad de ese producto (hasta `catalog.maxQtyPerProduct`), el
  contador del navbar se actualiza y la página no navega

#### Scenario: Vitrina separada por tipo
- **WHEN** un usuario ve la sección de catálogo de la landing
- **THEN** las 3 bebidas aparecen como tarjetas con taza flotante y rating, y los 2 cafés
  en grano como tarjetas con su tueste y presentación, bajo el título "Nuestro grano, para
  tu casa"

### Requirement: Ícono de carrito con contador en el navbar
El `Header` SHALL mostrar, tanto en desktop como en móvil, un ícono de carrito que navega
a `/comprar`, con `aria-label` que anuncia el número de productos. Cuando el carrito tiene
unidades, el ícono SHALL mostrar un badge con el total (suma de cantidades de todos los
productos), actualizado en vivo ante cualquier cambio del carrito — desde la landing, el
checkout u otra pestaña —; con el carrito vacío no SHALL mostrarse badge alguno.

#### Scenario: Contador con unidades
- **WHEN** el carrito tiene 2 cappuccinos y 1 café medio
- **THEN** el badge del ícono muestra "3" en desktop y en móvil, y el ícono lleva a
  `/comprar`

#### Scenario: Carrito vacío sin badge
- **WHEN** el carrito no tiene unidades (nuevo visitante o pedido recién confirmado)
- **THEN** el ícono del carrito se muestra sin badge

## MODIFIED Requirements

### Requirement: La landing se sirve en la raíz
El sistema SHALL servir la landing de Café La Sierra en la ruta `/`, compuesta por las
secciones `Header`, `Hero`, `Catalog`, `Features`, `CtaBanner` y `Footer`, en ese orden,
con el copy y el catálogo provenientes de `src/data/content.js`.

#### Scenario: Visita a la raíz
- **WHEN** un usuario navega a `/`
- **THEN** la página renderiza la landing completa (header, hero, catálogo de los 5
  productos — 3 bebidas de la casa y 2 cafés en grano — con precio y presentación,
  features, banner de CTA y footer) con el copy de `src/data/content.js`

### Requirement: Los llamados a la acción llevan a /comprar
Los llamados a la acción de compra de la landing SHALL navegar a `/comprar`: el botón
"Comprar ahora" del `Header`, el CTA principal del `Hero`, el ícono del carrito del navbar
y el enlace "Completar mi pedido" de la sección de catálogo. El botón "+" de cada tarjeta
del catálogo no SHALL navegar: agrega el producto al carrito.

#### Scenario: Comprar desde el header
- **WHEN** un usuario hace clic en "Comprar ahora" en el header
- **THEN** navega a `/comprar`

#### Scenario: Ir al checkout desde el carrito
- **WHEN** un usuario hace clic en el ícono del carrito o en "Completar mi pedido"
- **THEN** navega a `/comprar`, donde el checkout precarga lo que lleva el carrito
