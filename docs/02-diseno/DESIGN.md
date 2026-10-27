---
name: 'Café La Sierra: del pedido a tu puerta'
version: 2
colors:
  background: '#1c1008'
  background-deep: '#0e0804'
  surface: '#261409'
  surface-dim: '#1c0e04'
  on-surface: '#f0e2c8'
  on-surface-muted: '#b8a080'
  primary: '#e8d5b7'
  primary-strong: '#f5e8cc'
  on-primary: '#1c0e04'
  primary-container: '#33200f'
  on-primary-container: '#e8d5b7'
  secondary: '#5b7566'
  secondary-strong: '#4d6457'
  on-secondary: '#f0e8d8'
  secondary-container: '#223129'
  gold: '#c9a84c'
  outline: '#4a2f18'
  success: '#6fbf8f'
  success-container: '#22402d'
  warning: '#d9a441'
  warning-container: '#42351a'
  danger: '#e05c4e'
  danger-container: '#43201b'
typography:
  display:
    fontFamily: Manrope
    fallback: [system-ui, sans-serif]
    weights: [300, 400, 500, 600, 700, 800, 900]
  body:
    fontFamily: Inter
    fallback: [system-ui, sans-serif]
    weights: [300, 400, 500, 600, 700]
  serif:
    fontFamily: 'Playfair Display'
    fallback: [Georgia, serif]
    weights: [700, 800, 900]
rounded:
  card: 20px
  pill: 9999px
  input: 0.75rem (rounded-xl de Tailwind, solo campos de formulario)
shadow:
  card: '0 8px 32px rgba(0, 0, 0, 0.40), inset 0 1px 0 rgba(232, 213, 183, 0.10)'
  glow: '0 4px 20px rgba(0, 0, 0, 0.5)'
animation:
  pulse-danger:
    keyframes: 'opacity 1 → 0.45 → 1'
    timing: '1.2s ease-in-out infinite'
  levitate:
    keyframes: 'translateY 0 → -16px → 0'
    timing: '3.5s ease-in-out infinite'
  marquee:
    keyframes: 'translateX -50% → 0%'
    timing: '18s linear infinite'
utilities:
  grain: 'ruido SVG (feTurbulence fractalNoise) a opacidad 0.08 sobre secciones oscuras'
  glass: 'rgba(232,213,183,0.10) + backdrop-blur(18px) + borde rgba(232,213,183,0.18)'
---

> **Nota de versión — v2 (2026-10-27).** Esta versión reemplaza por completo la paleta
> clara v1 (crema pergamino `#faf6f0`, café `#7c4a21`, serif Fraunces). Motivación:
> unificar la marca con la dirección de arte **"cuero y crema"** elegida por el dueño,
> inspirada en una referencia de brulería artesanal — fondo de cuero oscuro, crema como
> color de acción, acentos de salvia y dorado, tarjetas de vidrio y movimiento sutil con
> framer-motion. La lógica del producto no cambió: solo la piel.

# DESIGN — Café La Sierra: del pedido a tu puerta (v2 "cuero y crema")

Este documento describe el sistema visual **tal como está implementado**. Todos los tokens
viven en `tailwind.config.js`; los estilos globales y las utilidades `.grain` y `.glass`
viven en `src/index.css`. No existen más tokens que los listados aquí: si un color, radio,
sombra o animación no aparece en este documento, no debe aparecer en el código (las únicas
excepciones escenográficas están listadas al final de "Colores").

## Marca y estilo

Café La Sierra es una marca de **café colombiano de origen** que vende directo al
consumidor: dos tuestes, una montaña, un domicilio que llega a tu puerta. El sistema
visual v2 expresa tres atributos:

- **Cálido y nocturno:** la interfaz vive sobre cuero oscuro (`#1c1008`), no sobre negro
  puro ni gris frío. La luz la pone la crema (`#e8d5b7`): es a la vez el color del texto
  de marca, de los botones y del borde de las tarjetas de vidrio. La sensación buscada es
  la de una brulería artesanal de noche: madera, cuero, vapor y una vitrina iluminada.
