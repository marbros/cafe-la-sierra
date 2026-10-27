## ADDED Requirements

### Requirement: Login emite una cookie de sesión firmada
`POST /api/admin/login` SHALL comparar la clave recibida con `ADMIN_PASSWORD` (comparación en
tiempo constante vía HMAC de ambas) y, si coincide, responder `200 { ok: true }` con una
cookie `admin_session` `HttpOnly`, `SameSite=Lax`, `Path=/`, `Secure` en producción, cuyo
valor es `<expiraEnMs>.<firmaHex>` firmado con HMAC-SHA256 usando `ADMIN_SESSION_SECRET`, con
expiración de `ADMIN_SESSION_TTL_HOURS` horas (default 168).

#### Scenario: Clave correcta
- **WHEN** se envía `POST /api/admin/login` con la clave correcta
- **THEN** responde `200` y un `Set-Cookie` de `admin_session` con `HttpOnly` y
  `SameSite=Lax` (y `Secure` en producción)

#### Scenario: Clave incorrecta
- **WHEN** se envía una clave incorrecta
- **THEN** responde `401 { "error": "INVALID_CREDENTIALS" }` sin `Set-Cookie`

#### Scenario: Body que no es JSON
- **WHEN** el body no se puede parsear como JSON
- **THEN** responde `422 { "error": "VALIDATION_ERROR", "fields": ["body"] }` sin cookie

#### Scenario: Servidor sin configurar
- **WHEN** `ADMIN_PASSWORD` o `ADMIN_SESSION_SECRET` no están definidas
- **THEN** responde `503 { "error": "ADMIN_NOT_CONFIGURED" }` y no emite cookie

### Requirement: Las cookies inválidas o vencidas no otorgan acceso
El sistema SHALL rechazar cookies con firma incorrecta, mal formadas o cuya expiración
firmada sea anterior al instante actual.

#### Scenario: Cookie manipulada
- **WHEN** se presenta una cookie con firma alterada o expiración modificada
- **THEN** se trata como sin sesión

#### Scenario: Cookie expirada
- **WHEN** la expiración firmada es anterior al instante actual
- **THEN** se trata como sin sesión

### Requirement: Rutas de admin protegidas en el servidor
El proxy (`src/proxy.js`) SHALL actuar como barrera optimista sobre `/admin/*` y
`/api/admin/*` (salvo `/admin/login` y `/api/admin/login`): sin sesión válida, las APIs
responden `401 { error: "UNAUTHORIZED" }` y las páginas redirigen a `/admin/login`. Además,
cada handler y página de admin SHALL re-verificar la sesión de forma autoritativa
(`hasValidAdminSession`), sin depender solo del proxy.

#### Scenario: API sin cookie
- **WHEN** `GET /api/admin/orders` se llama sin cookie válida
- **THEN** responde `401` y el cuerpo no contiene datos de pedidos

#### Scenario: Página sin sesión
- **WHEN** se navega a `/admin` sin cookie válida
- **THEN** la respuesta redirige a `/admin/login` sin renderizar datos

### Requirement: UI de acceso del operador
`/admin/login` SHALL ofrecer un formulario de clave que llama a `POST /api/admin/login`, con
el botón deshabilitado mientras la clave está vacía o el envío está en curso; ante `401`
SHALL mostrar "Clave incorrecta." sin navegar. Con sesión válida, `/admin/login` SHALL
redirigir a `/admin` y, al autenticar, el formulario SHALL navegar a `/admin`.

#### Scenario: Autenticación exitosa
- **WHEN** el operador envía la clave correcta en `/admin/login`
- **THEN** se navega a `/admin` y el tablero carga

#### Scenario: Clave incorrecta en el formulario
- **WHEN** se envía una clave incorrecta
- **THEN** se muestra "Clave incorrecta." y no se navega
