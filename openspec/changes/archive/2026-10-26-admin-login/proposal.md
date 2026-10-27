## Why

El tablero del operador (#7) expone datos personales de clientes (nombre, teléfono,
dirección): no puede existir sin una puerta. El PRD define un único operador (el dueño), sin
cuentas ni roles, así que basta una clave única con sesión firmada. Este change entrega el
acceso — login, cookie HMAC y protección de `/admin` y `/api/admin/*` — y desbloquea el
tablero kanban (#7).

## What Changes

- Nuevo `src/lib/admin-auth.js`: comparación de clave en tiempo constante contra
  `ADMIN_PASSWORD` (vía HMAC de ambas), token de sesión `<expiraEnMs>.<firmaHex>` firmado
  con HMAC-SHA256 (`ADMIN_SESSION_SECRET`, Web Crypto: válido en Proxy y Node), TTL
  configurable (`ADMIN_SESSION_TTL_HOURS`, default 168) y verificación autoritativa
  `hasValidAdminSession`.
- Nuevo `POST /api/admin/login`: `503 ADMIN_NOT_CONFIGURED` sin configuración,
  `422 VALIDATION_ERROR` con body no JSON, `401 INVALID_CREDENTIALS` con clave incorrecta,
  y `200 { ok: true }` con cookie `admin_session` `HttpOnly`/`SameSite=Lax`/`Path=/`
  (`Secure` en producción) con la clave correcta.
- Nuevo `src/proxy.js`: barrera optimista sobre `/admin/:path*` y `/api/admin/:path*`
  (salvo login) — API sin sesión `401`, páginas redirigen a `/admin/login`. Cada
  handler/página re-verifica por su cuenta.
- Nuevas páginas `/admin/login` (formulario de clave, botón deshabilitado con clave vacía o
  enviando, "Clave incorrecta." ante 401, redirige a `/admin` si ya hay sesión) y `/admin`
  protegida (redirige a `/admin/login` sin sesión; su contenido llega con #7).
- Fuera de alcance: listado y transición de pedidos, tablero, filtros y semáforo (#7);
  recuperación de clave y múltiples usuarios (No alcance del PRD).

## Capabilities

### New Capabilities
- `admin-board` (parte de acceso): login con clave única, cookie de sesión firmada y
  protección en el servidor de las rutas del operador.

### Modified Capabilities
<!-- ninguna -->

## Impact

- Código nuevo: `src/lib/admin-auth.js`, `src/app/api/admin/login/route.js`, `src/proxy.js`,
  `src/app/admin/login/page.jsx`, `src/app/admin/login/LoginForm.jsx`,
  `src/app/admin/page.jsx`.
- Variables nuevas: `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` y opcional
  `ADMIN_SESSION_TTL_HOURS` (documentadas en `.env.example`). Sin dependencias ni
  migraciones nuevas.
