import test from 'node:test';
import assert from 'node:assert/strict';
import { parseOrderBody, TRANSITIONS, STATUSES } from './orders.js';

// Lunes 06:00 de Bogotá: todas las franjas del día siguen pedibles.
const NOW = new Date('2026-10-26T06:00:00.000-05:00');

const validBody = () => ({
  items: [{ productId: 'cafe-medio', qty: 2 }],
  customerName: 'Ana Pérez',
  customerPhone: '300 123 4567',
  address: 'Calle 45 # 12-34, apto 201',
  zoneId: 'centro',
  date: '2026-10-26',
  slot: 'tarde',
  notes: null,
  idempotencyKey: '7f9c2ba4-e88f-4ecd-9a8b-3c5d1e2f4a6b',
});

test('un body válido produce montos calculados por el servidor', () => {
  const { data, fields } = parseOrderBody(validBody(), NOW);
  assert.equal(fields, undefined);
  assert.equal(data.subtotal, 50000); // 2 × $25.000 del catálogo, no del cliente
  assert.equal(data.deliveryFee, 4000); // tarifa de la zona centro
  assert.equal(data.total, 54000);
  assert.equal(data.zoneName, 'Zona Centro');
  assert.equal(data.items[0].unitPrice, 25000);
});

test('los precios del body se ignoran: manda el catálogo', () => {
  const body = validBody();
  body.items = [{ productId: 'cafe-medio', qty: 1, unitPrice: 1 }];
  body.total = 1;
  const { data } = parseOrderBody(body, NOW);
  assert.equal(data.items[0].unitPrice, 25000);
  assert.equal(data.total, 29000);
});

test('rechaza carrito vacío, productos desconocidos, repetidos y cantidades fuera de rango', () => {
  for (const items of [
    [],
    [{ productId: 'cafe-inexistente', qty: 1 }],
    [{ productId: 'cafe-medio', qty: 1 }, { productId: 'cafe-medio', qty: 2 }],
    [{ productId: 'cafe-medio', qty: 0 }],
    [{ productId: 'cafe-medio', qty: 11 }],
    [{ productId: 'cafe-medio', qty: 1.5 }],
  ]) {
    const body = { ...validBody(), items };
    assert.deepEqual(parseOrderBody(body, NOW).fields, ['items'], JSON.stringify(items));
  }
});

test('valida teléfono, dirección, zona e idempotencyKey', () => {
  const cases = [
    [{ customerPhone: '12345' }, 'customerPhone'],
    [{ customerPhone: 'abc-def-ghi' }, 'customerPhone'],
    [{ address: 'corta' }, 'address'],
    [{ zoneId: 'luna' }, 'zoneId'],
    [{ idempotencyKey: 'no-es-uuid' }, 'idempotencyKey'],
  ];
  for (const [patch, field] of cases) {
    const res = parseOrderBody({ ...validBody(), ...patch }, NOW);
    assert.ok(res.fields?.includes(field), `${field}: ${JSON.stringify(res)}`);
  }
});

test('rechaza franjas vencidas, domingos y fechas inválidas (PRD casos borde 3 y 6)', () => {
  // La franja de la mañana cierra a las 08:00: a las 09:00 ya no es pedible.
  const nueveAm = new Date('2026-10-26T09:00:00.000-05:00');
  let res = parseOrderBody({ ...validBody(), slot: 'manana' }, nueveAm);
  assert.ok(res.fields?.includes('slot'));
  // Domingo.
  res = parseOrderBody({ ...validBody(), date: '2026-10-25' }, NOW);
  assert.ok(res.fields?.includes('slot'));
  // Fecha inexistente.
  res = parseOrderBody({ ...validBody(), date: '2026-02-30' }, NOW);
  assert.ok(res.fields?.includes('date'));
});

test('las transiciones del tablero cubren los 5 estados y los finales no salen', () => {
  assert.deepEqual(Object.keys(TRANSITIONS).sort(), [...STATUSES].sort());
  assert.deepEqual(TRANSITIONS.NUEVO, ['PREPARANDO', 'CANCELADO']);
  assert.deepEqual(TRANSITIONS.EN_CAMINO, ['ENTREGADO', 'CANCELADO']);
  assert.deepEqual(TRANSITIONS.ENTREGADO, []);
  assert.deepEqual(TRANSITIONS.CANCELADO, []);
});
