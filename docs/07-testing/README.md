# Testing — qué se prueba y cómo correrlo

> Consume: los **criterios de éxito** y **casos borde** del [`PRD`](../01-producto/PRD.md).
> Los specs viven en [`tests/`](../../tests/) (Playwright) y [`src/lib/*.test.js`](../../src/lib/) (unitarios).

## Unitarios (`npm run test:unit`, node:test — sin base de datos)

| Archivo | Cubre |
|---|---|
| `src/lib/time.test.js` | Conversión hora de pared Bogotá → instante; día del negocio vs UTC; lunes-sábado; **cortes de franja** (8:00 / 12:00, PRD caso 3); fin de franja; **semáforo** verde/amarillo/rojo (incl. `EN_CAMINO` vencido → amarillo y finales sin semáforo) |
| `src/lib/orders.test.js` | Montos calculados por el servidor; **precios del body ignorados** (ADR-0009); carrito vacío/repetidos/cantidades fuera de rango; teléfono/dirección/zona/uuid; franjas vencidas/domingo/fecha inexistente; **transiciones del tablero** |

## E2E (`npm run test:e2e`, Playwright + Chromium)

Escriben **pedidos reales**: usan `.env.e2e` con una rama de **desarrollo** de Neon
(nunca producción). En CI las credenciales llegan por secrets. `playwright.config.js`
levanta el servidor solo (`reuseExistingServer: false` a propósito).

| Spec | Flujo | PRD |
|---|---|---|
| `comprar-pedido.spec.js` | Landing → CTA → checkout 2×Café Medio → confirmación con total → login admin → tarjeta en "Nuevo" → transición a "Preparando". Más: `/admin` sin sesión redirige a login | Criterio de usabilidad; flujo principal |
| `comprar-errores.spec.js` | Formulario vacío señala cada campo; **doble envío con la misma idempotencyKey → un solo pedido (201 + 200 mismo id)**; domingo forzado → 422; precio inventado en el body → lo ignora el catálogo | Casos borde 2, 3, 5, 6 |

## Cómo correr los E2E en local

```bash
# .env.e2e en la raíz (NO commitear): rama de desarrollo de Neon
DATABASE_URL="postgresql://...-pooler.../neondb?sslmode=require"
DATABASE_URL_UNPOOLED="postgresql://.../neondb?sslmode=require"
ADMIN_PASSWORD="clave-e2e"
ADMIN_SESSION_SECRET="secreto-e2e-largo-0123456789abcdef0123456789abcdef"

npx playwright install chromium   # una sola vez
npm run test:e2e
```

En CI (`.github/workflows/ci-cd.yml`) los E2E corren contra el **build de producción**
(`next build && next start`) y son **gate del deploy**: si uno falla, no se despliega.
