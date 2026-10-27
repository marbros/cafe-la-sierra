## Why

Las reglas de tiempo del PRD atraviesan todo el producto: franjas de lunes a sábado (mañana
o tarde) con hora de corte (caso borde 3), aceptar pedidos a cualquier hora ofreciendo solo
franjas futuras válidas (caso borde 6) y un semáforo que corre contra la franja comprometida.
Si cada módulo construyera sus propios `Date`, la validación divergiría entre el navegador
del cliente, el servidor en Vercel (UTC) y la zona real del negocio. Este change centraliza
todo el tiempo del negocio en un único módulo puro antes de la API (#4), el checkout (#5) y
el tablero (#7).

## What Changes

- Nuevo `src/lib/time.js`, única vía para fechas y horas del negocio:
  - `BUSINESS_TIMEZONE = 'America/Bogota'` y catálogo `SLOTS`: `manana` (09:00–12:00, corte
    08:00) y `tarde` (14:00–18:00, corte 12:00).
  - `todayInBusinessTz` (día del negocio), `wallTimeToInstant` (hora de pared → instante UTC,
    con validación de formato y de fecha existente), `isValidDate`, `isBusinessDay` (lunes a
    sábado), `isSlotOrderable` (franja pedible antes de su corte), `upcomingSlots` (próximas
    franjas pedibles de 7 días), `slotEndInstant` y `formatDateLabel`.
  - `trafficLight(order, now)`: semáforo verde/amarillo/rojo contra el fin de la franja;
    `null` para estados finales.
- Tests unitarios (`node:test`) en `src/lib/time.test.js`.
- Regla de proyecto: nadie construye un `Date` a partir de `date`/hora de pared fuera de
  este archivo.
- Fuera de alcance: endpoints, UI y persistencia (el módulo es lógica pura).

## Capabilities

### New Capabilities
- `business-time`: zona horaria fija del negocio, franjas con corte, día del negocio,
  conversión a instantes, pedibilidad y semáforo.

### Modified Capabilities
<!-- ninguna -->

## Impact

- Código nuevo: `src/lib/time.js`, `src/lib/time.test.js`.
- Script `test:unit` (`node --test src/lib/*.test.js`). Sin dependencias nuevas (usa
  `Intl.DateTimeFormat`), sin migraciones, importable desde cliente y servidor.
