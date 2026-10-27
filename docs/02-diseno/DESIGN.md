---
name: 'Café La Sierra: del pedido a tu puerta'
colors:
  background: '#faf6f0'
  surface: '#ffffff'
  surface-dim: '#f1e9de'
  on-surface: '#2b1b12'
  on-surface-muted: '#6f5c4e'
  primary: '#7c4a21'
  primary-strong: '#5e3718'
  on-primary: '#fff8f0'
  primary-container: '#f3e3d2'
  on-primary-container: '#4a2b12'
  secondary: '#3e5c45'
  on-secondary: '#ffffff'
  secondary-container: '#dcebe0'
  outline: '#d9cbbb'
  success: '#2f7d4f'
  success-container: '#def2e4'
  warning: '#b7791f'
  warning-container: '#fdeed3'
  danger: '#c2362b'
  danger-container: '#fde3e0'
typography:
  display:
    fontFamily: Fraunces
    fallback: [Georgia, serif]
    weights: [500, 600, 700]
  body:
    fontFamily: Inter
    fallback: [system-ui, sans-serif]
    weights: [400, 500, 600, 700]
rounded:
  card: 1rem
  pill: 9999px
shadow:
  card: '0 1px 2px rgba(43, 27, 18, 0.06), 0 8px 24px rgba(43, 27, 18, 0.08)'
animation:
  pulse-danger:
    keyframes: 'opacity 1 → 0.45 → 1'
    timing: '1.2s ease-in-out infinite'
---

# DESIGN — Café La Sierra: del pedido a tu puerta

Este documento describe el sistema visual **tal como está implementado**. Todos los tokens
viven en `tailwind.config.js`; los estilos globales viven en `src/index.css`. No existen
más tokens que los listados aquí: si un color, radio o sombra no aparece en este documento,
no debe aparecer en el código.

## Marca y estilo

Café La Sierra es una marca de **café colombiano de origen** que vende directo al
consumidor: dos tuestes, una montaña, un domicilio que llega a tu puerta. El sistema
visual expresa tres atributos:

- **Cálido:** la interfaz vive sobre tonos de crema, pergamino y café tostado. Nada de
  blancos clínicos ni grises fríos; incluso el texto principal es un marrón muy oscuro
  (`#2b1b12`), no negro puro.
- **Artesanal:** la voz tipográfica la lleva **Fraunces**, una serif de carácter editorial
  que evoca etiquetas de café de especialidad y empaques impresos. Los íconos son trazos
  finos dibujados a mano en SVG inline (`src/components/ui/Icon.jsx`), sin librerías
  externas: montaña, llama de tueste, grano, camión, efectivo.
- **Confiable:** el producto pide dinero en efectivo contra entrega, así que la interfaz
  debe inspirar seriedad. Los precios y totales son grandes y explícitos, la tarifa del
  domicilio se muestra antes de confirmar, y el tablero del operador usa un semáforo
  inequívoco para que ninguna entrega comprometida se pierda.

Dos superficies conviven en el producto y comparten el mismo sistema: la **landing +
checkout** (cara al cliente, generosa en aire y jerarquía) y el **tablero de pedidos**
(cara al operador, densa en información pero con los mismos tokens).

## Colores

La paleta sale de la materia prima: tierra de la sierra, grano tostado, hoja de cafeto y
papel pergamino. Cada token tiene un uso semántico fijo:

### Base y superficies

- **`background` (`#faf6f0` — crema pergamino):** fondo global de la página (aplicado en
  `body` vía `src/index.css`). Da calidez de papel a todo el viewport.
- **`surface` (`#ffffff` — blanco):** superficie elevada de cards, formularios e inputs.
  Es el único blanco del sistema y siempre aparece sobre `background` o `surface-dim`.
- **`surface-dim` (`#f1e9de` — arena tostada):** franjas de sección que necesitan
  contraste suave contra el fondo (sección "Nuestros cafés", footer) y el fondo de las
  **columnas del tablero kanban**, donde hace que las tarjetas blancas resalten.
