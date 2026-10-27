# ADR-0007 — Zona horaria fija del negocio y módulo único de tiempo

- Estado: aceptada · Fecha: 2026-10-26

## Contexto

Las franjas de entrega ("mañana", "tarde"), sus cortes y el semáforo del tablero son
**hora de pared del negocio** (Colombia). El servidor corre en UTC (Vercel) y el navegador
del cliente puede estar en cualquier zona o con el reloj corrido. Mezclar `new Date()`
ingenuos produce franjas que "vencen" a deshoras.

## Decisión

Zona fija **`America/Bogota`** (UTC-5, sin DST) en `src/lib/time.js`, **único módulo** que
convierte `date` ('YYYY-MM-DD') + hora de pared a instantes UTC (vía `Intl` con doble pasada
de offset). Ahí viven las franjas (mañana 9:00–12:00, corte 8:00; tarde 14:00–18:00, corte
12:00), la regla lunes-a-sábado, `upcomingSlots` y `trafficLight` (semáforo). Las franjas
pedibles salen de `GET /api/orders/slots` con el **reloj del servidor**; el POST re-valida.

## Consecuencias

- (+) El corte y el semáforo son deterministas y testeados (`time.test.js`).
- (+) El reloj del navegador no puede habilitar franjas vencidas (hallazgo de la revisión
  adversarial #3).
- (−) Si el negocio cambiara de país habría que tocar una constante; aceptable.
