// E2E del flujo más importante del PRD (criterio de éxito de usabilidad):
// landing → checkout → confirmación → el pedido aparece en el tablero del operador
// y puede avanzar de estado.
import { test, expect } from '@playwright/test';
import { completarCheckout, loginAdmin } from './helpers.js';

test('el cliente compra desde la landing y el pedido llega al tablero', async ({ page }) => {
  // Landing: la promesa y el CTA llevan al checkout (el botón roto del PRD ya no existe).
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Café colombiano');
  await page.getByRole('link', { name: 'Comprar ahora' }).first().click();
  await page.waitForURL('**/comprar');

  // Checkout: 2 × Café Medio ($25.000) + domicilio Zona Centro ($4.000) = $54.000.
  const customer = await completarCheckout(page, { cantidad: 2 });
  await expect(page.getByTestId('confirmacion')).toBeVisible();
  await expect(page.getByTestId('total-confirmado')).toHaveText('$54.000');
  await expect(page.getByTestId('confirmacion')).toContainText('efectivo');

  // Tablero: el pedido entra como tarjeta en "Nuevo" con los datos de entrega.
  await loginAdmin(page);
  const columnaNuevo = page.getByTestId('columna-NUEVO');
  const tarjeta = columnaNuevo.locator('article', { hasText: customer });
  await expect(tarjeta).toBeVisible();
  await expect(tarjeta).toContainText('Zona Centro');
  await expect(tarjeta).toContainText('2 × Café Medio');
  await expect(tarjeta).toContainText('$54.000');

  // El operador lo mueve a "Preparando" (transición válida NUEVO → PREPARANDO).
  await tarjeta.getByRole('button', { name: 'Preparar' }).click();
  await expect(page.getByTestId('columna-PREPARANDO').locator('article', { hasText: customer })).toBeVisible();
  await expect(columnaNuevo.locator('article', { hasText: customer })).toHaveCount(0);
});

test('el tablero exige login: /admin sin sesión redirige', async ({ page }) => {
  await page.goto('/admin');
  await page.waitForURL('**/admin/login');
  await expect(page.getByLabel('Clave de acceso')).toBeVisible();
});