- **`on-surface` (`#2b1b12` — café casi negro):** texto principal y titulares. Es también
  la base cromática de la sombra `shadow-card` (sombras café, no gris).
- **`on-surface-muted` (`#6f5c4e` — café humo):** texto secundario: descripciones,
  metadatos de producto, labels de filtros, leyendas y navegación en reposo.
- **`outline` (`#d9cbbb` — lino tostado):** bordes de inputs, bordes de cards
  (usualmente atenuado a `outline/50` o `outline/60`), separadores (`border-t` en
  totales) y el estado deshabilitado del botón primario.

### Marca (café)

- **`primary` (`#7c4a21` — café tostado medio):** el color de acción. Fondo de los
  botones primarios ("Comprar ahora", "Confirmar pedido", avances de estado en el
  tablero), texto de enlaces de acción y del anillo de foco. También colorea la selección
  de texto (`::selection`).
- **`primary-strong` (`#5e3718` — café tueste oscuro):** estado `hover` de todo botón
  primario, el logotipo del header/footer y los **precios** (catálogo, total de la
  tarjeta de pedido). El precio en el tono más intenso de la marca refuerza confianza.
- **`on-primary` (`#fff8f0` — crema sobre café):** texto e íconos sobre `primary`. Es un
  blanco cálido, no `#ffffff`, para que el botón no "recorte" en frío.
- **`primary-container` (`#f3e3d2` — espuma de café):** relleno suave de marca: fondo del
  degradado del hero, chips circulares de los íconos de features y catálogo, y el `hover`
  de botones `ghost` y `outline`.
- **`on-primary-container` (`#4a2b12`):** texto de alto contraste reservado para
  contenido sobre `primary-container`.

### Secundario (hoja de cafeto)

- **`secondary` (`#3e5c45` — verde cafetal):** acento vegetal que comunica servicio y
  frescura. Texto del badge del hero ("Domicilios de lunes a sábado…").
- **`secondary-container` (`#dcebe0`):** fondo de ese badge informativo.
- **`on-secondary` (`#ffffff`):** reservado para texto sobre `secondary` sólido.

### Semáforo de estados (tablero + feedback)

El PRD exige un semáforo dinámico contra la franja de entrega comprometida. Los tres
pares de tokens cubren tanto el semáforo del tablero como el feedback de formularios:

- **`success` (`#2f7d4f` — verde) / `success-container` (`#def2e4`):** *"Con tiempo"* —
  la entrega aún no es urgente (punto verde en la tarjeta del pedido). `success-container`
  es además el fondo del chip de check en la pantalla "¡Pedido confirmado!".
- **`warning` (`#b7791f` — ámbar) / `warning-container` (`#fdeed3`):** *"Entrega hoy"* —
  la franja comprometida es hoy; exige atención sin alarmar.
- **`danger` (`#c2362b` — rojo teja) / `danger-container` (`#fde3e0`):** *"Franja
  vencida"* — la franja pasó y el pedido no salió. `danger` también colorea los mensajes
  de error de validación, las alertas de servidor (texto `danger` sobre
  `danger-container`) y el botón de acción "Cancelar/Devolver" del tablero.

**Por qué el rojo parpadea:** el punto rojo del semáforo lleva `animate-pulse-danger`
(definida en `tailwind.config.js`: opacidad 1 → 0.45 → 1 en 1,2 s, `ease-in-out`,
infinita). El tablero es una pantalla que el operador mira de reojo un par de veces al
día; un rojo estático se camufla entre tarjetas. El parpadeo convierte la franja vencida
en el único elemento en movimiento de la pantalla, imposible de ignorar, sin recurrir a
sonidos ni modales. Es la **única animación de keyframes del sistema**: el movimiento se
reserva en exclusiva para la urgencia real (verde y amarillo nunca parpadean).

## Tipografía

Pareja clásica serif de carácter + sans de trabajo, cargada desde Google Fonts en
`src/app/layout.jsx` con fallbacks del sistema:

