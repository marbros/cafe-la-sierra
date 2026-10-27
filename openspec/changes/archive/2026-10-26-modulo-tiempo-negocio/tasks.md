## 1. Implementación

- [x] 1.1 `src/lib/time.js`: `BUSINESS_TIMEZONE = 'America/Bogota'` y catálogo `SLOTS`
      (`manana` 09:00–12:00 corte 08:00, `tarde` 14:00–18:00 corte 12:00) con `SLOT_IDS`
- [x] 1.2 `todayInBusinessTz` con `Intl.DateTimeFormat('en-CA', { timeZone })`,
      independiente del TZ del proceso
- [x] 1.3 `wallTimeToInstant` con regex de `date`/`time`, chequeo de fecha existente y doble
      pasada de offset para estabilizar alrededor de cambios de horario; `isValidDate`
- [x] 1.4 `isBusinessDay` (lunes a sábado, regla de calendario pura) e `isSlotOrderable`
      (franja conocida + fecha válida + día hábil + `now < cutoff` del día)
- [x] 1.5 `upcomingSlots(now, days=7)` con las franjas pedibles ordenadas; `slotEndInstant`
      y `formatDateLabel` (etiqueta legible en `es-CO`, sin zona)
- [x] 1.6 `trafficLight(order, now)`: finales → null; franja vencida → `amarillo` si
      `EN_CAMINO`, si no `rojo`; vigente → `amarillo` si la entrega es hoy, si no `verde`

## 2. Verificación

- [x] 2.1 `src/lib/time.test.js` con `node:test`: día del negocio con TZ del proceso
      cambiado, conversión de hora de pared, formatos inválidos que lanzan, domingo no
      pedible, cortes de 08:00/12:00 y los cuatro colores del semáforo
- [x] 2.2 `npm run test:unit` y `npm run build` en verde