- **Artesanal:** la voz tipográfica principal es **Manrope en peso black (900)**, en
  mayúsculas y con tracking amplio para los momentos de marca; **Playfair Display** entra
  como serif decorativa en los nombres de producto, el titular-marquee de la vitrina y los
  números fantasma de las features. La textura `.grain` (ruido SVG) da el tacto de cuero a
  cada sección, y la estrella de 4 puntas (`src/components/ui/Star4.jsx`) firma las
  esquinas de las secciones. Los íconos de trazo siguen saliendo de
  `src/components/ui/Icon.jsx`, SVG inline sin librerías externas.
- **Confiable:** el producto pide dinero en efectivo contra entrega. Los precios y totales
  son grandes y explícitos, la tarifa del domicilio se muestra antes de confirmar, y el
  tablero del operador conserva su semáforo inequívoco (ahora en los tonos v2) para que
  ninguna entrega comprometida se pierda.

Dos superficies conviven en el producto y **comparten el mismo lenguaje**: la **landing +
checkout** (cara al cliente, escenográfica, con fotografía de producto y movimiento) y el
**tablero de pedidos** (cara al operador, densa en información pero construida con los
mismos tokens, el mismo vidrio y el mismo semáforo).

## Colores

La paleta sale del mostrador de una brulería: cuero, crema batida, hoja de salvia y un
destello dorado. Cada token tiene un uso semántico fijo:

### Base y superficies (cuero)

- **`background` (`#1c1008` — cuero):** fondo global de la página (aplicado en `body` vía
  `src/index.css`) y del tablero del operador.
- **`background-deep` (`#0e0804` — cuero profundo):** el tono más oscuro del sistema:
  fondo del footer, del menú móvil desplegado, de los inputs de formulario
  (`bg-background-deep/50`), de las columnas del kanban (`bg-background-deep/60`), del
  desglose del pedido confirmado y del chip de tueste de las tarjetas de producto
  (`bg-background-deep/75`).
- **`surface` (`#261409`) / `surface-dim` (`#1c0e04`):** fondos de franja de sección.
  `surface-dim` es el fondo de las secciones de la landing (catálogo, features, CTA
  banner); sobre él se montan `.grain` y las tarjetas `.glass`.
- **`on-surface` (`#f0e2c8` — crema de lectura):** texto principal y titulares. Más
  apagado que `primary` para que el cuerpo de texto no compita con las acciones.
- **`on-surface-muted` (`#b8a080` — café con leche):** texto secundario: descripciones,
  metadatos, labels de filtros, navegación en reposo y leyendas del tablero.
- **`outline` (`#4a2f18` — costura de cuero):** separadores (`border-t` de los totales) y
  el fondo del botón primario deshabilitado. En v2 la mayoría de los bordes visibles no
  usan `outline` sino **crema atenuada** (`border-primary/20`–`/40`) o el borde propio de
  `.glass`.

### Acción (crema)

- **`primary` (`#e8d5b7` — crema):** el color de acción y de marca. Fondo de los botones
  primarios ("Comprar ahora" del header, "Confirmar pedido", avances de estado en el
  tablero), color del logotipo del header/footer/login, texto de enlaces y botones
  `outline`/`ghost`, anillo de foco y selección de texto (`::selection`). Sus lavados
  (`primary/10`, `primary/20`) son el hover universal de las acciones secundarias, y sus
  atenuados (`border-primary/20`–`/40`) son los bordes de inputs y CTAs de contorno.
- **`primary-strong` (`#f5e8cc` — crema iluminada):** estado `hover` del botón primario
  (en oscuro, el hover **aclara**) y color del total de las tarjetas del tablero.
- **`on-primary` (`#1c0e04`):** texto sobre `primary`: cuero profundo sobre crema, nunca
  negro puro.
- **`primary-container` (`#33200f`) / `on-primary-container` (`#e8d5b7`):** par reservado
  para rellenos suaves de marca sobre el cuero.

