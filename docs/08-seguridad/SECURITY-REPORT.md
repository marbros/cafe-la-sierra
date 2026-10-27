# Security Report — Café La Sierra

Fecha: 2026-10-26 · Tipo: Security Pass (solo análisis, el proyecto no fue modificado)

## Executive Summary

**Qué es el sistema.** Next.js 16 (App Router) desplegado en Vercel, con Prisma 7 +
`@prisma/adapter-neon` sobre Neon Postgres. Tiene una landing estática, un flujo de compra
público y anónimo (`/comprar` → `POST /api/orders`, `GET /api/orders/slots`) y un tablero
kanban `/admin` protegido por una clave única con cookie de sesión firmada con HMAC. Guarda
PII de clientes (nombre, teléfono, dirección y notas de entrega). El repo todavía no tiene
commits (`git log` vacío) y no hay `.env` en el directorio: el despliegue descrito en
`README.md` y `.github/workflows/ci-cd.yml` es el camino previsto, no un hecho verificado.

**Actores considerados.** Comprador anónimo (legítimo o script malicioso), el operador
(único admin), alguien que adivina o roba la clave de admin, y el pipeline de CI/CD
(GitHub Actions → Deploy Hook de Vercel).

**Postura general.** Los controles centrales están bien resueltos: autorización del admin en
dos capas con re-verificación autoritativa en cada handler, comparación de la clave en
tiempo constante, precios y totales calculados siempre en el servidor (sin mass assignment),
idempotencia por constraint `UNIQUE`, nada de SQL crudo ni HTML sin escapar, CSRF mitigado
por `SameSite=Lax`, y `npm audit` limpio. Los riesgos reales están en la **disponibilidad e
integridad del flujo público anónimo**: no hay rate limiting (riesgo ya aceptado por el
dueño en TECH-DESIGN §9), pero además hay huecos de validación **no cubiertos** por esa
aceptación: campos de texto sin longitud máxima, fecha de entrega sin horizonte, y un
tablero que carga todo sin paginación. En el plano de sesión, no existe logout ni
procedimiento de revocación.

| Severidad | Cantidad |
|---|---|
| CRÍTICA | 0 |
| ALTA | 1 (aceptada por el dueño) |
| MEDIA | 3 |
| BAJA | 4 |

| ID | Severidad | Título | Estado |
|---|---|---|---|
| SP-01 | ALTA | Sin rate limiting en `POST /api/orders` ni en el login de admin | Aceptado por el dueño (TECH-DESIGN §9) |
| SP-02 | MEDIA | Sin límites de longitud ni horizonte de fecha; tablero sin paginación | Pendiente |
| SP-03 | MEDIA | Sesión de 7 días sin logout ni procedimiento de revocación | Pendiente |
| SP-04 | MEDIA | Las rutas de admin casi no tienen tests de seguridad automatizados | Pendiente |
| SP-05 | BAJA | `idempotencyKey` expuesta en respuestas de admin; el replay devuelve el pedido completo | Pendiente |
| SP-06 | BAJA | Sin cabeceras de seguridad propias (CSP, frame-ancestors, Referrer-Policy) | Pendiente |
| SP-07 | BAJA | `console.error` con el objeto de error completo hacia los logs | Pendiente (bajo) |
| SP-08 | BAJA | PII sin aviso de privacidad ni política de retención/borrado | Pendiente (decisión de producto) |

**Capas revisadas:** producto (`docs/01-producto/PRD.md`), arquitectura
(`docs/03-arquitectura/TECH-DESIGN.md` §7 y §9, ADRs 0001–0010), código (`src/app/api/**`,
`src/proxy.js`, `src/lib/*`, componentes de checkout y admin), datos (`prisma/schema.prisma`),
configuración (`.env.example`, `.gitignore`, `next.config.js`, `vercel.json`,
`playwright.config.js`, `.github/workflows/ci-cd.yml`), dependencias (`npm audit`) y tests
(`tests/`, `src/lib/*.test.js`). **No se leyeron** `.env*` reales (regla de CLAUDE.md; además
no existen en el directorio).

## Fortalezas (lo que está bien resuelto)

