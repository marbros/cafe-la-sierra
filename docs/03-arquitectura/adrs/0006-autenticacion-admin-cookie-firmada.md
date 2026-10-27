# ADR-0006 — Admin con clave única y cookie HMAC firmada (sin tabla de usuarios)

- Estado: aceptada · Fecha: 2026-10-26

## Contexto

Hay un único operador (el dueño). El PRD excluye cuentas, roles y recuperación de
contraseña. Aun así `/admin` y su API no pueden quedar abiertos.

## Decisión

Clave única en `ADMIN_PASSWORD` comparada en **tiempo constante** (se comparan los HMAC de
ambas claves). La sesión es una cookie `admin_session` **HttpOnly, SameSite=Lax, Secure en
producción** con valor `<expiraMs>.<HMAC-SHA256>` firmado con `ADMIN_SESSION_SECRET`
(Web Crypto, funciona igual en el proxy y en Node). TTL 7 días. `src/proxy.js` corta el
tráfico no autenticado hacia `/admin/:path*` y `/api/admin/:path*` como **barrera
optimista**; cada página y handler re-verifica (`hasValidAdminSession`) de forma autoritativa.

## Consecuencias

- (+) Cero estado de sesión en la base; revocar = rotar el secreto.
- (+) Sin JS leyendo la cookie (HttpOnly) y sin timing attacks en el login.
- (−) Una sola clave compartida: aceptado y registrado como riesgo (SECURITY-REPORT).

## Alternativas consideradas

NextAuth/Better Auth (sobredimensionado para 1 usuario), Basic Auth (sin expiración ni logout).
