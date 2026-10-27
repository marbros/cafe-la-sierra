## Why

El cascarón Next.js (#1) ya está, pero no hay dónde persistir un pedido: sin base de datos
compartida, el checkout y el tablero del operador (PRD) no pueden existir. Este change crea
el modelo de datos de pedidos sobre PostgreSQL en Neon con Prisma 7, como fundamento de la
API pública (#4) y del tablero (#7).

## What Changes

- Tabla única `orders` desnormalizada (un pedido = una tarjeta del tablero) en
  `prisma/schema.prisma`: snapshot de ítems en JSON, montos enteros calculados por el
  servidor, datos de entrega (zona con nombre y tarifa congelados), `date` + `slot`,
  `status` texto con default `NUEVO`, `notes` opcional y timestamps.
- `idempotency_key` (uuid) con constraint `UNIQUE`: base de la creación idempotente (#4).
- Índice compuesto `(date, zone_id)` para los filtros por día y zona del tablero.
- Cliente Prisma singleton (`src/lib/db.js`) con `@prisma/adapter-neon`
  (driver serverless) cacheado en `globalThis`, apto para Vercel y hot-reload.
- Fuera de alcance: endpoints HTTP (#4), validación del body (#4) y UI.

## Capabilities

### New Capabilities
- `orders-data`: modelo de datos persistente y compartido de los pedidos y la conexión a la
  base que lo respalda.

### Modified Capabilities
<!-- ninguna -->

## Impact

- Código nuevo: `prisma/schema.prisma` (model `Order` → tabla `orders`),
  `prisma.config.ts`, `src/lib/db.js`.
- Dependencias: `prisma`, `@prisma/client`, `@prisma/adapter-neon`,
  `@neondatabase/serverless`; `build` y `postinstall` corren `prisma generate`.
- Variables: `DATABASE_URL` (pooler) y `DATABASE_URL_UNPOOLED` (migraciones), documentadas
  en `.env.example`. La rama de producción de Neon solo vive en Vercel.
