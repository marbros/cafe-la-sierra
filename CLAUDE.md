# CLAUDE.md — Café La Sierra

## 1. Contexto del proyecto

**Qué es.** Landing + flujo de compra con domicilio + tablero de pedidos para "Café La
Sierra", una marca de café colombiano de origen. El cliente compra desde la web sin cuenta
(pago en efectivo contra entrega); el dueño gestiona las entregas en un kanban `/admin`
protegido por clave única. En producción en https://cafe-la-sierra.vercel.app.

**Qué problema resuelve.** Los pedidos llegaban por WhatsApp, chat por chat: pedidos
olvidados, sin visibilidad de qué sale hoy. Ahora el pedido entra por la web con dirección,
zona (tarifa fija visible) y franja de entrega, y el dueño ve todo en un tablero con
semáforo contra la franja comprometida.

**Usuarios.** Comprador (sin login, 1–2 bolsas) y operador (único admin, sin roles).

## 2. Mapa de documentación — leer antes de planificar

Pipeline numerado en el orden en que se produjo; cada documento consume al anterior.
Índice completo y trazabilidad en [`docs/README.md`](docs/README.md).

| Paso | Documento | Úsalo para |
|---|---|---|
| 01 | `docs/01-producto/PRD.md` | Alcance, **no alcance**, casos borde, criterios de éxito |
| 02 | `docs/02-diseno/DESIGN.md` | Sistema visual (tokens, tipografía, semáforo) |
| 03 | `docs/03-arquitectura/TECH-DESIGN.md` + `adrs/` | Arquitectura, contrato API, ADR-0001…0010, riesgos aceptados |
| 04 | `docs/04-backlog/BACKLOG.md` | Ítems por dependencias; cada ítem = un change de OpenSpec |
| 05 | `openspec/specs/` y `openspec/changes/archive/` | Comportamiento vigente por capacidad y su historial |
| 06 | `docs/06-diagramas/` | Secuencia del pedido y flujo del admin (Mermaid) |
| 07 | `tests/` + `docs/07-testing/README.md` | Qué cubren los E2E y cómo correrlos |
| 08 | `docs/08-seguridad/SECURITY-REPORT.md` | Hallazgos y decisiones de seguridad |
| 09 | `docs/09-deploy/DEPLOY-PLAN.md` | Pipeline CI/CD, entornos, migraciones, recovery |

## 3. Arquitectura (resumen; detalle en el TECH-DESIGN)

- **Next.js 16 (App Router) en Vercel**, un solo proyecto: UI y API routes juntas (ADR-0001).
- **PostgreSQL en Neon vía Prisma 7** con `@prisma/adapter-neon` (ADR-0002, ADR-0003). Una
  sola tabla `orders` desnormalizada con los ítems como snapshot jsonb (ADR-0004).
- **Creación idempotente**: `POST /api/orders` exige `idempotencyKey` (`UNIQUE`); el
  reintento devuelve `200` con el mismo pedido (ADR-0008).
- **Zona horaria fija del negocio** (`America/Bogota`) y franjas con corte en
  `src/lib/time.js` (ADR-0007).
- **Estados del pedido** y transiciones en `src/lib/orders.js`; `PATCH` condicional al
  estado actual → `409` si otra pestaña movió la tarjeta (ADR-0005).
- **Admin**: clave única contra `ADMIN_PASSWORD`, cookie `HttpOnly` firmada con HMAC
  (ADR-0006); `src/proxy.js` es barrera optimista, cada handler re-verifica.

```
src/
  app/                       rutas: / , /comprar , /admin , /admin/login
  app/api/orders/            POST (crear) y slots/ (GET franjas pedibles)
  app/api/admin/             login/ (POST), orders/ (GET), orders/[id]/ (PATCH estado)
  components/                landing; checkout/ComprarCafe.jsx; admin/Tablero.jsx; ui/
  data/content.js            todo el copy, el catálogo (2 cafés) y la tabla de zonas
  lib/time.js                única vía para "hoy", franjas → instante, semáforo
  lib/orders.js              validación server-side, transiciones, serialización
  lib/admin-auth.js          firma y verificación de la sesión admin
  lib/db.js                  cliente Prisma (singleton)
  proxy.js                   barrera de /admin y /api/admin/*
```

## 4. Reglas duras

- **Lee `docs/01-producto/PRD.md` completo antes de planificar o generar código.** Si una
  solicitud cae fuera de "Alcance" o dentro de "No alcance", **detente y consulta**. Hoy
  fuera de alcance: pago online, cuentas/login de clientes, notificaciones, inventario,
  asignación de domiciliarios, reportes, cálculo de domicilio por distancia.
- **Toda decisión de arquitectura nueva o cambiada lleva un ADR** en
  `docs/03-arquitectura/adrs/` (formato MADR, numeración correlativa). No edites un ADR
  aceptado: crea uno nuevo que lo reemplace.
- **Los cambios de comportamiento pasan por OpenSpec** (`propose → apply → archive`), un
  change por ítem de backlog. No implementes sin spec.
- **Fechas, franjas y semáforo solo vía `src/lib/time.js`.** Nunca `new Date()` sobre
  strings de fecha fuera de ese módulo (ADR-0007).
- **El servidor es la fuente de verdad**: precios, tarifas y totales se calculan contra
  `src/data/content.js` en `src/lib/orders.js`; nunca se confía en el body (ADR-0009).
- **No reemplaces la constraint `UNIQUE (idempotency_key)`** por un chequeo previo en
  código: es lo que garantiza 0 pedidos duplicados bajo reintentos (ADR-0008).
- **Tokens de diseño solo desde `tailwind.config.js`** (derivados de DESIGN.md); copy y
  catálogo solo desde `src/data/content.js`. Nada hardcodeado en componentes.
- **Nunca toques la rama `production` de Neon** desde desarrollo ni tests. Los E2E escriben
  pedidos reales: usan `.env.e2e` (rama de desarrollo).
- **Los riesgos aceptados** (TECH-DESIGN §9) y los hallazgos abiertos del SECURITY-REPORT
  son decisiones del dueño: no los "arregles de paso".
- No leas `.env`, `.env.local` ni `.env.e2e`.

## 5. Comandos

```bash
npm install                       # instala y corre prisma generate
cp .env.example .env              # rama de desarrollo de Neon, nunca production
npx prisma migrate deploy         # aplica migraciones a la rama de .env
npm run dev                       # http://localhost:3000
npm run build                     # prisma generate && next build (lo mismo que corre CI)
npm run test:unit                 # tests unitarios (node:test) de src/lib
npm run test:e2e                  # Playwright; requiere .env.e2e con rama Neon de desarrollo
```

Antes de dar una tarea por terminada: `npm run build` y los tests que toquen tu cambio.
`main` despliega a producción solo si pasan los gates de `.github/workflows/ci-cd.yml`.