### Secundario (salvia)

- **`secondary` (`#5b7566` — salvia):** el acento de servicio y el **CTA de compra de la
  landing**: botón "Comprar ahora" del hero, botón "+" de cada tarjeta del catálogo y CTA
  del menú móvil. También el badge del hero ("Domicilios de lunes a sábado…"), en versión
  lavada (`bg-secondary/10`, `border-secondary/40`).
- **`secondary-strong` (`#4d6457`):** hover de los botones salvia.
- **`on-secondary` (`#f0e8d8`):** texto sobre salvia sólida.
- **`secondary-container` (`#223129`):** relleno contenedor reservado del acento.

### Dorado

- **`gold` (`#c9a84c` — dorado):** acento de énfasis puntual, nunca de acción: la palabra
  destacada del H1 del hero ("origen") y el borde del chip de tueste de las tarjetas de
  producto (`border-gold/30`). Es el destello de la vitrina; si aparece en más de dos
  sitios por vista, se está gastando.

### Semáforo de estados (tablero + feedback)

El PRD exige un semáforo dinámico contra la franja de entrega comprometida. Los tres
pares de tokens, recalibrados para contraste sobre cuero, cubren el semáforo y el
feedback de formularios:

- **`success` (`#6fbf8f` — verde) / `success-container` (`#22402d`):** *"Con tiempo"* —
  punto verde en la tarjeta del pedido. `success-container` es además el fondo del chip de
  check de la pantalla "¡Pedido confirmado!".
- **`warning` (`#d9a441` — ámbar) / `warning-container` (`#42351a`):** *"Entrega hoy"* —
  la franja comprometida es hoy; exige atención sin alarmar.
- **`danger` (`#e05c4e` — rojo teja) / `danger-container` (`#43201b`):** *"Franja
  vencida"* — la franja pasó y el pedido no salió. `danger` también colorea los errores de
  validación inline, las alertas de servidor (texto `danger` sobre `danger-container`) y
  el botón "Cancelar/Devolver" del tablero (borde `danger/40`, hover `danger-container`).

**Por qué el rojo parpadea:** el punto rojo del semáforo lleva `animate-pulse-danger`
(opacidad 1 → 0.45 → 1 en 1,2 s, `ease-in-out`, infinita). El tablero se mira de reojo;
un rojo estático se camufla. El parpadeo convierte la franja vencida en el único elemento
urgente en movimiento de la pantalla, sin sonidos ni modales. Verde y amarillo nunca
parpadean: `pulse-danger` sigue reservada en exclusiva para la urgencia real.

### Excepciones escenográficas (documentadas)

Cuatro valores arbitrarios existen fuera de los tokens porque son **escenografía**, no
semántica, y están anclados a la dirección de arte:

- El fondo del hero (`bg-[#231208]`) y sus **sheens radiales** (`radial-gradient` en tonos
  `rgba(58,28,10,…)`/`rgba(48,22,6,…)`/`rgba(10,5,1,…)`) más el degradado lineal que
  oscurece el lado izquierdo para que el titular respire.
- El titular-marquee de la vitrina del catálogo: `rgba(140, 90, 30, 0.55)`.
- Los números fantasma de las features: `rgba(140, 80, 20, 0.22)`.
- La estrella `Star4`: trazos y relleno en crema translúcida (`rgba(232,213,183,…)`).

Ningún otro componente puede introducir valores fuera de tokens: estas cuatro excepciones
se listan aquí precisamente para que la regla siga siendo verificable.

## Tipografía

Trío cargado desde Google Fonts en `src/app/layout.jsx` con fallbacks del sistema:

- **Display — `Manrope` (`font-display`; fallback system-ui, sans-serif; pesos 300–900):**
  la voz de la marca. En **peso black (900), mayúsculas y tracking amplio**
  (`tracking-[0.14em]`) para el logotipo del header, footer y login y el título del
  tablero; en black/extrabold para el H1 del hero, los H3 de features, los precios del
  catálogo y los totales del tablero; en semibold para los H1 del checkout.
