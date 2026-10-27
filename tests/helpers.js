import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';

// Misma resolución de entorno que playwright.config.js: en CI llegan por secrets,
// en local desde .env.e2e (rama de desarrollo de Neon, nunca producción).
function e2eEnv() {
  if (process.env.CI && process.env.DATABASE_URL) return process.env;
  try {
    return { ...parseEnv(readFileSync('.env.e2e', 'utf8')), ...process.env };
  } catch {
    return process.env;
  }
}

export const ADMIN_PASSWORD = e2eEnv().ADMIN_PASSWORD ?? 'e2e-password';

/** Completa el checkout en /comprar para un pedido válido. Devuelve el nombre único usado. */
export async function completarCheckout(page, { nombre, cantidad = 2 } = {}) {
  const customer = nombre ?? `E2E ${Date.now()}-${Math.floor(Math.random() * 1e5)}`;
  await page.goto('/comprar');

  const mas = page.getByRole('button', { name: 'Agregar Café Medio' });
  for (let i = 0; i < cantidad; i++) await mas.click();

  await page.getByLabel('Nombre').fill(customer);
  await page.getByLabel('Teléfono').fill('300 123 4567');
  await page.getByLabel('Dirección de entrega').fill('Calle 45 # 12-34, apto 201');
  await page.getByLabel(/Zona/).selectOption('centro');
  // Primera franja válida ofrecida por el servidor.
  const franja = page.getByLabel('Día y franja de entrega');
  await franja.locator('option:not([value=""])').first().waitFor({ state: 'attached' });
  await franja.selectOption({ index: 1 });

  await page.getByRole('button', { name: 'Confirmar pedido' }).click();
  return customer;
}

/** Inicia sesión del operador y espera el tablero. */
export async function loginAdmin(page) {
  await page.goto('/admin/login');
  await page.getByLabel('Clave de acceso').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.waitForURL('**/admin');
}
