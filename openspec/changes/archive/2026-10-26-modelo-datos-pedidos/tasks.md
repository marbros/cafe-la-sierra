## 1. Entorno

- [x] 1.1 Crear el proyecto en Neon con rama de desarrollo y documentar `DATABASE_URL` /
      `DATABASE_URL_UNPOOLED` en `.env.example` (nunca commitear `.env`)

## 2. Esquema

- [x] 2.1 `prisma/schema.prisma`: model `Order` mapeado a `orders` con `id` uuid
      (`gen_random_uuid()`), `items Json`, montos `Int`, datos de entrega, `date @db.Date`,
      `slot`, `status @default("NUEVO")`, `notes?`, timestamps `@db.Timestamptz(6)` e
      `idempotencyKey @unique @db.Uuid`
- [x] 2.2 Índice `@@index([date, zoneId])` para los filtros del tablero
- [x] 2.3 Aplicar la migración a la rama de desarrollo de Neon

## 3. Cliente

- [x] 3.1 `src/lib/db.js`: `PrismaClient` con `PrismaNeon({ connectionString:
      process.env.DATABASE_URL })`, singleton cacheado en `globalThis`
- [x] 3.2 `package.json`: `prisma generate` en `build` y `postinstall`

## 4. Verificación

- [x] 4.1 `npm run build` en verde (incluye `prisma generate`)
- [x] 4.2 Insert y select de prueba contra la rama de desarrollo: `notes` null acepta,
      campo obligatorio omitido rechaza, `idempotency_key` duplicada rechaza, `status`
      default `NUEVO`
