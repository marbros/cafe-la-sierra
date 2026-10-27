// @ts-check
import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { defineConfig, devices } from '@playwright/test';

// Los E2E escriben pedidos reales: usan SIEMPRE la rama Neon de desarrollo definida en .env.e2e
// (nunca la de producción). En CI no existe .env.e2e: la rama de desarrollo llega por secrets.
let e2eEnv;
if (process.env.CI && process.env.DATABASE_URL) {
  e2eEnv = {
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_URL_UNPOOLED: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ?? 'e2e-password',
    ADMIN_SESSION_SECRET: process.env.ADMIN_SESSION_SECRET ?? 'e2e-secret-no-productivo-0123456789abcdef',
  };
} else {
  try {
    e2eEnv = parseEnv(readFileSync('.env.e2e', 'utf8'));
  } catch {
    throw new Error('Falta .env.e2e con DATABASE_URL de la rama Neon de desarrollo. Los E2E no corren contra producción.');
  }
}

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // En CI se prueba el build de producción (lo mismo que se despliega); en local, el dev server.
    command: process.env.CI ? 'npm run build && npm run start' : 'npm run dev',
    url: 'http://localhost:3000',
    // false a propósito: un dev server ya levantado podría apuntar a la DB de producción.
    reuseExistingServer: false,
    timeout: 180_000,
    env: e2eEnv,
  },
});
