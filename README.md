# ☕ Café La Sierra — del pedido a tu puerta

Landing + checkout con domicilio + tablero de pedidos para una marca de café colombiano.
Proyecto integrador del curso **Desarrollo AI-first con Claude**: todo el ciclo
(PRD → diseño → arquitectura → backlog → specs → código → tests → seguridad → deploy) fue
construido con Claude Code y quedó documentado en este repo.

- **El cliente** compra 1–2 bolsas desde la web sin registrarse: elige café y cantidad, zona
  (tarifa de domicilio fija y visible) y franja de entrega (lunes a sábado, mañana o tarde).
  Paga en efectivo al recibir.
- **El dueño** gestiona las entregas en `/admin`: kanban de 5 estados con semáforo contra la
  franja comprometida (verde con tiempo / amarillo hoy / rojo vencida) y filtros por día y zona.

## Stack

Next.js 16 (App Router) · PostgreSQL en Neon · Prisma 7 (`@prisma/adapter-neon`) ·
Tailwind CSS · Playwright · GitHub Actions → Vercel.

## Correr en local

```bash
npm install
cp .env.example .env    # DATABASE_URL de una rama de DESARROLLO de Neon + claves admin
npx prisma migrate deploy
npm run dev             # http://localhost:3000
```

Tests: `npm run test:unit` (lógica de franjas/semáforo/validación) y `npm run test:e2e`
(Playwright; requiere `.env.e2e`, ver `docs/07-testing/README.md`).

## Documentación (pipeline AI-first)

El índice completo, con la trazabilidad PRD → ADR → backlog → spec → test, está en
[`docs/README.md`](docs/README.md). Para agentes: [`CLAUDE.md`](CLAUDE.md).

| Paso | Artefacto |
|---|---|
| 01 Producto | [`docs/01-producto/PRD.md`](docs/01-producto/PRD.md) |
| 02 Diseño | [`docs/02-diseno/DESIGN.md`](docs/02-diseno/DESIGN.md) |
| 03 Arquitectura | [`docs/03-arquitectura/TECH-DESIGN.md`](docs/03-arquitectura/TECH-DESIGN.md) + [`adrs/`](docs/03-arquitectura/adrs/) |
| 04 Backlog | [`docs/04-backlog/BACKLOG.md`](docs/04-backlog/BACKLOG.md) |
| 05 Specs | [`openspec/`](openspec/) |
| 06 Diagramas | [`docs/06-diagramas/`](docs/06-diagramas/) |
| 07 Testing | [`tests/`](tests/) + [`docs/07-testing/`](docs/07-testing/) |
| 08 Seguridad | [`docs/08-seguridad/SECURITY-REPORT.md`](docs/08-seguridad/SECURITY-REPORT.md) |
| 09 Deploy | [`docs/09-deploy/DEPLOY-PLAN.md`](docs/09-deploy/DEPLOY-PLAN.md) + [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml) |