- **Autorización de admin en dos capas, verificada en el servidor.** `src/proxy.js:5-16` es
  la barrera optimista sobre `/admin/:path*` y `/api/admin/:path*` (matcher en
  `src/proxy.js:18-20`), y cada superficie re-verifica de forma autoritativa:
  `src/app/admin/page.jsx:10`, `src/app/api/admin/orders/route.js:17` y
  `src/app/api/admin/orders/[id]/route.js:16` llaman `hasValidAdminSession()` antes de tocar
  datos. El GET de admin —que devuelve la PII de todos los pedidos— responde `401` sin
  cookie válida, y el smoke post-deploy lo verifica en producción
  (`.github/workflows/ci-cd.yml:149-151`).
- **Clave y token sin fugas de timing.** `passwordMatches` compara los HMAC de ambas claves
  byte a byte en tiempo constante (`src/lib/admin-auth.js:35-41`, `equalBytes` en 22-27; la
  longitud es fija, 32 bytes de SHA-256, así que el early-return por longitud no filtra
  nada). El token de sesión valida formato con regex estricta, firma y expiración
  (`src/lib/admin-auth.js:49-58`). Si faltan `ADMIN_PASSWORD` o `ADMIN_SESSION_SECRET`, el
  login falla cerrado con `503 ADMIN_NOT_CONFIGURED`
  (`src/app/api/admin/login/route.js:17`).
- **Cookie de sesión bien configurada.** `httpOnly`, `secure` en producción,
  `sameSite: 'lax'`, `path: '/'` y `maxAge` igual al TTL del token
  (`src/app/api/admin/login/route.js:30-36`).
- **CSRF mitigado.** La cookie es `SameSite=Lax`, así que un sitio de terceros no puede
  disparar `POST /api/admin/login` ni `PATCH /api/admin/orders/:id` con la cookie del
  operador (los métodos no seguros cross-site no la llevan). Los GET de navegación sí la
  llevan, pero ningún GET tiene efectos secundarios. El tablero y el login usan `fetch`
  same-origin (`src/components/admin/Tablero.jsx:84,107`,
  `src/app/admin/login/LoginForm.jsx:20`).
- **Sin mass assignment de precios: el servidor es la única autoridad.**
  `parseOrderBody` reconstruye el snapshot de ítems contra el catálogo
  (`src/lib/orders.js:59-89`: `PRODUCTS.get(it.productId)`, `unitPrice: product.price`), la
  tarifa sale de la tabla de zonas (`src/lib/orders.js:51-57`) y `subtotal`/`total` se suman
  en el servidor (`src/lib/orders.js:87,91-93`). El body no puede fijar `status` ni montos:
  `data` solo contiene campos cuyo valor puso el servidor, y el `create` usa exactamente ese
  objeto (`src/app/api/orders/route.js:24`). Cantidades acotadas 1..10 y sin productos
  repetidos (`src/lib/orders.js:71-77`).
- **Franja re-validada con el reloj del servidor.** `isSlotOrderable` rechaza fechas
  inexistentes, domingos y franjas cuyo corte ya pasó, en la zona fija del negocio
  (`src/lib/orders.js:96-102`, `src/lib/time.js:106-110`), cerrando el vector "reloj local
  corrido" (TECH-DESIGN §8.3).
- **Idempotencia y anti-duplicados por constraint, no por chequeo previo.**
  `idempotency_key uuid UNIQUE` (`prisma/schema.prisma:31`); el `P2002` se resuelve
  releyendo por la key y devolviendo `200` con el mismo pedido
  (`src/app/api/orders/route.js:27-41`). La key debe ser un UUID válido y se normaliza a
  minúsculas (`src/lib/orders.js:108-112`).
- **Concurrencia del tablero sin pisar estados.** `PATCH` valida la transición contra
  `TRANSITIONS` y usa `updateMany({ where: { id, status: actual } })`: si otra pestaña movió
  la tarjeta, `count === 0` → `409` (`src/app/api/admin/orders/[id]/route.js:32-45`).
- **Sin superficie de inyección ni XSS conocida.** Todo el acceso a datos pasa por Prisma
  tipado; `grep` de `$queryRaw`, `$executeRaw`, `eval(` y `dangerouslySetInnerHTML` en
  `src/` no devuelve nada. React escapa el contenido controlado por anónimos que el admin ve
  (`customerName`, `address`, `notes` en `src/components/admin/Tablero.jsx:26-48`). Los
  filtros del GET admin se validan contra calendario y tabla de zonas antes de ir al `where`
  (`src/app/api/admin/orders/route.js:24-31`).
