// E2E de los casos borde del PRD: validación del formulario (caso 2), doble envío
// idempotente (caso 5) y franjas solo válidas (casos 3 y 6).
import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';

test('el formulario no deja confirmar con datos inválidos y señala cada campo', async ({ page }) => {
  await page.goto('/comprar');
  await page.getByRole('button', { name: 'Confirmar pedido' }).click();

  await expect(page.getByText('Elige al menos una bolsa de café.')).toBeVisible();
  await expect(page.getByText('Escribe tu nombre.')).toBeVisible();
  await expect(page.getByText(/teléfono válido/)).toBeVisible();
  await expect(page.getByText(/dirección completa/)).toBeVisible();
  await expect(page.getByText('Elige tu zona para ver la tarifa del domicilio.')).toBeVisible();
  await expect(page.getByTestId('confirmacion')).toHaveCount(0);

  // Teléfono con letras tampoco pasa.
  await page.getByLabel('Teléfono').fill('no-es-un-telefono');
  await page.getByRole('button', { name: 'Confirmar pedido' }).click();
  await expect(page.getByText(/teléfono válido/)).toBeVisible();
});

test('doble envío con la misma idempotencyKey crea UN solo pedido (PRD caso 5)', async ({ request }) => {
  const { slots } = await (await request.get('/api/orders/slots')).json();
  expect(slots.length).toBeGreaterThan(0);

  const body = {
    items: [{ productId: 'cafe-oscuro', qty: 1 }],
    customerName: `E2E idem ${Date.now()}`,
    customerPhone: '301 555 0000',
    address: 'Carrera 7 # 11-22, casa 3',
    zoneId: 'norte',
    date: slots[0].date,
    slot: slots[0].slot,
    notes: null,
    idempotencyKey: randomUUID(),
  };

  const primera = await request.post('/api/orders', { data: body });
  expect(primera.status()).toBe(201);
  const pedido1 = await primera.json();
  // El servidor calculó los montos contra el catálogo: $27.000 + $5.000 de la Zona Norte.
  expect(pedido1.total).toBe(32000);

  // Mismo envío otra vez (reintento de red / doble clic): mismo pedido, no uno nuevo.
  const segunda = await request.post('/api/orders', { data: body });
  expect(segunda.status()).toBe(200);
  const pedido2 = await segunda.json();
  expect(pedido2.id).toBe(pedido1.id);
});

test('la API rechaza franjas inválidas y precios inventados', async ({ request }) => {
  const { slots } = await (await request.get('/api/orders/slots')).json();
  const base = {
    items: [{ productId: 'cafe-medio', qty: 1 }],
    customerName: 'E2E inválido',
    customerPhone: '302 555 1111',
    address: 'Avenida Siempre Viva 742',
    zoneId: 'sur',
    date: slots[0].date,
    slot: slots[0].slot,
    idempotencyKey: randomUUID(),
  };

  // Domingo (el servidor nunca lo ofrece; se fuerza a mano) → 422 por la franja.
  const domingo = await request.post('/api/orders', {
    data: { ...base, date: '2026-11-01', idempotencyKey: randomUUID() },
  });
  expect(domingo.status()).toBe(422);
  expect((await domingo.json()).fields).toContain('slot');

  // El precio del body se ignora: manda el catálogo del servidor.
  const conPrecioFalso = await request.post('/api/orders', {
    data: { ...base, items: [{ productId: 'cafe-medio', qty: 1, unitPrice: 1 }], idempotencyKey: randomUUID() },
  });
  expect(conPrecioFalso.status()).toBe(201);
  expect((await conPrecioFalso.json()).total).toBe(31000); // $25.000 + $6.000 Zona Sur
});