- **Body — `Inter` (`font-body`; fallback system-ui, sans-serif; pesos 300–700):** todo lo
  demás. Es la fuente por defecto del `body` (vía `@apply font-body` en `src/index.css`):
  párrafos, labels, inputs, botones, navegación, metadatos y la totalidad del contenido de
  las tarjetas del tablero.
- **Serif decorativa — `Playfair Display` (`font-serif`; fallback Georgia, serif; pesos
  700/800/900):** reservada para los momentos de vitrina: nombres de producto en las
  tarjetas del catálogo, el titular-marquee "Nuestros cafés de origen", los números
  fantasma gigantes de las features y el H2 del CTA banner. Nunca se usa en texto
  funcional ni en el tablero.

Jerarquía implementada (escala por utilidades de Tailwind, no hay tokens de tipo propios):

| Rol | Clases | Fuente |
|---|---|---|
| Hero H1 | `text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight` | Manrope |
| Marquee de vitrina | `text-[clamp(56px,9.5vw,136px)] font-bold uppercase tracking-wider` | Playfair Display |
| Números fantasma | `text-[clamp(72px,8vw,110px)] font-black` | Playfair Display |
| H1 interno (checkout) | `text-3xl sm:text-4xl font-semibold` | Manrope |
| H2 del CTA banner | `text-2xl sm:text-3xl font-bold` | Playfair Display |
| H3 de card de producto | `text-2xl font-bold` | Playfair Display |
| Logotipo / título del tablero | `text-lg`–`text-2xl font-black/extrabold uppercase tracking-[0.1em–0.14em]` | Manrope |
| Precio de catálogo | `text-xl font-extrabold` | Manrope |
| Cuerpo / labels / botones | `text-sm font-medium`–`font-semibold` | Inter |
| Metadatos, chips, tablero | `text-xs`–`text-[13px]` | Inter |
| Eyebrows de pasos del formulario | `text-sm font-semibold uppercase tracking-wide` | Inter |
| ID de pedido | `font-mono` | monospace del sistema |

## Layout y espaciado

No hay escala de espaciado propia: se usa la escala por defecto de Tailwind.

- **Header fijo, no pegajoso:** `fixed inset-x-0 top-0 z-50`, transparente sobre el hero,
  con el logotipo a la izquierda, la **nav pill de vidrio** centrada (`absolute left-1/2`,
  `.glass rounded-pill shadow-glow`, solo `md:`) y el CTA crema a la derecha. En móvil el
  menú se despliega en una tarjeta `.glass` sobre `background-deep/95`.
- **Hero a pantalla completa:** `min-h-screen`, contenido en `max-w-7xl` con el texto en
  una columna `max-w-xl` a la izquierda y la imagen de producto posicionada absoluta a la
  derecha, asomándose sobre el navbar (`-top-20`, solo `lg:`).
- **Contenedor (`src/components/ui/Container.jsx`):** `max-w-5xl` centrado con gutters
  `px-5`/`sm:px-8`. Vistas de foco lo estrechan: checkout `max-w-2xl`, confirmación
  `max-w-xl`, login `max-w-sm`. Las secciones de la landing usan anchos propios
  (`max-w-4xl` catálogo, `max-w-6xl` features y CTA banner).
- **Ritmo vertical:** secciones con `py-16 sm:py-24` (features), `pb-20` (catálogo, cuyo
  "padding" superior lo pone el marquee) y `min-h-[300px]` (CTA banner). Las páginas
  internas compensan el header fijo con `pt-28 sm:pt-32`.
- **Grillas:** catálogo con tarjetas `max-w-[340px]` en flex centrado; features en
  composición 2 + centro + 1 (`md:flex-row`, cuchara al centro); el tablero escala por
  densidad: 1 columna en móvil, `md:grid-cols-3`, `xl:grid-cols-5` con `gap-4`.
- **Padding interno de cards:** `p-8`–`p-10` en la cara cliente (confirmación, CTA
  banner, login); `p-4`–`p-5` en el checkout denso y el tablero.

