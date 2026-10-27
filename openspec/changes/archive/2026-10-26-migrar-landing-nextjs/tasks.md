## 1. Tooling

- [x] 1.1 Inicializar el proyecto Next.js 16: `package.json` con scripts `dev`/`build`/`start`,
      `next.config.js` y `postcss.config.js` con `tailwindcss` + `autoprefixer`
- [x] 1.2 Configurar `tailwind.config.js` con los tokens de diseño y `content` sobre
      `./src/**/*.{js,jsx}`

## 2. Cascarón de rutas

- [x] 2.1 `src/app/layout.jsx`: metadata del sitio, fuentes Fraunces/Inter de Google Fonts e
      import de `src/index.css`
- [x] 2.2 `src/app/page.jsx`: landing con `Header`, `Hero`, `Catalog`, `Features`, `Footer`
      en ese orden
- [x] 2.3 `src/app/comprar/page.jsx`: ruta real `/comprar` con `Header` y `Footer`, destino
      de todos los CTAs
- [x] 2.4 Apuntar los CTAs ("Comprar ahora" del header, CTA del hero, botones de las
      tarjetas del catálogo) a `/comprar` con `next/link`

## 3. Contenido

- [x] 3.1 `src/data/content.js`: copy del sitio, features y catálogo de los 2 cafés (Medio
      $25.000 y Oscuro $27.000 / 340g) como única fuente de verdad

## 4. Verificación

- [x] 4.1 `npm run build` en verde con las rutas `/` y `/comprar` en el listado del build
- [x] 4.2 Revisión manual: `/` renderiza la landing completa y cada CTA navega a `/comprar`;
      `/comprar` responde ante URL directa y recarga
