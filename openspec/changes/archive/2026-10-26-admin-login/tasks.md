## 1. Sesión firmada

- [x] 1.1 `src/lib/admin-auth.js`: `passwordMatches` en tiempo constante (HMAC de ambas
      claves + comparación byte a byte), `createSessionToken`/`verifySessionToken` con
      formato `<expiraEnMs>.<firmaHex>` y `sessionTtlSeconds` (default 168 h)
- [x] 1.2 `adminConfigured` y `hasValidAdminSession` (lee la cookie con `next/headers`)

## 2. Endpoint y barrera

- [x] 2.1 `src/app/api/admin/login/route.js`: 503 sin configuración, 422 body no JSON, 401
      clave incorrecta, 200 con `Set-Cookie` `admin_session` HttpOnly/SameSite=Lax/Path=/
      (+Secure en producción) y `maxAge` del TTL
- [x] 2.2 `src/proxy.js` con matcher `/admin/:path*` y `/api/admin/:path*`: deja pasar los
      login, API sin sesión → 401 JSON, páginas sin sesión → redirect a `/admin/login`

## 3. Páginas

- [x] 3.1 `/admin/login`: con sesión redirige a `/admin`; `LoginForm` con botón deshabilitado
      (clave vacía o enviando), "Clave incorrecta." ante 401 y navegación a `/admin` al
      autenticar
- [x] 3.2 `/admin`: verificación autoritativa con `hasValidAdminSession` y redirect a
      `/admin/login` sin sesión (contenido del tablero en el change #7)

## 4. Verificación

- [x] 4.1 `npm run build` en verde
- [x] 4.2 curl: login sin body 422, clave mala 401 sin Set-Cookie, clave buena 200 con
      cookie HttpOnly; `GET /api/admin/orders` sin cookie y con cookie manipulada → 401
- [x] 4.3 Prueba manual: `/admin` sin sesión redirige al login; con la clave correcta entra
