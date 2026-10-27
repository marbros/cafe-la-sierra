# ADR-0001 — Next.js 16 (App Router) en Vercel, un solo proyecto

- Estado: aceptada · Fecha: 2026-10-26
- Decisores: dueño del producto + agente

## Contexto

El curso exige desplegar en Vercel. El producto tiene UI pública (landing + checkout), un
panel privado y una API pequeña. Mantener frontend y backend como proyectos separados
duplicaría despliegues y configuración.

## Decisión

Un único proyecto **Next.js 16 con App Router**: Server Components para las páginas, Client
Components para checkout y tablero, y route handlers (`app/api/**`) como API. JavaScript
(`.js/.jsx`), sin TypeScript, para mantener el stack del curso.

## Consecuencias

- (+) Un solo deploy, un solo dominio, cero CORS.
- (+) Vercel es el entorno natural de Next: build y funciones sin configuración extra.
- (−) La API queda acoplada al ciclo de vida de Next; aceptable para este alcance.

## Alternativas consideradas

- Vite + Express separado: dos despliegues y CORS sin beneficio para este tamaño.
- Mantener la landing estática y solo API serverless: perdería el checkout integrado.
