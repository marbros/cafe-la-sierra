// E2E del carrito (ampliación 2026-10-27): agregar bebidas y grano desde la
// landing, ver el contador en el navbar, llegar al checkout con las cantidades
// precargadas y confirmar. El carrito se vacía al confirmar.
import { test, expect } from '@playwright/test';

test('el carrito conecta la landing con el checkout y se vacía al confirmar', async ({ page }) => {
  await page.goto('/');

  // 2 cappuccinos + 1 café medio desde las tarjetas de la vitrina.
  const addCappuccino = page.getByRole('button', { name: 'Agregar Cappuccino al carrito' });
  await addCappuccino.click();
  await addCappuccino.click();
  await page.getByRole('button', { name: 'Agregar Café Medio al carrito' }).click();
  await expect(page.getByTestId('carrito-badge')).toHaveText('3');

  // El ícono del carrito lleva al checkout con las cantidades precargadas.
  await page.getByTestId('carrito').click();
  await page.waitForURL('**/comprar');
  await expect(page.getByTestId('qty-cappuccino')).toHaveText('2');
  await expect(page.getByTestId('qty-cafe-medio')).toHaveText('1');
  // 2 × $12.000 + 1 × $25.000 = $49.000 (precios del catálogo del servidor).
  await expect(page.getByTestId('subtotal')).toHaveText('$49.000');

  // Datos de entrega y confirmación.
  const customer = `E2E carrito ${Date.now()}`;
  await page.getByLabel('Nombre').fill(customer);
  await page.getByLabel('Teléfono').fill('305 999 8877');
  await page.getByLabel('Dirección de entrega').fill('Calle 10 # 5-51, interior 2');
  await page.getByLabel(/Zona/).selectOption('centro');
  const franja = page.getByLabel('Día y franja de entrega');
  await franja.locator('option:not([value=""])').first().waitFor({ state: 'attached' });
  await franja.selectOption({ index: 1 });
  await page.getByRole('button', { name: 'Confirmar pedido' }).click();

  await expect(page.getByTestId('confirmacion')).toBeVisible();
  await expect(page.getByTestId('total-confirmado')).toHaveText('$53.000'); // + $4.000 Zona Centro
  await expect(page.getByTestId('confirmacion')).toContainText('2 × Cappuccino');

  // El carrito quedó vacío: al volver a la landing no hay contador.
  await page.getByRole('link', { name: 'Volver al inicio' }).click();
  await page.waitForURL(/\/$/);
  await expect(page.getByTestId('carrito-badge')).toHaveCount(0);
});
