## 1. Tokens y base

- [x] 1.1 Reescribir `tailwind.config.js` con los tokens v2 "cuero y crema": colores
      (cuero, crema, salvia, dorado, semáforo recalibrado), fuentes
      Manrope/Inter/Playfair Display, radios `card: 20px`/`pill`, sombras `card`/`glow` y
      keyframes `pulse-danger`, `levitate` y `marquee`
- [x] 1.2 Agregar en `src/index.css` las utilidades `.grain` (ruido SVG, opacidad 0.08) y
      `.glass` (vidrio crema con `backdrop-blur(18px)`), manteniendo foco visible y
      selección sobre los tokens
- [x] 1.3 `src/app/layout.jsx`: cargar Manrope (300–900), Inter (300–700) y Playfair
      Display (700–900) desde Google Fonts y declarar el favicon `/favicon.svg`
- [x] 1.4 Instalar `framer-motion` como única dependencia de presentación nueva

## 2. Landing

- [x] 2.1 `Header.jsx`: barra fija transparente con logotipo Manrope black, nav pill de
      vidrio centrada (`.glass rounded-pill shadow-glow`), CTA crema y menú móvil `.glass`
      con `AnimatePresence`
- [x] 2.2 `Hero.jsx`: sección `min-h-screen` con `.grain` y sheens radiales, H1 Manrope
      black con acento `gold`, CTA salvia, entradas `fadeLeft`/`fadeUp` y tilt 3D de
      `public/hero-coffee.png` siguiendo el mouse (`useMotionValue` + `useSpring`)
- [x] 2.3 `Catalog.jsx`: titular-marquee serif (`animate-marquee`), tarjetas `.glass` con
      tazas flotantes (`cup-1.png`/`cup-2.png`), chip de tueste con borde `gold/30`,
      botón "+" salvia y revelado por scroll `whileInView`
- [x] 2.4 `Features.jsx`: números fantasma serif gigantes, composición 2 + centro + 1 y
      cuchara `public/spoon.png` con `animate-levitate`
- [x] 2.5 Crear `CtaBanner.jsx` (tarjeta `.glass` con H2 Playfair y CTA de contorno) e
      insertarlo en `src/app/page.jsx` entre `Features` y `Footer`
- [x] 2.6 Crear `ui/Star4.jsx` (estrella decorativa de 4 puntas, `aria-hidden`) y
      firmarla con pop en hero, catálogo y features; `Footer.jsx` sobre `background-deep`

## 3. Checkout y tablero con el mismo lenguaje

- [x] 3.1 `ui/Button.jsx`: variantes v2 — `primary` crema con `shadow-glow` y hover que
      aclara (`primary-strong`), `outline` y `ghost` con lavados `primary/10`
- [x] 3.2 `checkout/ComprarCafe.jsx`: tarjetas de producto, resumen y confirmación en
      `.glass shadow-card`; inputs `rounded-xl border-primary/20 bg-background-deep/50`;
      errores y alertas con los tokens `danger` v2, conservando los `data-testid`
- [x] 3.3 `admin/Tablero.jsx`: columnas `bg-background-deep/60`, tarjetas `.glass`,
      filtros con `[color-scheme:dark]`, acciones crema vs. destructiva `danger`, y
      semáforo con los colores v2 (rojo `animate-pulse-danger` intacto)
- [x] 3.4 `admin/login/LoginForm.jsx`: tarjeta `.glass` con logotipo Manrope black y la
      misma receta de inputs

## 4. Documentación y verificación

- [x] 4.1 Reescribir `docs/02-diseno/DESIGN.md` como v2 con nota de versión, tokens,
      utilidades, movimiento, componentes y excepciones escenográficas documentadas
- [x] 4.2 `npm run build` en verde y revisión manual: `/`, `/comprar`, `/admin/login` y
      `/admin` renderizan con el tema oscuro, las animaciones corren y el semáforo del
      tablero conserva verde/amarillo/rojo parpadeante
- [x] 4.3 `npm run test:e2e` en verde: el rediseño no rompe los flujos de compra ni del
      tablero (mismos `data-testid` y copy de `content.js`)