## Formas

Tres radios, tres significados — no existen otros radios en el sistema:

- **`rounded-card` (20px):** todo lo que es *superficie*: tarjetas `.glass` (producto,
  checkout, resumen, confirmación, login, tarjetas del tablero), columnas del kanban,
  alertas y el menú móvil.
- **`rounded-pill` (9999px):** todo lo que es *acción o etiqueta*: botones y CTAs, la nav
  pill del header, el badge del hero, el chip de tueste, los steppers de cantidad (+/−),
  el botón "+" de las tarjetas, los contadores de columna del kanban y el punto del
  semáforo.
- **`rounded-xl` (0.75rem, escala por defecto de Tailwind):** exclusivo de los **campos de
  formulario** (inputs y selects del checkout, login y filtros del tablero), un paso más
  tenso que la card para que el campo se lea como herramienta y no como tarjeta.

## Elevación

Sobre un fondo oscuro la elevación no la da la sombra sino la **luz**: las superficies
suben aclarándose (vidrio crema) y las sombras solo asientan los objetos.

- **`shadow-card`:** `0 8px 32px rgba(0,0,0,0.40)` + **inset `0 1px 0
  rgba(232,213,183,0.10)`** — una difusión negra que despega la tarjeta del cuero y un
  filo interior de crema en el canto superior que simula luz cenital. Acompaña siempre a
  `.glass` (tarjetas de producto, checkout, confirmación, login, tablero, CTA banner).
- **`shadow-glow`:** `0 4px 20px rgba(0,0,0,0.5)` — halo corto para elementos flotantes
  pequeños: la nav pill del header y los botones primarios crema/salvia.
- **La utilidad `.glass`** (en `src/index.css`) es el nivel de superficie en sí:
  `rgba(232,213,183,0.10)` + `backdrop-blur(18px)` + borde `rgba(232,213,183,0.18)`.
- Las **imágenes de producto** (tazas, cuchara, hero) usan `drop-shadow` negros intensos
  en línea — son fotografía recortada, no superficies del sistema.
- Jerarquías menores se resuelven con bordes de crema atenuada (`border-primary/20`–`/40`)
  y franjas (`surface-dim`, `background-deep`), no con más niveles de sombra.

## Movimiento

v2 introduce movimiento como material de marca, con dos mecanismos y reglas claras:

### framer-motion (entradas y scroll)

- **Variantes compartidas:** `fadeLeft` (opacidad 0 + `x:-34` → visible) y `fadeUp`
  (opacidad 0 + `y:16` → visible), siempre con el easing de la casa
  `[0.22, 1, 0.36, 1]` y duraciones de 0.5–0.9 s con delays escalonados.
- **Entrada del header:** desliza desde arriba (`y:-60 → 0`) al cargar.
- **Hero:** el badge, el H1, el párrafo y los CTAs entran en cascada con
  `fadeLeft`/`fadeUp`; la imagen entra con escala (`0.92 → 1`).
- **Tilt 3D del hero:** la imagen `hero-coffee.png` rota en `rotateY` ±6° siguiendo el
  mouse (`useMotionValue` + `useSpring` stiffness 160 / damping 22, `perspective: 900px`)
  y vuelve al centro al salir el cursor.
- **Revelado por scroll:** tarjetas de producto, features, CTA banner y estrellas usan
  `whileInView` con `viewport={{ once: true }}` — cada elemento anima una sola vez.
- **Estrellas `Star4`:** aparecen con pop (escala 0.4 + rotación → 1) en la esquina
  inferior derecha de hero, catálogo y features.
- **Menú móvil:** `AnimatePresence` con fade + desplazamiento de 10px.

### Keyframes CSS (tailwind.config.js)

- **`animate-levitate`:** la cuchara de las features flota (`translateY 0 → -16px`,
  3.5 s, infinita). Decorativa, una sola instancia por página.
- **`animate-marquee`:** el titular de vitrina del catálogo se desplaza en loop
  (`translateX -50% → 0%`, 18 s, lineal). El texto está duplicado y es `aria-hidden`.
