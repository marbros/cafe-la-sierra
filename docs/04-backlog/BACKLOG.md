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
| 8 | **Rediseño visual v2 "cuero y crema"**: tema oscuro de brulería artesanal (referencia elegida por el dueño) en landing, checkout, login y tablero; tokens nuevos, glass cards, framer-motion, assets propios | Las 4 vistas con un solo lenguaje visual; DESIGN.md v2; E2E en verde sin cambios de lógica | 1, 5, 7 | — (sin cambio de arquitectura) | `2026-10-27-rediseno-cuero-crema` | ✅ |
| 9 | **Catálogo ampliado (3 bebidas) + carrito persistente con ícono en navbar**: Cappuccino, Latte y Mocha (`kind: 'bebida'`) junto al grano; botón "+" en las tarjetas, carrito en localStorage y checkout conectado | Vitrina con 5 productos y carrito conectado al checkout; E2E `carrito.spec.js` | 5, 8 | — (reusa 0009) | `2026-10-27-catalogo-bebidas-carrito` | ✅ |

## Fuera del backlog de producto (pipeline de calidad, sesiones 11–13)

- Tests E2E con Playwright del flujo de compra y del tablero → `tests/` + `docs/07-testing/`.
- Security pass → `docs/08-seguridad/SECURITY-REPORT.md`.
- Deploy plan + CI/CD con gates → `docs/09-deploy/DEPLOY-PLAN.md` + `.github/workflows/ci-cd.yml`.

## Recorte acordado (PRD, riesgo "alcance vs tiempo")

Si algo se cae, se recorta el tablero avanzado (filtros), **nunca** el flujo de compra.
No hizo falta: los 7 ítems entraron.

## Próxima iteración (pendiente — priorizado, no comprometido)

| # | Ítem | Origen | Prioridad |
|---|---|---|---|
| 10 | Límites de longitud en campos de texto del pedido y horizonte máximo de fecha (hoy acepta cualquier fecha futura) | SECURITY-REPORT **SP-02** | Alta |
| 11 | Logout del admin y procedimiento de revocación de sesión (rotar `ADMIN_SESSION_SECRET` documentado como mecanismo) | SECURITY-REPORT **SP-03** | Alta |
| 12 | Tests E2E de seguridad del admin (transiciones inválidas por API, sesión expirada) | SECURITY-REPORT **SP-04** | Media |
| 13 | Cabeceras de seguridad propias (CSP, `frame-ancestors`, `Referrer-Policy`) en `next.config.js` | SECURITY-REPORT **SP-06** | Media |
| 14 | Rate limiting en `POST /api/orders` y login admin (hoy riesgo aceptado) | SECURITY-REPORT **SP-01** / TECH-DESIGN §9 | Media |
| 15 | Notificación al cliente por WhatsApp (`wa.me`) al confirmar — hoy la confirmación en pantalla es el único comprobante | Riesgo aceptado TECH-DESIGN §9 | Baja |
| 16 | Panel para editar zonas/tarifas sin deploy, si empiezan a cambiar seguido | Supuesto del PRD / ADR-0010 | Baja |

Regla: cada ítem que se tome pasa por el mismo ciclo (ADR si cambia arquitectura → change de
OpenSpec → código + tests). Los ítems 10–14 **actualizan el estado de su hallazgo** en el
SECURITY-REPORT al cerrarse.
