# app-shell Specification

## Purpose
Define el cascarón de rutas de la aplicación Next.js (App Router): qué URLs existen, qué
renderiza cada una y cómo la landing lleva al flujo de compra, preservando el contenido y el
sistema visual de la landing original a través de la migración desde el sitio estático.

## Requirements

### Requirement: La landing se sirve en la raíz
El sistema SHALL servir la landing de Café La Sierra en la ruta `/`, compuesta por las
secciones `Header`, `Hero`, `Catalog`, `Features`, `CtaBanner` y `Footer`, en ese orden,
con el copy y el catálogo provenientes de `src/data/content.js`.

#### Scenario: Visita a la raíz
- **WHEN** un usuario navega a `/`
- **THEN** la página renderiza la landing completa (header, hero, catálogo de los 2 cafés
  con precio y presentación, features, banner de CTA y footer) con el copy de
  `src/data/content.js`

### Requirement: Layout raíz único con tokens de diseño
El sistema SHALL definir un layout raíz (`src/app/layout.jsx`) que carga las fuentes
Manrope (display), Inter (body) y Playfair Display (serif decorativa) desde Google Fonts,
declara el favicon `/favicon.svg` e importa `src/index.css`. Los colores, radios, sombras
y animaciones SHALL salir de los tokens v2 "cuero y crema" de `tailwind.config.js` (tema
oscuro `#1c1008`, crema `#e8d5b7` como color de acción, salvia `#5b7566`, dorado
`#c9a84c`), sin estilos hardcodeados en los componentes salvo las excepciones
escenográficas documentadas en `docs/02-diseno/DESIGN.md`. Las superficies translúcidas
SHALL usar la utilidad `.glass` y la textura de ruido la utilidad `.grain`, ambas
definidas solo en `src/index.css`; las animaciones de entrada y revelado por scroll usan
`framer-motion` y los keyframes CSS declarados son `pulse-danger`, `levitate` y
`marquee`. Los assets visuales (`hero-coffee.png`, `cup-1/2/3.png`, `spoon.png`,
`favicon.svg`) SHALL vivir en `public/`. Las vistas de checkout y del tablero SHALL
compartir este mismo lenguaje visual (tarjetas `.glass`, tokens oscuros, botones crema)
sin cambiar su comportamiento.

#### Scenario: Fuentes y tema oscuro presentes en toda ruta
- **WHEN** se visita cualquier ruta de la aplicación
- **THEN** la página usa las fuentes Manrope/Inter/Playfair Display y los tokens v2 de
  Tailwind sobre el fondo cuero `#1c1008`, sin estilos duplicados por ruta

#### Scenario: Checkout y tablero comparten el lenguaje v2
- **WHEN** un usuario abre `/comprar` o el operador abre `/admin`
- **THEN** las tarjetas usan la utilidad `.glass` con los tokens oscuros y los botones de
  acción en crema, y el semáforo del tablero muestra verde "Con tiempo", amarillo
  "Entrega hoy" y rojo parpadeante "Franja vencida" con los colores v2

### Requirement: Los llamados a la acción llevan a /comprar
Todo llamado a la acción de compra de la landing SHALL navegar a `/comprar`: el botón
"Comprar ahora" del `Header`, el CTA principal del `Hero` y el botón de cada tarjeta del
catálogo.

#### Scenario: Comprar desde el header
- **WHEN** un usuario hace clic en "Comprar ahora" en el header
- **THEN** navega a `/comprar`

#### Scenario: Comprar desde una tarjeta del catálogo
- **WHEN** un usuario hace clic en el botón de compra de una tarjeta de café
- **THEN** navega a `/comprar`

### Requirement: Rutas dedicadas y enlazables
El sistema SHALL exponer como rutas reales del App Router, accesibles directamente (URL
tipeada, marcador o recarga): `/` (landing), `/comprar` (flujo de compra, comportamiento en
`checkout-flow`), `/admin` (tablero del operador) y `/admin/login` (acceso del operador,
comportamiento de ambas en `admin-board`). No SHALL existir ruteo por fragmento hash.

#### Scenario: Visita directa a /comprar
- **WHEN** un usuario navega directamente a `/comprar` (tipea la URL o recarga la página)
- **THEN** el flujo de compra renderiza con el `Header` y el `Footer` de la landing, sin
  pasar primero por `/`

#### Scenario: Rutas del operador existen
- **WHEN** se navega a `/admin` o `/admin/login`
- **THEN** la ruta responde (protegida o con el formulario de acceso, según `admin-board`),
  no con un 404
