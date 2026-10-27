---
titulo: Diagrama de flujo — Tablero del operador
version: 1.0.0
fecha: 2026-10-26
fuentes:
  - src/proxy.js
  - src/lib/admin-auth.js
  - src/app/api/admin/login/route.js
  - src/components/admin/Tablero.jsx
  - src/app/api/admin/orders/route.js
  - src/app/api/admin/orders/[id]/route.js
  - src/lib/time.js
adrs: [ADR-0005, ADR-0006]
---

# Tablero del operador — diagrama de flujo (v1.0.0)

## Historial

| Versión | Fecha | Cambio |
|---|---|---|
| 1.0.0 | 2026-10-26 | Versión inicial: login por clave única, cookie HMAC, tablero kanban con semáforo y transiciones |

```mermaid
flowchart TD
    A([Operador abre /admin o /api/admin/*]) --> P{"Proxy<br/>(src/proxy.js)<br/>¿cookie admin_session válida?"}

    P -- "Sí" --> R{¿Qué ruta?}
    P -- "No, ruta /api/" --> E401[/"401 UNAUTHORIZED (JSON)"/]
    P -- "No, ruta de página" --> L

    subgraph LOGIN ["Login (/admin/login — pública)"]
        L[Formulario: clave de acceso] --> S["POST /api/admin/login"]
        S --> C1{"¿ADMIN_PASSWORD y<br/>ADMIN_SESSION_SECRET<br/>configurados?"}
        C1 -- "No" --> E503[/"503 ADMIN_NOT_CONFIGURED"/]
        C1 -- "Sí" --> C2{"¿passwordMatches?<br/>compara HMAC de ambas claves<br/>en tiempo constante"}
        C2 -- "No" --> E401L[/"401 INVALID_CREDENTIALS"/]
        C2 -- "Sí" --> TOK["Crea token exp.firmaHex<br/>HMAC-SHA256, TTL 168 h por defecto"]
        TOK --> CK["Set-Cookie admin_session<br/>httpOnly, sameSite=lax,<br/>secure en producción"]
    end

    E503 --> ERR[Muestra error en el formulario]
    E401L --> ERR
    ERR --> L
    CK --> RD["Redirección a /admin"]
    RD --> R

    R -- "/admin" --> B["Tablero.jsx carga pedidos<br/>GET /api/admin/orders?date&zone<br/>y se refresca cada 60 s"]
    B --> V1{"hasValidAdminSession()<br/>(verificación autoritativa)"}
    V1 -- "No (401)" --> L
    V1 -- "Sí" --> F{"¿Filtros válidos?<br/>date existe en calendario,<br/>zone en la tabla de zonas"}
    F -- "No" --> E422[/"422 VALIDATION_ERROR"/]
    F -- "Sí" --> Q["order.findMany(where)<br/>orden: fecha, franja, createdAt"]
    Q --> K["5 columnas kanban:<br/>NUEVO · PREPARANDO · EN_CAMINO ·<br/>ENTREGADO · CANCELADO"]

    K --> SEM{"Semáforo por tarjeta<br/>trafficLight(order, now)"}
    SEM -- "ENTREGADO o CANCELADO" --> S0["Sin semáforo"]
    SEM -- "Franja vencida y EN_CAMINO" --> SA["Amarillo"]
    SEM -- "Franja vencida y no salió" --> SR["Rojo (parpadea:<br/>animate-pulse-danger)"]
    SEM -- "Entrega hoy" --> SA2["Amarillo"]
    SEM -- "Con tiempo" --> SV["Verde"]

    K --> M["Operador pulsa una transición:<br/>NUEVO→PREPARANDO→EN_CAMINO→ENTREGADO<br/>o →CANCELADO desde cualquier estado no final"]
    M --> PA["PATCH /api/admin/orders/:id { status }"]
    PA --> V2{"hasValidAdminSession()"}
    V2 -- "No" --> E401
    V2 -- "Sí" --> X{"¿Pedido existe y la transición<br/>está en TRANSITIONS[actual]?"}
    X -- "No existe" --> E404[/"404 NOT_FOUND"/]
    X -- "Transición no permitida" --> E409[/"409 INVALID_TRANSITION"/]
    X -- "Sí" --> U["updateMany condicional:<br/>where { id, status: actual }"]
    U --> W{"¿count == 1?"}
    W -- "No: otra pestaña ya<br/>movió el pedido" --> E409S[/"409 INVALID_TRANSITION (STALE)"/]
    W -- "Sí" --> OK[/"200 pedido actualizado"/]

    OK --> K2["La tarjeta cambia de columna"]
    E409 --> RS["La UI recarga el tablero<br/>(re-sincroniza)"]
    E409S --> RS
    E404 --> RS
    RS --> B
```

## Notas

- **Doble barrera (ADR-0006):** el Proxy (`src/proxy.js`) es optimista; `hasValidAdminSession()` se repite en cada handler (`GET /api/admin/orders`, `PATCH /api/admin/orders/:id`). Si el tablero recibe `401`, redirige a `/admin/login`.
- **Semáforo:** corre contra el **fin de la franja comprometida** (`slotEndInstant`) en la zona del negocio (`America/Bogota`): verde = con tiempo, amarillo = la entrega es hoy (o vencida pero ya en camino), rojo parpadeante = la franja venció y el pedido no salió. Estados finales no llevan semáforo. Se recalcula en cada render y el tablero se refresca solo cada 60 s.
- **Concurrencia entre pestañas (ADR-0005):** el `PATCH` usa `updateMany` condicional al estado actual (`where { id, status: actual }`); si otra pestaña ya movió el pedido, `count == 0` → `409` y la UI re-sincroniza con `load()` en lugar de pisar el cambio.
- **Sin cuentas ni roles:** una sola clave compartida (`ADMIN_PASSWORD`); la sesión dura `ADMIN_SESSION_TTL_HOURS` (168 h por defecto) en una cookie HttpOnly firmada con HMAC-SHA256.