- **Sin caching de datos sensibles.** Todas las respuestas de API llevan
  `Cache-Control: no-store` y `dynamic = 'force-dynamic'` (p. ej.
  `src/app/api/orders/route.js:4-7`, `src/app/api/admin/orders/route.js:7-10`).
- **Dependencias limpias.** `npm audit` y `npm audit --omit=dev` reportan **0
  vulnerabilidades** con el lockfile actual (`next@16.4.3`, `@prisma/client@7.10.1`,
  `react@18.3.1`). El CI repite la auditoría en cada build
  (`.github/workflows/ci-cd.yml:38-40`), aunque como paso informativo
  (`continue-on-error: true`).
- **Higiene de secretos.** `.gitignore:7-9` ignora `.env` y `.env.*` (solo `.env.example`
  entra), más `.vercel/`. `.env.example` solo tiene placeholders con instrucciones de
  reemplazo (`.env.example:8-10`). El repo no tiene commits aún, así que no hay historial
  que auditar, y no existe ningún `.env` en el directorio. En CI, el build usa una
  `DATABASE_URL` placeholder (`ci-cd.yml:35-37`), los PRs de forks no reciben secrets
  (`ci-cd.yml:5,45`) y el deploy es por Deploy Hook: CI nunca ve las variables de producción
  (`ci-cd.yml:95-102`).
- **Tests aislados de producción.** `playwright.config.js` exige `.env.e2e` (rama de
  desarrollo de Neon) y usa `reuseExistingServer: false` para no reutilizar un server que
  apunte a producción; en CI los E2E corren con secrets del environment `e2e` y concurrencia
  serializada (`ci-cd.yml:48-52`).

## Hallazgos

### SP-01 — Sin rate limiting: un anónimo puede inundar la tabla de pedidos y probar claves sin límite