- **`animate-pulse-danger`:** exclusiva del semáforo rojo del tablero (ver Colores).

### Reglas de movimiento

- Microinteracciones de botones: `transition-colors` o `transition-all` con
  `hover:-translate-y-px`/`-translate-y-0.5` (los CTAs "levantan" 1–2px) y
  `hover:scale-110` solo en el botón "+" circular del catálogo.
- El **tablero del operador no tiene framer-motion**: su único movimiento es
  `pulse-danger`. La urgencia no compite con decoración.
- Todo revelado de scroll es `once: true`: nada re-anima al volver a subir.

## Componentes

### Header (`src/components/Header.jsx`)

Barra **fija** y transparente: logotipo Manrope black en crema, **nav pill de vidrio**
centrada (`.glass rounded-pill shadow-glow`) con enlaces a `/#cafes` y `/#porque` que se
encienden con `hover:bg-primary/10 hover:text-primary`, y CTA "Comprar ahora" en píldora
crema (`bg-primary text-on-primary shadow-glow hover:bg-primary-strong`). En móvil, botón
hamburguesa y panel `.glass` sobre `background-deep/95` con el CTA en salvia (deshabilitado
visualmente si ya se está en `/comprar`).

### Hero (`src/components/Hero.jsx`)

Sección `min-h-screen` con `.grain`, fondo `#231208` y sheens radiales cálidos (ver
excepciones escenográficas). Columna izquierda: badge salvia con punto, H1 Manrope black
con la palabra "origen" en `gold`, párrafo `on-surface-muted`, CTA primario **salvia** y
CTA secundario de contorno crema ("Ver los cafés"), más la nota de pago. Derecha: la
imagen `public/hero-coffee.png` con **tilt 3D** siguiendo el mouse y drop-shadows
profundos, asomándose sobre el navbar. Estrella `Star4` en la esquina.

### Catálogo (`src/components/Catalog.jsx`)

Sección vitrina sobre `surface-dim` + `.grain`, encabezada por el **titular-marquee**
serif gigante en loop. Cada producto es una tarjeta `.glass rounded-card shadow-card` con
una **taza flotante** (`public/cup-1.png` café oscuro, `public/cup-2.png` café medio)
posicionada mitad fuera de la tarjeta con drop-shadow; dentro: título Playfair, chip de
tueste con borde `gold/30` sobre `background-deep/75`, descripción, precio Manrope
extrabold y botón **"+" circular salvia** (`hover:scale-110`) que navega a `/comprar`.
Cierra un CTA de contorno ("Arma tu pedido completo") y la estrella de firma.

### Features (`src/components/Features.jsx`)

Sobre `surface-dim` + `.grain`, con el lema "CAFÉ LA SIERRA *es*" en Manrope. Tres
features en composición editorial: **números fantasma** serif gigantes y translúcidos
detrás del texto (1 y 2 alineados a la izquierda, 3 a la derecha), y al centro la
**cuchara de café** (`public/spoon.png`) **levitando** con `animate-levitate`.

### CTA banner (`src/components/CtaBanner.jsx`)

Franja `surface-dim` + `.grain` con una tarjeta `.glass` que entra desde la izquierda:
H2 Playfair ("Pide hoy y recíbelo en tu puerta"), nota de pago y CTA de contorno crema
lavado (`border-primary/40 bg-primary/10`).

### Footer (`src/components/Footer.jsx`)

Franja `background-deep` con borde superior `primary/10`: logotipo Manrope black crema y
línea legal en `on-surface-muted`. Sin animación.

### Botones (`src/components/ui/Button.jsx`)

Base común: `inline-flex items-center justify-center gap-2 rounded-pill px-6 py-3 text-sm
font-semibold transition-colors disabled:cursor-not-allowed`. Tres variantes:

- **`primary`:** fondo `primary` (crema), texto `on-primary`, `shadow-glow`, hover
  `primary-strong`. Deshabilitado: fondo `outline`, texto `on-surface-muted`, sin glow
  (así se ve "Confirmar pedido" mientras envía). Es la única acción por vista.
