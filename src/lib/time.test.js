import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isBusinessDay,
  isSlotOrderable,
  slotEndInstant,
  todayInBusinessTz,
  trafficLight,
  upcomingSlots,
  wallTimeToInstant,
} from './time.js';

// Bogotá es UTC-5 sin DST: 08:00 pared = 13:00Z.
const bogota = (date, time) => new Date(`${date}T${time}:00.000-05:00`);

test('wallTimeToInstant convierte hora de pared de Bogotá a instante UTC', () => {
  assert.equal(
    wallTimeToInstant('2026-10-26', '08:00').toISOString(),
    '2026-10-26T13:00:00.000Z',
  );
});

test('wallTimeToInstant rechaza fechas inexistentes y formatos inválidos', () => {
  assert.throws(() => wallTimeToInstant('2026-02-30', '08:00'));
  assert.throws(() => wallTimeToInstant('2026-1-1', '08:00'));
  assert.throws(() => wallTimeToInstant('2026-01-01', '25:00'));
});

test('todayInBusinessTz usa el día de Bogotá, no el de UTC', () => {
  // 23:30 en Bogotá del día 26 son 04:30Z del 27: el negocio sigue en el 26.
  assert.equal(todayInBusinessTz(bogota('2026-10-26', '23:30')), '2026-10-26');
});

test('isBusinessDay: lunes a sábado sí, domingo no', () => {
  assert.equal(isBusinessDay('2026-10-26'), true); // lunes
  assert.equal(isBusinessDay('2026-10-31'), true); // sábado
  assert.equal(isBusinessDay('2026-10-25'), false); // domingo
});

test('corte de franjas del mismo día (PRD caso borde 3)', () => {
  const date = '2026-10-26'; // lunes
  // A las 07:59 ambas franjas del día siguen disponibles.
  assert.equal(isSlotOrderable(date, 'manana', bogota(date, '07:59')), true);
  assert.equal(isSlotOrderable(date, 'tarde', bogota(date, '07:59')), true);
  // A las 08:00 cerró la mañana; la tarde sigue hasta las 12:00.
  assert.equal(isSlotOrderable(date, 'manana', bogota(date, '08:00')), false);
  assert.equal(isSlotOrderable(date, 'tarde', bogota(date, '11:59')), true);
  assert.equal(isSlotOrderable(date, 'tarde', bogota(date, '12:00')), false);
});

test('nunca se ofrecen domingos ni franjas pasadas', () => {
  assert.equal(isSlotOrderable('2026-10-25', 'manana', bogota('2026-10-20', '06:00')), false);
  const slots = upcomingSlots(bogota('2026-10-24', '13:00'), 7); // sábado 13:00: ya cerró todo el día
  assert.ok(slots.length > 0);
  assert.ok(slots.every(({ date }) => isBusinessDay(date)));
  assert.equal(slots.some(({ date }) => date === '2026-10-24'), false);
  assert.equal(slots.some(({ date }) => date === '2026-10-25'), false);
});

test('la franja vence al final de su ventana (contra esto corre el semáforo)', () => {
  assert.equal(slotEndInstant('2026-10-26', 'manana').toISOString(), bogota('2026-10-26', '12:00').toISOString());
  assert.equal(slotEndInstant('2026-10-26', 'tarde').toISOString(), bogota('2026-10-26', '18:00').toISOString());
});

test('semáforo del PRD: verde con tiempo, amarillo hoy, rojo vencida sin salir', () => {
  const pedido = (status, date = '2026-10-27', slot = 'manana') => ({ status, date, slot });
  const lunes10am = bogota('2026-10-26', '10:00');
  // Mañana → verde.
  assert.equal(trafficLight(pedido('NUEVO'), lunes10am), 'verde');
  // Hoy, franja aún no vencida → amarillo.
  assert.equal(trafficLight(pedido('NUEVO', '2026-10-26'), lunes10am), 'amarillo');
  // Franja de la mañana vencida (13:00) y el pedido no salió → rojo.
  const lunes1pm = bogota('2026-10-26', '13:00');
  assert.equal(trafficLight(pedido('NUEVO', '2026-10-26'), lunes1pm), 'rojo');
  assert.equal(trafficLight(pedido('PREPARANDO', '2026-10-26'), lunes1pm), 'rojo');
  // Vencida pero ya en camino → amarillo (salió tarde, pero salió).
  assert.equal(trafficLight(pedido('EN_CAMINO', '2026-10-26'), lunes1pm), 'amarillo');
  // Estados finales no llevan semáforo.
  assert.equal(trafficLight(pedido('ENTREGADO', '2026-10-26'), lunes1pm), null);
  assert.equal(trafficLight(pedido('CANCELADO', '2026-10-26'), lunes1pm), null);
});