- **Display — `Fraunces` (`font-display`; fallback Georgia, serif; pesos 500/600/700):**
  titulares y momentos de marca. Es una serif "soft" con ópticas variables que da el tono
  artesanal de etiqueta de café. Se usa en: logotipo del header y footer, `h1` del hero y
  del checkout, `h2` de secciones, `h3` de cards de producto y features, el título del
  tablero y —deliberadamente— los **precios** del catálogo, que a `text-3xl` funcionan
  como pieza gráfica.
- **Body — `Inter` (`font-body`; fallback system-ui, sans-serif; pesos 400/500/600/700):**
  todo lo demás. Es la fuente por defecto del `body` (vía `@apply font-body` en
  `src/index.css`): párrafos, labels, inputs, botones, navegación, metadatos y la
  totalidad del contenido de las tarjetas del tablero. Neutra y legible en tamaños
  pequeños, que es donde vive el operador.

Jerarquía implementada (escala por utilidades de Tailwind, no hay tokens de tipo propios):

| Rol | Clases | Fuente |
|---|---|---|
| Hero H1 | `text-4xl sm:text-5xl font-semibold leading-tight` | Fraunces |
| H1 interno (checkout) | `text-3xl sm:text-4xl font-semibold` | Fraunces |
| H2 de sección | `text-3xl font-semibold` | Fraunces |
| H3 de card / precio grande | `text-xl`–`text-3xl font-semibold` | Fraunces |
| Cuerpo destacado (hero) | `text-lg` | Inter |
| Cuerpo / labels / botones | `text-sm font-medium`–`font-semibold` | Inter |
| Metadatos, chips, tablero | `text-xs` | Inter |
| Eyebrows de pasos del formulario | `text-sm font-semibold uppercase tracking-wide` | Inter |
| ID de pedido | `font-mono` | monospace del sistema |

## Layout y espaciado

No hay escala de espaciado propia: se usa la escala por defecto de Tailwind con ritmos
consistentes.

- **Contenedor único (`src/components/ui/Container.jsx`):** `max-w-5xl` centrado con
  gutters `px-5` en móvil y `px-8` desde `sm`. Vistas de foco lo estrechan: checkout
  `max-w-2xl`, confirmación `max-w-xl`, login `max-w-sm`.
- **Ritmo vertical de la landing:** secciones con `py-16 sm:py-20`; el hero respira más
  (`py-20 sm:py-28`). La separación entre bloques se logra con aire y franjas
  `surface-dim`, no con reglas divisorias.
- **Grillas:** features en `grid sm:grid-cols-3 gap-6`; catálogo en 2 columnas
  (`max-w-3xl`); el tablero escala por densidad: 1 columna en móvil, `md:grid-cols-3`,
  `xl:grid-cols-5` (una columna por estado) con `gap-4`.
- **Padding interno de cards:** `p-6`–`p-8` en la cara cliente; `p-4`–`p-5` en el
  tablero y el checkout, donde la densidad importa.
- **Header pegajoso:** `sticky top-0` con `bg-background/90 backdrop-blur` y borde
  inferior `outline/50`, para que "Comprar ahora" acompañe siempre el scroll.

## Formas

Dos radios, dos significados — no existen otros radios en el sistema:

- **`rounded-card` (1rem):** todo lo que es *contenido o superficie*: cards de producto,
  features, formulario, inputs y selects, tarjetas y columnas del tablero, cajas de
  resumen y alertas. Suficientemente redondo para ser cálido sin perder seriedad.
- **`rounded-pill` (9999px):** todo lo que es *acción o etiqueta*: botones, CTA del
  header, badge del hero, chips circulares de íconos, steppers de cantidad (+/−),
  contadores de columna del kanban y el punto del semáforo. La píldora marca "esto se
  toca" o "esto es un estado".

## Elevación

Un solo nivel de sombra, suficiente para un producto de dos superficies:

