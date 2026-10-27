## Why

El sistema visual v1 (paleta clara crema/café con serif Fraunces) no coincide con la
dirección de arte que el dueño eligió para la marca: una estética "cuero y crema" inspirada
en una referencia de brulería artesanal — tema oscuro, crema como color de acción,
fotografía de producto y movimiento sutil. Este change aplica el rediseño visual completo
(v2) a todas las vistas — landing, checkout y tablero — sin tocar rutas, API, validaciones
ni lógica de negocio: solo cambia la piel.

## What Changes

- `tailwind.config.js` reescrito con los tokens v2 "cuero y crema": fondo cuero `#1c1008`
  (+ `background-deep`), crema `#e8d5b7` como `primary`/acción, salvia `#5b7566` como
  `secondary` (+ `secondary-strong`), dorado `gold #c9a84c`, semáforo recalibrado para
  fondo oscuro, radios `card: 20px`/`pill`, sombras `card` (con filo inset de crema) y
  `glow`, y keyframes `pulse-danger`, `levitate` y `marquee`.
- `src/index.css`: nuevas utilidades `.grain` (ruido SVG a opacidad 0.08) y `.glass`
  (vidrio crema translúcido con `backdrop-blur(18px)`); la base (fondo, selección, anillo
  de foco) pasa al tema oscuro vía los mismos tokens.
- `src/app/layout.jsx`: fuentes Manrope (display, hasta peso 900), Inter (body) y Playfair
  Display (serif decorativa) desde Google Fonts, y favicon `/favicon.svg`.
- Landing rediseñada: `Header` fijo con nav pill de vidrio centrada, `Hero` a pantalla
  completa con sheens radiales, tilt 3D de la imagen siguiendo el mouse y entradas
  `fadeLeft`/`fadeUp`, `Catalog` con titular-marquee serif y tazas flotantes sobre
  tarjetas de vidrio, `Features` con números fantasma serif y cuchara levitando
  (`animate-levitate`), nueva sección `CtaBanner`, `Footer` sobre `background-deep` y la
  estrella decorativa `ui/Star4.jsx` como firma de sección. Animaciones de entrada y
  revelado por scroll (`whileInView`, `once: true`) con `framer-motion`.
- Checkout (`checkout/ComprarCafe.jsx`), login (`admin/login/LoginForm.jsx`) y tablero
  (`admin/Tablero.jsx`) reestilizados con el mismo lenguaje: tarjetas `.glass`, inputs
  `rounded-xl` sobre `background-deep`, botones crema; el semáforo del tablero conserva su
  comportamiento (verde/amarillo/rojo parpadeante) con los colores v2.
- Assets nuevos en `public/`: `hero-coffee.png`, `cup-1.png`, `cup-2.png`, `cup-3.png`,
  `spoon.png` y `favicon.svg`.
- `docs/02-diseno/DESIGN.md` reescrito como la versión 2 del sistema de diseño.
- Fuera de alcance: cualquier cambio de comportamiento (rutas, contrato de la API,
  validaciones, estados del pedido, copy de negocio) — las demás capacidades no se tocan.

## Capabilities

### New Capabilities
<!-- ninguna: es un rediseño de la capa visual -->

### Modified Capabilities
- `app-shell`: el layout raíz y el sistema visual pasan de la paleta clara v1 (Fraunces) al
  sistema v2 "cuero y crema" (tema oscuro, Manrope/Inter/Playfair Display, `.glass` y
  `.grain`, animaciones framer-motion, assets en `public/`); la landing suma la sección
  `CtaBanner`. Checkout y tablero comparten el mismo lenguaje visual sin cambiar su
  comportamiento (`checkout-flow` y `admin-board` quedan intactas).

## Impact

- Código modificado: `tailwind.config.js`, `src/index.css`, `src/app/layout.jsx`,
  `src/app/page.jsx`, `src/app/comprar/page.jsx`, `src/components/Header.jsx`,
  `src/components/Hero.jsx`, `src/components/Catalog.jsx`, `src/components/Features.jsx`,
  `src/components/Footer.jsx`, `src/components/ui/Button.jsx`,
  `src/components/checkout/ComprarCafe.jsx`, `src/components/admin/Tablero.jsx`,
  `src/app/admin/login/LoginForm.jsx`.
- Código nuevo: `src/components/CtaBanner.jsx`, `src/components/ui/Star4.jsx`; assets en
  `public/` (`hero-coffee.png`, `cup-1/2/3.png`, `spoon.png`, `favicon.svg`).
- `package.json`: nueva dependencia de presentación `framer-motion` (única agregada).
- Documentación: `docs/02-diseno/DESIGN.md` v2.
- Sin impacto de backend: no hay cambios en API routes, `src/lib/` ni migraciones; los
  `data-testid` de los E2E se conservan.