- **`outline`:** borde `primary/40` y texto `primary`, hover lavado `primary/10`.
  Deshabilitado: borde y texto `outline`.
- **`ghost`:** solo texto `primary` con hover `primary/10` ("Limpiar filtros").

Los CTA que son enlaces (header, hero, catálogo, CTA banner) replican estas recetas con
`Link`; en la landing el CTA de compra usa el **salvia** (`bg-secondary … 
hover:bg-secondary-strong`) para destacar contra la crema de la marca.

### Formulario de checkout (`checkout/ComprarCafe.jsx`)

- **Pasos numerados:** `fieldset` + `legend` con eyebrow ("1 · Elige tus cafés",
  "2 · Datos de entrega").
- **Selector de cantidad:** tarjeta `.glass` por producto con stepper de botones píldora
  de 36px (`h-9 w-9`, borde `primary/30`, símbolo `primary`, hover `primary/10`).
- **Inputs y selects:** clase única compartida (`inputClass`): `rounded-xl border
  border-primary/20 bg-background-deep/50 px-4 py-3 text-sm text-on-surface`, placeholder
  `on-surface-muted/60`. Cada campo se envuelve en el helper `Field` (`label` real con
  título `text-sm font-semibold` y error inline `text-xs text-danger`).
- **Resumen de totales:** tarjeta `.glass shadow-card`; subtotal, domicilio por zona y
  total separado por `border-t border-outline`, en `font-semibold`.
- **Errores de servidor:** bloque `role="alert"` con texto `danger` sobre
  `danger-container`, `rounded-card`.
- **Confirmación:** tarjeta `.glass` centrada con chip `success-container`/`success` e
  ícono `check` (de `Icon.jsx`), desglose sobre `background-deep/50`, total "a pagar en
  efectivo" destacado y enlace píldora crema "Volver al inicio".

### Tablero kanban (`admin/Tablero.jsx`)

- **Columnas:** una por estado (Nuevo → Preparando → En camino → Entregado +
  Devuelto/Cancelado), `rounded-card bg-background-deep/60 p-3`, encabezado con contador
  en píldora `bg-primary/10`.
- **Tarjeta de pedido:** `.glass rounded-card shadow-card p-4`, todo en
  `text-xs`/`text-sm`: cliente en negrita, franja y fecha, zona y dirección, teléfono,
  ítems, notas en itálica y total en **Manrope extrabold `primary-strong`**.
- **Semáforo:** punto de `h-2.5 w-2.5 rounded-pill` junto a su etiqueta textual — verde
  `bg-success` "Con tiempo", amarillo `bg-warning` "Entrega hoy", rojo `bg-danger
  animate-pulse-danger` "Franja vencida". El punto lleva `aria-hidden` porque la etiqueta
  ya comunica el estado. La leyenda se imprime en el encabezado con los mismos tokens.
- **Acciones de transición:** botones píldora `text-xs`; avanzar usa crema
  (`bg-primary text-on-primary hover:bg-primary-strong`) y "Cancelar/Devolver" la variante
  destructiva (borde `danger/40`, texto `danger`, hover `danger-container`).
- **Filtros:** inputs `rounded-xl` con la misma receta del checkout; el input de fecha
  lleva `[color-scheme:dark]` para que el picker nativo respete el tema oscuro.

### Login del operador (`admin/login/LoginForm.jsx`)

Tarjeta única `.glass max-w-sm` centrada (`rounded-card p-8 shadow-card`) con el logotipo
Manrope black en crema, input de clave con la receta de inputs y `Button` primario de
ancho completo que se deshabilita mientras envía o si la clave está vacía.

### Estrella de firma (`ui/Star4.jsx`)

Estrella de 4 puntas en SVG (trazo y relleno de crema translúcida), siempre decorativa
(`aria-hidden`) y `pointer-events-none`, en la esquina inferior derecha de hero, catálogo
y features. Es la firma visual de las secciones.

