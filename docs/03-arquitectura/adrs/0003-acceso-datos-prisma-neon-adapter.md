# ADR-0003 — Acceso a datos con Prisma 7 + @prisma/adapter-neon

- Estado: aceptada · Fecha: 2026-10-26

## Contexto

Las funciones serverless de Vercel abren y cierran conexiones constantemente; un pool TCP
clásico de Postgres se agota. Neon ofrece un driver serverless (HTTP/WebSocket).

## Decisión

**Prisma 7** como ORM con el adapter **`@prisma/adapter-neon`** sobre
`@neondatabase/serverless`. Cliente singleton cacheado en `globalThis` (`src/lib/db.js`).
En Prisma 7 la URL vive en `prisma.config.ts`: el CLI de migraciones usa
`DATABASE_URL_UNPOOLED` (directa) y la app `DATABASE_URL` (pooled).

## Consecuencias

- (+) Esquema declarativo, migraciones versionadas en `prisma/migrations/`, tipos del cliente.
- (+) Conexiones aptas para serverless sin PgBouncer propio.
- (−) Dependencia doble (Prisma + driver Neon); es el patrón recomendado por ambos.
