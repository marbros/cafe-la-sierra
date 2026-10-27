# Backlog — Café La Sierra

> Consume: [`PRD.md`](../01-producto/PRD.md) + [`TECH-DESIGN.md`](../03-arquitectura/TECH-DESIGN.md) + ADRs.
> Ordenado por dependencias: cada ítem asume los anteriores. **Cada ítem = un change de
> OpenSpec** (`openspec/changes/archive/`), implementado vía `propose → apply → archive`.

| # | Ítem | Entrega | Depende de | ADRs | Change OpenSpec | Estado |
|---|---|---|---|---|---|---|
| 1 | **Migrar la landing a Next.js App Router** con el design system (tokens de DESIGN.md); CTA "Comprar ahora" → `/comprar` | La landing existente servida por Next, misma promesa visual, lista para recibir el checkout | — | 0001 | `2026-10-26-migrar-landing-nextjs` | ✅ |
| 2 | **Modelo de datos de pedidos** en Neon vía Prisma: tabla `orders` desnormalizada + migración inicial | `prisma/schema.prisma` + migración aplicada a la rama de desarrollo | 1 | 0002, 0003, 0004 | `2026-10-26-modelo-datos-pedidos` | ✅ |
| 3 | **Módulo de tiempo del negocio**: zona America/Bogota, franjas mañana/tarde con cortes, lunes-sábado, semáforo | `src/lib/time.js` + tests unitarios de cortes y semáforo | — | 0007 | `2026-10-26-modulo-tiempo-negocio` | ✅ |
| 4 | **API de pedidos**: `POST /api/orders` idempotente con validación server-side + `GET /api/orders/slots` | Endpoints con contrato del TECH-DESIGN §4; replay 200 ante doble envío | 2, 3 | 0005, 0008, 0009, 0010 | `2026-10-26-api-pedidos-idempotente` | ✅ |
| 5 | **Checkout `/comprar`**: carrito de 2 cafés, formulario con zona (tarifa visible) y franja, confirmación | Flujo de compra completo contra la API; casos borde 1–3 y 5 del PRD | 1, 4 | 0009, 0010 | `2026-10-26-checkout-comprar` | ✅ |
| 6 | **Acceso del operador**: login con clave única, cookie HMAC, proxy sobre `/admin` y `/api/admin/*` | `/admin/login` funcional; rutas privadas cerradas | 1 | 0006 | `2026-10-26-admin-login` | ✅ |
| 7 | **Tablero kanban con semáforo**: 5 columnas, transiciones válidas, filtros día/zona, refresco 60 s | `/admin` operativo contra pedidos reales; PATCH condicional (409 concurrencia) | 2, 3, 6 | 0005, 0007 | `2026-10-26-tablero-kanban-semaforo` | ✅ |

## Fuera del backlog de producto (pipeline de calidad, sesiones 11–13)

- Tests E2E con Playwright del flujo de compra y del tablero → `tests/` + `docs/07-testing/`.
- Security pass → `docs/08-seguridad/SECURITY-REPORT.md`.
- Deploy plan + CI/CD con gates → `docs/09-deploy/DEPLOY-PLAN.md` + `.github/workflows/ci-cd.yml`.

## Recorte acordado (PRD, riesgo "alcance vs tiempo")

Si algo se cae, se recorta el tablero avanzado (filtros), **nunca** el flujo de compra.
No hizo falta: los 7 ítems entraron.