## Assets (`public/`)

Fotografía de producto recortada (PNG con transparencia) y favicon:

- **`hero-coffee.png`:** composición de tazas del hero (la que recibe el tilt 3D).
- **`cup-1.png` / `cup-2.png`:** tazas flotantes del catálogo (café oscuro / café medio,
  mapeadas por id en `CUP_IMAGES`).
- **`cup-3.png`:** taza adicional de la sesión fotográfica, en reserva (sin uso actual en
  componentes).
- **`spoon.png`:** cuchara de café levitante de las features.
- **`favicon.svg`:** favicon del sitio, declarado en la metadata de `src/app/layout.jsx`.

Todas las imágenes decorativas llevan `draggable={false}` y `select-none`; las que no
aportan información llevan `alt=""` + `aria-hidden`.

## Accesibilidad

- **Foco visible global:** `src/index.css` define `:focus-visible` con `ring-2
  ring-primary ring-offset-2 ring-offset-background`: anillo crema sobre offset cuero,
  visible en ambas superficies.
- **Contraste:** los pares principales (`on-surface` y `primary` sobre
  `background`/`background-deep`, `on-primary` sobre `primary`, `danger` sobre
  `danger-container`) mantienen contraste alto sobre el tema oscuro; `on-surface-muted`
  se reserva para texto secundario de apoyo, nunca para información única o accionable.
- **El color nunca va solo:** cada punto del semáforo lleva su etiqueta de texto y el
  punto decorativo es `aria-hidden`; los errores de validación son texto, no solo borde.
- **Decoración silenciada:** el marquee, los números fantasma, los sheens del hero, la
  cuchara y las estrellas `Star4` son `aria-hidden`; las imágenes de producto que
  acompañan texto llevan `alt` descriptivo (hero, tazas del catálogo).
- **Labels y semántica:** campos con `label` reales (helper `Field`),
  `fieldset`/`legend` en los pasos, `role="alert"` en errores de servidor, `aria-label`
  en steppers ("Agregar/Quitar {producto}"), en el botón "+" del catálogo ("Pedir
  {producto}") y en el botón del menú móvil ("Abrir menú").
- **Estados deshabilitados honestos:** botones con `disabled:cursor-not-allowed` y cambio
  visible de color; el select de franjas se deshabilita mientras carga y lo anuncia
  ("Cargando franjas…").
- **Doble envío protegido:** "Confirmar pedido" se deshabilita al primer clic y cambia su
  texto a "Confirmando…" (caso borde 5 del PRD).

## Reglas de implementación

- **Tokens solo desde `tailwind.config.js`.** Ningún componente usa colores, radios,
  sombras ni fuentes hardcodeadas: únicamente los tokens semánticos de este documento. Las
  **cuatro excepciones escenográficas** (fondo y sheens del hero, marquee, números
  fantasma, `Star4`) están listadas en "Colores" y son las únicas permitidas; un matiz
  nuevo se agrega primero aquí y luego al config.
- **Copy solo desde `src/data/content.js`.** Nombres, tagline, descripciones, catálogo,
  zonas y tarifas, etiquetas de franjas, labels de estados y acciones del tablero y la
  nota de pago viven en `content.js`; los componentes no contienen textos de negocio
  hardcodeados.
- **Las utilidades `.grain` y `.glass` viven solo en `src/index.css`.** Ningún componente
  redeclara ruido ni vidrio por su cuenta: textura y superficie translúcida son un token
  más.
- **Movimiento con reglas.** framer-motion solo para entradas y revelados `once: true`
  (cara al cliente); los keyframes CSS declarados son exactamente tres (`pulse-danger`,
  `levitate`, `marquee`) y `pulse-danger` sigue reservada al semáforo rojo. El tablero no
  usa framer-motion.
- **Íconos y firmas inline, cero dependencias visuales nuevas.** `Icon.jsx` y `Star4.jsx`
  son SVG inline; la única dependencia de presentación agregada en v2 es `framer-motion`.