- **`shadow-card`:** `0 1px 2px rgba(43, 27, 18, 0.06), 0 8px 24px rgba(43, 27, 18, 0.08)`.
  Sombra doble (contacto nítido + difusión amplia) **teñida con `on-surface`** (`43, 27,
  18` = `#2b1b12`), de modo que la elevación se siente café y cálida, nunca gris. Se
  aplica a cards de producto y features, el formulario de login, la caja de resumen del
  checkout, el CTA principal del hero y las tarjetas de pedido del tablero.
- Las jerarquías menores se resuelven con **bordes** (`border-outline/50`–`/60`) y
  **franjas de color** (`surface-dim`), no con más niveles de sombra. No hay sombras de
  hover: el feedback interactivo es siempre un cambio de color (`transition-colors`).

## Componentes

### Botones (`src/components/ui/Button.jsx`)

Base común: `inline-flex items-center justify-center gap-2 rounded-pill px-6 py-3 text-sm
font-semibold transition-colors`. Tres variantes:

- **`primary`:** fondo `primary`, texto `on-primary`, hover `primary-strong`.
  Deshabilitado: fondo `outline` con texto `surface` y `cursor-not-allowed` (así se ve
  "Confirmar pedido" mientras envía). Es la única acción por vista.
- **`outline`:** borde y texto `primary`, hover con lavado `primary-container`.
  Deshabilitado: borde y texto `outline`.
- **`ghost`:** solo texto `primary` con hover `primary-container`. Para acciones
  terciarias ("Ver los cafés", "Limpiar filtros").

Los CTA que son enlaces (`Link` del hero, header y catálogo) replican exactamente las
clases de la variante `primary`, con padding mayor en el hero (`px-8 py-4 text-base`).

### Cards de producto (landing, `Catalog.jsx`)

`rounded-card` + `bg-surface` + `border border-outline/60` + `shadow-card` + `p-8`.
Anatomía vertical: chip-píldora con ícono `bean` sobre `primary-container`, título
Fraunces `text-2xl`, metadatos en mayúsculas (`uppercase tracking-wide`), descripción
`on-surface-muted`, precio Fraunces `text-3xl` en `primary-strong` y CTA píldora de ancho
completo. Las cards de features siguen el mismo patrón centrado, sin borde.

### Formulario de checkout (`checkout/ComprarCafe.jsx`)

- **Pasos numerados:** `fieldset` + `legend` con eyebrow ("1 · Elige tus cafés",
  "2 · Datos de entrega").
- **Selector de cantidad:** card por producto con stepper de botones píldora de 36px
  (`h-9 w-9`, borde `outline`, símbolo en `primary`, hover `primary-container`) y la
  cantidad en el centro.
- **Inputs y selects:** clase única compartida (`inputClass`): `rounded-card border
  border-outline bg-surface px-4 py-3 text-sm`, placeholder en `on-surface-muted/60`.
  Cada campo se envuelve en el helper `Field` (un `label` real con título `text-sm
  font-semibold` y error inline `text-xs text-danger` debajo).
- **Resumen de totales:** card `surface` con `shadow-card`; subtotal, domicilio por zona
  y total separado por `border-t border-outline`, en `font-semibold`.
- **Errores de servidor:** bloque `role="alert"` con texto `danger` sobre
  `danger-container`, `rounded-card`.
- **Confirmación:** card centrada con chip `success-container`/`success` e ícono `check`,
  desglose del pedido sobre fondo `background` y total "a pagar en efectivo" destacado.

### Tablero kanban (`admin/Tablero.jsx`)

- **Columnas:** una por estado (Nuevo → Preparando → En camino → Entregado +
  Devuelto/Cancelado), `rounded-card bg-surface-dim/60 p-3`, encabezado con contador en
  píldora `bg-surface`.
- **Tarjeta de pedido:** `rounded-card border-outline/60 bg-surface shadow-card p-4`,
  todo en `text-xs`/`text-sm`: cliente en negrita, franja y fecha, zona y dirección,
  teléfono, ítems, notas en itálica y total en `primary-strong`.
