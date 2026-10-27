# Project Context

## Purpose

**Café La Sierra: del pedido a tu puerta.** Landing page + flujo de compra de café con
entrega a domicilio + tablero kanban del operador. El cliente compra desde la landing sin
cuenta (pago en efectivo contra entrega); el dueño gestiona las entregas en un tablero único
`/admin` protegido por clave única, con semáforo contra la franja comprometida y filtros por
día y zona. Reemplaza la gestión de pedidos por chats de WhatsApp.

Fuente de alcance y no-alcance: `docs/01-producto/PRD.md`. Fuera de alcance hoy: pago
online, cuentas de cliente, notificaciones automáticas, inventario, asignación de
domiciliarios, reportes, integraciones externas y cálculo de domicilio por dirección.

## Tech Stack

- **Next.js 16 (App Router)** en Vercel, un solo proyecto: UI y API routes juntas.
- **React 18**, componentes JSX en `src/components/`.
- **PostgreSQL en Neon vía Prisma 7** con `@prisma/adapter-neon` (driver serverless).
  Una sola tabla `orders` desnormalizada (`prisma/schema.prisma`).
- **Tailwind CSS 3** con tokens de diseño en `tailwind.config.js`.
- **Tests:** unitarios con `node:test` (`npm run test:unit`, `src/lib/*.test.js`) y E2E con
  Playwright (`npm run test:e2e`).

```
src/
  app/                       rutas: / , /comprar , /admin , /admin/login
  app/api/orders/            POST (crear pedido) y slots/ (GET franjas pedibles)
  app/api/admin/             login/ (POST) , orders/ (GET listado) , orders/[id]/ (PATCH estado)
  components/                secciones de la home; checkout/ComprarCafe.jsx = flujo de compra
  components/admin/Tablero.jsx  tablero kanban del operador
  components/ui/             primitivas (Button, Container, Icon)
  data/content.js            copy, catálogo de cafés, tabla de zonas y etiquetas del tablero
  lib/time.js                única vía para "hoy", franjas, cortes y semáforo
  lib/orders.js              validación server-side del body, transiciones y serialización
  lib/admin-auth.js          firma y verificación de la sesión admin (HMAC)
  lib/db.js                  cliente Prisma (singleton, adapter Neon)
  proxy.js                   barrera de /admin y /api/admin/* (se re-verifica en cada handler)
```

## Project Conventions

### Code Style

- JavaScript (ESM, `"type": "module"`), JSX sin TypeScript. Comentarios en español.
- Copy y catálogo **solo** desde `src/data/content.js`; tokens de diseño solo desde
  `tailwind.config.js`. Nada de textos ni colores hardcodeados en componentes.

### Architecture Patterns

- **El servidor es la fuente de verdad:** precios, tarifas de zona, subtotal y total se
  calculan en `src/lib/orders.js` contra `src/data/content.js`; nunca se confía en el cliente.
- **Fechas y horas solo vía `src/lib/time.js`:** zona fija del negocio `America/Bogota`,
  franjas `manana`/`tarde` con hora de corte, y semáforo. Nadie construye un `Date` a partir
  de `date`/hora de pared fuera de ese archivo.
- **Creación idempotente:** `POST /api/orders` exige `idempotencyKey` (uuid, `UNIQUE` en la
  DB); el reintento devuelve `200` con el mismo pedido, nunca lo duplica.
- **Tablero con transiciones válidas:** `NUEVO → PREPARANDO → EN_CAMINO → ENTREGADO`, con
  `CANCELADO` como final alternativo; el `PATCH` es condicional al estado actual para no
  pisar cambios concurrentes.
- **Admin:** clave única contra `ADMIN_PASSWORD`, cookie `HttpOnly` firmada con HMAC-SHA256
  (`ADMIN_SESSION_SECRET`); el proxy es barrera optimista y cada handler/página re-verifica.

### Testing Strategy

- Unitarios de la lógica pura de `src/lib/` (`time.js`, `orders.js`) con `node:test`.
- E2E con Playwright sobre el flujo de compra y el tablero; escriben pedidos reales: usan
  una rama de desarrollo de Neon, nunca la de producción.
- Antes de dar una tarea por terminada: `npm run build` y los tests que toque el cambio.

### Git Workflow

- Un change de OpenSpec por ítem de backlog; los cambios de comportamiento pasan por
  OpenSpec antes de implementarse.
- No commitear `.env` ni credenciales (`.env.example` documenta las variables).

## Domain Context

- Catálogo: 2 cafés de 340g — Café Medio $25.000 y Café Oscuro $27.000 (COP), máx. 10
  unidades por producto.
- Zonas de entrega con tarifa fija definida por el dueño: Norte $5.000, Centro $4.000,
  Occidente $6.000, Sur $6.000.
- Franjas de entrega: lunes a sábado, `manana` (9:00–12:00, corte 8:00) y `tarde`
  (14:00–18:00, corte 12:00). El semáforo del tablero corre contra el fin de la franja.
- Pago: efectivo contra entrega. Sin pagos online ni cuentas.

## Important Constraints

- El domingo no hay entregas; una franja del mismo día deja de ofrecerse pasada su hora de
  corte (casos borde 3 y 6 del PRD).
- El botón "Confirmar" se deshabilita al enviar y la `idempotencyKey` nace una vez por
  intento de compra: un doble clic o un reintento de red no duplican el pedido (caso borde 5).
- Un pedido fallido en la entrega pasa a `CANCELADO` (Devuelto/Cancelado), sin reintento
  automático (caso borde 4).
- Variables requeridas: `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `ADMIN_PASSWORD`,
  `ADMIN_SESSION_SECRET` (opcional `ADMIN_SESSION_TTL_HOURS`, default 168).

## External Dependencies

- **Neon** (PostgreSQL serverless): base de datos; rama de desarrollo para local/tests,
  rama de producción solo en Vercel.
- **Vercel**: hosting del proyecto Next.js (UI + API).
- **Google Fonts**: Fraunces e Inter, cargadas desde el layout raíz.