- **Severidad:** ALTA
- **Estado:** **Aceptado por el dueño** (TECH-DESIGN.md §9, línea "Sin rate limiting en
  `POST /api/orders` y `POST /api/admin/login`: aceptado para el MVP")
- **Categoría:** Abuso de lógica de negocio / Agotamiento de recursos / Fuerza bruta
- **Evidencia:** `src/app/api/orders/route.js:11-43` (POST anónimo, sin ningún contador ni
  límite por IP), `src/app/api/admin/login/route.js:16-38` (intentos de clave ilimitados),
  `docs/03-arquitectura/TECH-DESIGN.md:151-152` (riesgo aceptado con mitigación futura:
  Vercel WAF / upstash ratelimit).
- **Vector:** (a) Un script envía miles de `POST /api/orders` con bodies válidos (cada uno
  con un `idempotencyKey` UUID distinto, que el propio atacante genera): cada request crea
  una fila permanente — no existe borrado de pedidos, solo `CANCELADO`. El tablero del
  operador se llena de pedidos falsos mezclados con los reales y el almacenamiento de Neon
  crece sin tope. (b) Un diccionario contra `POST /api/admin/login`: si `ADMIN_PASSWORD` es
  débil, el atacante obtiene la cookie y con ella la PII de **todos** los clientes
  (`GET /api/admin/orders` devuelve nombre, teléfono y dirección de cada pedido).
- **Impacto potencial:** Pérdida de la utilidad del tablero (el criterio de éxito principal
  del PRD depende de que el operador confíe en él), costos de almacenamiento, y en el caso
  (b) exposición total de la PII.
- **Mitigación existente:** La comparación en tiempo constante y el `401` genérico
  (`INVALID_CREDENTIALS`) no aceleran la fuerza bruta; la idempotencia impide duplicados
  *accidentales* pero no *intencionales* (keys distintas). Nada limita el volumen.
- **Decisión:** El dueño ya aceptó este riesgo explícitamente para el MVP en TECH-DESIGN §9,
  con mitigación futura nombrada (Vercel WAF / `@upstash/ratelimit`). Se documenta como
  **aceptado**, no como pendiente. Recomendación si se reevalúa: priorizar primero el
  throttling del login (protege PII) y después el del checkout (protege disponibilidad).
  Nota: SP-02 (abajo) **amplifica** este riesgo y *no* está cubierto por la aceptación.

### SP-02 — Sin límites de longitud en los campos de texto, sin horizonte máximo de fecha, y tablero sin paginación

- **Severidad:** MEDIA
- **Estado:** **Pendiente** (no está entre los riesgos aceptados de TECH-DESIGN §9)
- **Categoría:** Validación de entrada insuficiente / Agotamiento de recursos
- **Evidencia:**
  - `src/lib/orders.js:36-40`: `customerName`, `customerPhone` y `address` solo exigen
    "string no vacío" — **sin longitud máxima**. `notes` sí está acotado a 500
    (`src/lib/orders.js:104-106`) y la tabla lo documenta (`TECH-DESIGN.md §3`), pero los
    demás campos son `text` sin límite también en la DB (`prisma/schema.prisma:20-22`).
  - `src/lib/orders.js:42-47`: el teléfono exige 7–15 **dígitos**, pero `PHONE_CHARS_RE`
    admite espacios, puntos, paréntesis y guiones **ilimitados**: `"3001234567" + "."×1 000 000`
    pasa la validación.
  - `src/lib/orders.js:96-102` + `src/lib/time.js:106-110`: `isSlotOrderable` solo comprueba
    `now < corte` — **cualquier fecha futura** válida de calendario pasa (hasta `9999-12-31`,
    `DATE_RE` admite 4 dígitos de año, `src/lib/time.js:15`). El `GET /api/orders/slots`
    solo *ofrece* 7 días (`src/lib/time.js:113-125`), pero eso es UI: el POST acepta lo que
    venga.
  - `src/app/api/admin/orders/route.js:34-37`: `findMany` **sin `take`** — sin filtro de
    fecha carga todas las filas; `src/components/admin/Tablero.jsx:79-95` las renderiza todas
    y refresca cada 60 s (`Tablero.jsx:100`).
  - `src/components/checkout/ComprarCafe.jsx:228-291`: los inputs no tienen `maxLength`.
- **Vector:** Un atacante envía pocos pedidos con `customerName`/`address` cercanos al
  límite de body de Vercel (~4.5 MB, mitigación de plataforma, no del proyecto) y/o con
  fechas a años vista. Cada apertura de `/admin` serializa y renderiza megabytes y el
  polling lo repite cada minuto: el tablero se vuelve inusable y el operador pierde
  visibilidad de los pedidos reales. Los pedidos a `9999-12-31` quedan "verdes" para siempre
  en la columna `NUEVO` y nunca vencen en el semáforo (`src/lib/time.js:143-148`).
- **Impacto potencial:** Denegación de servicio del panel admin con muy pocos requests
  (independiente del rate limiting de SP-01), filas basura permanentes, costo de
  almacenamiento y egress.
- **Mitigación existente:** Límite de body de la plataforma Vercel; `notes ≤ 500`;
  `items` acotado (máx. 2 productos × qty 10).
- **Recomendación:** (1) En `parseOrderBody`: `customerName ≤ 80`, `customerPhone ≤ 24`
  caracteres totales, `address ≤ 200`. (2) Validar `date ≤ hoy + N días` (N=7 ya es lo que
  ofrece `upcomingSlots`; con eso el servidor y la UI dicen lo mismo). (3) Reflejar los
  límites con `maxLength` en `ComprarCafe.jsx`. (4) `take` + filtro por defecto (p. ej.
  pedidos no finales o últimos 30 días) en el GET de admin. Verificación sugerida: test de
  API con `address` de 10 000 caracteres → `422 fields:['address']`; `date` a 2 años →
  `422 fields:['date']`.

### SP-03 — Sesión de admin de 7 días sin logout ni procedimiento de revocación

- **Severidad:** MEDIA
- **Estado:** **Pendiente** (TECH-DESIGN §9 acepta "clave única sin usuarios ni
  recuperación" y el no-rate-limiting del login, pero **no** menciona la ausencia de logout
  ni la revocación)
- **Categoría:** Gestión de sesión
- **Evidencia:** `src/lib/admin-auth.js:6` (TTL por defecto 168 h = 7 días, comentario:
  "supuesto: el PRD no fija la duración"); `src/app/api/admin/` solo contiene `login/`,
  `orders/` y `orders/[id]/` — **no hay ruta de logout** ni botón en el tablero
  (`src/components/admin/Tablero.jsx` no tiene "salir"). El token es `exp.HMAC(secret, exp)`
  (`src/lib/admin-auth.js:43-47`): no depende de `ADMIN_PASSWORD`, así que **rotar la clave
  no invalida las cookies ya emitidas**; solo rotar `ADMIN_SESSION_SECRET` lo hace, y ese
  procedimiento no está documentado en el README ni en el TECH-DESIGN.
- **Vector:** El operador abre `/admin` en un equipo prestado o compartido: la sesión queda
  viva hasta 7 días sin forma de cerrarla desde el producto. Si sospecha un robo de cookie y
  rota la clave (la reacción intuitiva), el atacante sigue dentro hasta que el token expire.
- **Impacto potencial:** Acceso prolongado no autorizado al tablero y a la PII de todos los
  pedidos.
- **Mitigación existente:** Cookie `httpOnly` (no robable por JS), `secure` en producción,
  TTL configurable vía `ADMIN_SESSION_TTL_HOURS` (`src/lib/admin-auth.js:10-13`,
  `.env.example:11-12`), y la rotación de `ADMIN_SESSION_SECRET` sí revoca todo (el
  mecanismo existe, falta documentarlo).
- **Recomendación:** (1) Ruta `POST /api/admin/logout` que borre la cookie
  (`store.delete(ADMIN_COOKIE)`) y botón "Salir" en el tablero. (2) Documentar en el README:
  "revocar todas las sesiones = rotar `ADMIN_SESSION_SECRET` en Vercel". (3) Opcional:
  incluir un HMAC derivado de `ADMIN_PASSWORD` en el mensaje firmado para que rotar la clave
  también invalide sesiones. (4) Considerar bajar el TTL por defecto (24–48 h) para un panel
  que se consulta a diario. Verificación: logout → `GET /api/admin/orders` responde `401`.

### SP-04 — Las rutas de admin casi no tienen tests de seguridad automatizados

- **Severidad:** MEDIA
- **Estado:** **Pendiente**
- **Categoría:** Tests de seguridad ausentes
- **Evidencia:** `tests/` contiene solo `comprar-pedido.spec.js`, `comprar-errores.spec.js`
  y `helpers.js`. La única cobertura de auth es un test de redirect
  (`tests/comprar-pedido.spec.js:35-38`: `/admin` sin sesión → `/admin/login`) y el login
  feliz del helper (`tests/helpers.js:39-44`). **Nadie prueba**: `GET /api/admin/orders`
  directo sin cookie → `401`; cookie forjada o vencida → `401`; login con clave incorrecta →
  `401` sin `Set-Cookie`; `PATCH` sin sesión → `401`; ni la validación de entrada del POST
  (`422` por campo). Los unit tests (`src/lib/orders.test.js`, `src/lib/time.test.js`)
  cubren la lógica pura pero no los handlers. El smoke de CI sí verifica los dos primeros
  casos, pero **solo después de desplegar** (`ci-cd.yml:149-151`), no como gate.
- **Vector:** Un refactor futuro (un endpoint admin nuevo que olvide `hasValidAdminSession`,
  o un cambio en el `matcher` de `src/proxy.js:18-20`) expone la PII y ningún test lo
  detecta antes del deploy. El diseño depende de que **cada** handler repita la
  verificación: ese es exactamente el modo de falla que un test de regresión debe cubrir.
- **Impacto potencial:** Regresión silenciosa que expone nombre, teléfono y dirección de
  todos los clientes.
- **Mitigación existente:** Doble verificación proxy + handler (hoy no hay regresión) y el
  smoke post-deploy (detecta tarde, pero detecta).
- **Recomendación:** Un spec de Playwright con `request` (sin navegador): `GET
  /api/admin/orders` sin cookie → `401` y sin datos; con token `123.abc…` forjado → `401`;
  login con clave mala → `401` sin `Set-Cookie`; login correcto → `200` + cookie `HttpOnly`;
  `PATCH` sin sesión → `401`; `POST /api/orders` con precio en el body → el pedido guarda el
  precio del catálogo. Verificación: romper a propósito la verificación de un handler y
  confirmar que el test falla.

### SP-05 — `idempotencyKey` expuesta en las respuestas de admin; el replay devuelve el pedido completo de otro cliente

- **Severidad:** BAJA
- **Estado:** **Pendiente**
- **Categoría:** Exposición de datos / Diseño de idempotencia
- **Evidencia:** `serializeOrder` incluye `idempotencyKey` en el JSON
  (`src/lib/orders.js:141`) y esa serialización se usa en **todas** las respuestas: el POST
  público (`src/app/api/orders/route.js:25,36`), el GET de admin
  (`src/app/api/admin/orders/route.js:38`) y el PATCH
  (`src/app/api/admin/orders/[id]/route.js:47`). Además, el camino de replay devuelve el
  pedido existente **sin comparar el body** con el original
  (`src/app/api/orders/route.js:32-36`): cualquier `POST /api/orders` con una key ya usada y
  un body válido recibe `200` con el pedido ajeno completo (nombre, teléfono, dirección).
- **Vector:** La key funciona como un "token de lectura" del pedido: quien la conozca puede
  recuperar la PII de ese pedido vía el POST público, sin sesión de admin. Hoy el único
  lugar donde se filtra es la respuesta del admin (que ya ve todo) y el navegador del propio
  comprador, y las keys son UUID v4 (`crypto.randomUUID()` en
  `src/components/checkout/ComprarCafe.jsx:38`, 122 bits — no adivinables). Por eso la
  severidad es baja: es superficie innecesaria, no una brecha explotable hoy.
- **Impacto potencial:** Si en el futuro las keys se registran en logs, analytics o URLs,
  cada key filtrada equivale a la PII de un pedido.
- **Mitigación existente:** Keys aleatorias de alta entropía; validación estricta de formato
  UUID (`src/lib/orders.js:108-112`).
- **Recomendación:** Omitir `idempotencyKey` de `serializeOrder` (el tablero no la usa:
  `grep idempotencyKey src/components/` no devuelve nada) o al menos de las respuestas del
  GET/PATCH de admin. Opcional, endurecimiento del replay: responder `200` solo con un
  subconjunto (id, total, franja) o verificar que el body del reintento coincide con el
  pedido original (409 si no). Verificación: el JSON de `GET /api/admin/orders` no contiene
  `idempotencyKey`.

### SP-06 — Sin cabeceras de seguridad propias (CSP, frame-ancestors, Referrer-Policy)

- **Severidad:** BAJA
- **Estado:** **Pendiente**
- **Categoría:** Configuración / Defensa en profundidad
- **Evidencia:** `next.config.js:2` es un objeto vacío — no hay `headers()`. `vercel.json`
  solo desactiva el deploy por git. No se define `Content-Security-Policy`,
  `X-Frame-Options`/`frame-ancestors`, `Referrer-Policy` ni `Permissions-Policy` en ninguna
  parte del repo.
- **Vector:** Hoy no hay ningún vector de XSS conocido (React escapa todo, sin
  `dangerouslySetInnerHTML`), así que esto es defensa en profundidad. Si un cambio futuro
  renderiza `notes` o `address` como HTML/markdown, no habría CSP que contenga el script
  inyectado — y `notes`/`address` son texto controlado por anónimos que el admin ve con
  sesión activa. `/admin` también podría embeberse en un iframe de terceros (clickjacking
  del tablero).
- **Impacto potencial:** Bajo hoy; amplifica regresiones futuras.
- **Mitigación existente:** Escapado automático de React; Vercel añade HSTS por defecto en
  dominios `*.vercel.app` (mitigación de plataforma, no del proyecto).
- **Recomendación:** `headers()` en `next.config.js` con una CSP básica
  (`default-src 'self'`; ajustar para los estilos inline de Next),
  `frame-ancestors 'none'` (o `X-Frame-Options: DENY`),
  `Referrer-Policy: strict-origin-when-cross-origin` y un `Permissions-Policy` mínimo.
  Verificación: `curl -I` de `/`, `/comprar` y `/admin/login` muestra las cabeceras.

### SP-07 — `console.error` con el objeto de error completo hacia los logs

- **Severidad:** BAJA
- **Estado:** **Pendiente** (riesgo bajo; aceptable si se decide dejarlo)
- **Categoría:** Logging / Exposición en observabilidad
- **Evidencia:** `src/app/api/orders/route.js:28,39`, `src/app/api/admin/orders/route.js:40`
  y `src/app/api/admin/orders/[id]/route.js:49` hacen `console.error(ruta, err)` con el
  error de Prisma completo. Punto a favor: **ningún log incluye el body del request ni PII
  de forma deliberada**, y las respuestas al cliente son códigos opacos
  (`INTERNAL_ERROR`), sin stack traces — eso está bien resuelto.
- **Vector:** Los errores de Prisma pueden incluir en su mensaje metadatos de la query y, en
  errores de validación del cliente Prisma, fragmentos de los datos de entrada (que aquí
  contienen nombre/teléfono/dirección). Esos mensajes van a los logs de Vercel, visibles
  para cualquiera con acceso al proyecto de Vercel. Es una ampliación menor de la superficie
  de exposición de PII, no una vulnerabilidad directa.
- **Impacto potencial:** PII ocasional en logs de plataforma con retención propia.
- **Mitigación existente:** Solo se loguea en caminos de error; el `P2002` esperado no se
  loguea; los logs de Vercel requieren acceso a la cuenta.
- **Recomendación:** Loguear `err.code` y `err.message` en lugar del objeto completo, o
  dejarlo como está y documentar la decisión (volumen esperado de errores: muy bajo).

### SP-08 — PII de clientes sin aviso de privacidad ni política de retención y borrado

- **Severidad:** BAJA
- **Estado:** **Pendiente — decisión de producto del dueño** (el PRD no lo menciona ni en
  alcance ni en no-alcance; no es un riesgo aceptado en TECH-DESIGN §9)
- **Categoría:** Privacidad / Requisito ausente
- **Evidencia:** Se guardan nombre, teléfono, dirección y notas sin plazo
  (`prisma/schema.prisma:20-22,28`). El checkout no muestra ningún aviso de tratamiento de
  datos (`src/components/checkout/ComprarCafe.jsx:223-292` — solo campos y la nota de pago).
  No existe mecanismo de borrado ni anonimización: los estados finales (`ENTREGADO`,
  `CANCELADO`) conservan la fila completa para siempre. El negocio opera en Colombia
  (`BUSINESS_TIMEZONE = 'America/Bogota'`, `src/lib/time.js:5`; precios en COP), donde rige
  la Ley 1581 de 2012 de protección de datos personales (autorización del titular y
  finalidad del tratamiento).
- **Vector:** No es un ataque sino exposición acumulativa: cuanto más tiempo pasa, mayor es
  el impacto de cualquier compromiso del admin (SP-01b, SP-03) o de la DB, más el riesgo de
  incumplimiento regulatorio. La aplicabilidad exacta la debe confirmar el dueño o un
  asesor.
- **Mitigación existente:** El acceso al histórico requiere la clave de admin; la PII mínima
  necesaria para entregar (no se piden email, cédula ni pago).
- **Recomendación:** Decisión de producto: texto breve de autorización de datos en el
  checkout, plazo de retención (p. ej. anonimizar `customer_*`, `address` y `notes` N meses
  después del estado final) y una vía manual de borrado a pedido. Requiere ampliar el PRD
  antes de implementarse (regla de CLAUDE.md §4).

## Prioridad sugerida

1. **SP-02**: límites de longitud + horizonte de fecha en `parseOrderBody` — es un solo
   archivo, cierra la parte *ilimitada* del abuso anónimo sin tocar el riesgo aceptado de
   SP-01, y debería entrar antes del primer despliegue real.
2. **SP-04**: tests de `401`/validación de las rutas admin, antes de cualquier refactor de
   auth o endpoint admin nuevo.
3. **SP-03**: logout + runbook de revocación (`ADMIN_SESSION_SECRET`).
4. **SP-05**: quitar `idempotencyKey` de `serializeOrder` (cambio de una línea; verificar
   que ningún consumidor la usa).
5. **SP-06 y SP-07**: cabeceras de seguridad y logging — endurecimiento de bajo costo.
6. **SP-08**: decisión de producto (aviso de privacidad y retención).
7. **SP-01**: ya aceptado; reevaluar cuando el sistema esté en producción con clientes
   reales (la premisa "MVP" de TECH-DESIGN §9 deja de aplicar) — mitigaciones ya nombradas
   por el propio diseño: Vercel WAF / `@upstash/ratelimit`, empezando por el login.

## Decisiones que son del dueño (no se resolvieron en este pass)

- **SP-01**: re-aceptar (o no) la ausencia de rate limiting cuando haya tráfico real. La
  aceptación actual es explícita y válida para el MVP.
- **SP-08**: aviso de privacidad, retención y borrado de PII (Ley 1581/2012). Está fuera del
  PRD: requiere ampliar alcance antes de implementar.
- **SP-03 (parcial)**: si el logout entra al alcance del MVP o se difiere; la documentación
  del procedimiento de revocación no requiere decisión y puede hacerse ya.