- **Semáforo:** punto de `h-2.5 w-2.5 rounded-pill` junto a su etiqueta textual — verde
  `bg-success` "Con tiempo", amarillo `bg-warning` "Entrega hoy", rojo `bg-danger
  animate-pulse-danger` "Franja vencida". El punto lleva `aria-hidden` porque la etiqueta
  de texto ya comunica el estado (el color nunca es el único canal).
- **Acciones de transición:** botones píldora `text-xs`; avanzar estado usa el estilo
  primario, mientras que "Cancelar/Devolver" usa la variante destructiva (borde
  `danger/40`, texto `danger`, hover `danger-container`) para que el camino irreversible
  nunca se confunda con el camino feliz.
- La leyenda del semáforo se imprime en el encabezado del tablero con los mismos tokens
  (`text-success` / `text-warning` / `text-danger`).

### Login del operador (`admin/login/LoginForm.jsx`)

Card única `max-w-sm` centrada (`rounded-card bg-surface p-8 shadow-card`) con título
Fraunces, input de clave con la misma receta de inputs y `Button` primario de ancho
completo que se deshabilita mientras envía o si la clave está vacía.

## Accesibilidad

- **Foco visible global:** `src/index.css` define `:focus-visible` con `ring-2
  ring-primary ring-offset-2 ring-offset-background` (sin outline nativo). Todo elemento
  enfocable —enlaces, botones, inputs, selects— recibe el mismo anillo café sobre offset
  crema, visible en ambas superficies.
- **Contraste:** los pares de texto principales (`on-surface` sobre
  `background`/`surface`, `on-primary` sobre `primary`, `danger` sobre
  `danger-container`) mantienen contraste alto; `on-surface-muted` se reserva para texto
  secundario de apoyo, nunca para información única o accionable.
- **El color nunca va solo:** cada punto del semáforo lleva su etiqueta de texto ("Con
  tiempo" / "Entrega hoy" / "Franja vencida") y el punto decorativo es `aria-hidden`; los
  errores de validación son texto, no solo borde rojo.
- **Labels y semántica:** todos los campos usan `label` reales (helper `Field`), los
  pasos del formulario son `fieldset`/`legend`, los errores de servidor llevan
  `role="alert"`, los steppers de cantidad tienen `aria-label` explícito ("Agregar/Quitar
  {producto}") y los SVG de `Icon` son `aria-hidden` (siempre acompañan texto).
- **Estados deshabilitados honestos:** botones con `disabled:cursor-not-allowed` y
  cambio visible de color; el select de franjas se deshabilita mientras carga y lo
  anuncia en su propio texto ("Cargando franjas…").
- **Doble envío protegido:** "Confirmar pedido" se deshabilita al primer clic y cambia su
  texto a "Confirmando…" (caso borde 5 del PRD).

## Reglas de implementación

- **Tokens solo desde `tailwind.config.js`.** Ningún componente usa colores, radios,
  sombras ni fuentes hardcodeadas (ni hex, ni `rgb()`, ni clases de la paleta por defecto
  de Tailwind como `bg-amber-700`): únicamente los tokens semánticos de este documento.
  Si se necesita un matiz nuevo, se agrega primero aquí y luego al config.
- **Copy solo desde `src/data/content.js`.** Nombres, tagline, descripciones, catálogo,
  zonas y tarifas, etiquetas de franjas, labels de estados y acciones del tablero y la
  nota de pago viven en `content.js`; los componentes no contienen textos de negocio
  hardcodeados. Cambiar un precio, una zona o un label es editar un solo archivo.
- **Íconos inline, cero dependencias visuales.** Todo ícono sale de
  `src/components/ui/Icon.jsx` (trazo 1.75 sobre caja 24×24, `stroke="currentColor"`):
  heredan el color del token del contexto y no generan requests externos.
- **El movimiento es excepcional.** La única animación declarada es `pulse-danger` y su
  único uso legítimo es el semáforo rojo del tablero. Las interacciones restantes se
  limitan a `transition-colors`.
