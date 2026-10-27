# ADR-0002 — Persistencia en PostgreSQL gestionado por Neon

- Estado: aceptada · Fecha: 2026-10-26

## Contexto

Los pedidos deben sobrevivir a las funciones efímeras de Vercel y ser visibles por el
operador desde cualquier dispositivo. El curso fija PostgreSQL en Neon (capa gratuita).

## Decisión

**Neon Postgres** con dos ramas: `production` (solo Vercel) y una rama de desarrollo para
local y E2E. La app usa la conexión *pooled*; las migraciones usan la conexión directa.

## Consecuencias

- (+) Postgres real con constraints (`UNIQUE` para la idempotencia) y tipos fuertes.
- (+) Ramas de datos: los tests E2E nunca tocan producción.
- (−) Latencia de red en cada query; aceptable para el volumen del MVP.
