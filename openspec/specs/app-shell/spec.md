# app-shell Specification

## Purpose
Define el cascarón de rutas de la aplicación Next.js (App Router): qué URLs existen, qué
renderiza cada una y cómo la landing lleva al flujo de compra, preservando el contenido y el
sistema visual de la landing original a través de la migración desde el sitio estático.

## Requirements

### Requirement: La landing se sirve en la raíz
El sistema SHALL servir la landing de Café La Sierra en la ruta `/`, compuesta por las
secciones `Header`, `Hero`, `Catalog`, `Features` y `Footer`, en ese orden, con el copy y el
catálogo provenientes de `src/data/content.js`.

#### Scenario: Visita a la raíz
- **WHEN** un usuario navega a `/`
- **THEN** la página renderiza la landing completa (header, hero, catálogo de los 2 cafés con
  precio y presentación, features y footer) con el copy de `src/data/content.js`

### Requirement: Layout raíz único con tokens de diseño
El sistema SHALL definir un layout raíz (`src/app/layout.jsx`) que carga las fuentes Fraunces
e Inter desde Google Fonts e importa `src/index.css`; los colores, radios y tipografías SHALL
salir de los tokens de `tailwind.config.js`, sin estilos hardcodeados en los componentes.

#### Scenario: Fuentes y estilos presentes en toda ruta
- **WHEN** se visita cualquier ruta de la aplicación
- **THEN** la página usa las fuentes Fraunces/Inter y las clases de los tokens de Tailwind,
  sin estilos duplicados por ruta

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
