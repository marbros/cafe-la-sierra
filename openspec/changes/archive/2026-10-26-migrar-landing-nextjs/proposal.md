## Why

La landing estática de Café La Sierra tiene un botón "Comprar ahora" que no lleva a ningún
flujo de compra real (PRD: toda venta depende de una conversación por WhatsApp). Para montar
el checkout y el tablero del operador hace falta un backend en el mismo proyecto; este change
entrega solo la migración de la portada a Next.js (App Router) — el cascarón de rutas — sin
lógica de negocio ni persistencia, para que los siguientes ítems del backlog (#2–#7)
construyan sobre una base estable.

## What Changes

- Proyecto Next.js 16 (App Router) con layout raíz (`src/app/layout.jsx`): fuentes Fraunces
  e Inter desde Google Fonts, `src/index.css` y los tokens de diseño de `tailwind.config.js`.
- Ruta `/` (`src/app/page.jsx`) con la landing: `Header`, `Hero`, `Catalog`, `Features`,
  `Footer`, con todo el copy y el catálogo desde `src/data/content.js`.
- Ruta `/comprar` creada como destino real y enlazable del flujo de compra; su contenido
  (carrito + formulario) llega con el change de checkout (`checkout-flow`).
- Todos los CTAs de compra (botón del header, CTA del hero, tarjetas del catálogo) navegan a
  `/comprar` con `next/link`.
- Sin ruteo por hash: solo rutas reales del App Router, accesibles por URL directa.
- Fuera de alcance: API routes, base de datos, checkout funcional y `/admin` (ítems
  posteriores del backlog).

## Capabilities

### New Capabilities
- `app-shell`: el cascarón de rutas de la aplicación — qué URLs existen, qué renderiza cada
  una y cómo la landing lleva a `/comprar`, preservando el contenido y el sistema visual.

### Modified Capabilities
<!-- ninguna: es la primera capacidad del proyecto -->

## Impact

- Código nuevo: `src/app/layout.jsx`, `src/app/page.jsx`, `src/app/comprar/page.jsx`,
  `next.config.js`, `postcss.config.js`.
- Componentes de la landing en `src/components/` (`Header`, `Hero`, `Catalog`, `Features`,
  `Footer`) y primitivas en `src/components/ui/`; copy y catálogo en `src/data/content.js`.
- `package.json`: scripts `dev`/`build`/`start` de Next.js; Tailwind escanea `src/**`.
- Sin impacto de backend: este change no introduce lógica de servidor.
