import { defineConfig } from "prisma/config";

// Prisma 7 no carga .env solo; Node 22+ lo hace nativamente.
try {
  process.loadEnvFile(".env");
} catch {}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: {
    // El CLI (migrate) usa la conexión directa; la app usa DATABASE_URL (pooled) vía adapter.
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "",
  },
});
