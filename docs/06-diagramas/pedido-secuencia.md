---
titulo: Diagrama de secuencia — Pedido de café (checkout)
version: 1.0.0
fecha: 2026-10-26
fuentes:
  - src/components/checkout/ComprarCafe.jsx
  - src/app/api/orders/route.js
  - src/app/api/orders/slots/route.js
  - src/lib/orders.js
  - src/lib/time.js
adrs: [ADR-0005, ADR-0007, ADR-0008]
---

# Pedido de café — diagrama de secuencia (v1.0.0)

## Historial

| Versión | Fecha      | Cambio                                    |
|---------|------------|-------------------------------------------|
| 1.0.0   | 2026-10-26 | Versión inicial, generada desde el código |

## Diagrama

```mermaid
sequenceDiagram
    actor C as Cliente
    participant UI as ComprarCafe.jsx
    participant SL as GET /api/orders/slots
    participant API as POST /api/orders
    participant V as lib/orders.js<br/>(parseOrderBody)
    participant DB as Prisma / Postgres<br/>(Order)

    Note over UI: useState genera idempotencyKey (UUID)<br/>una sola vez por intento de compra (ADR-0008)

    UI->>SL: GET /api/orders/slots (al montar)
    SL->>SL: upcomingSlots(now, 7)<br/>reloj del servidor en America/Bogota,<br/>lunes a sábado, antes del cutoff
    SL-->>UI: 200 { slots: [{date, slot}] }
    UI->>UI: llena el select de día y franja

    C->>UI: 1. Elige cafés (cantidades 1..max)
    C->>UI: 2. Nombre, teléfono, dirección, zona,<br/>día+franja, notas
    C->>UI: Confirmar pedido
    UI->>UI: validación local (errors) y<br/>submitting bloquea doble clic

    UI->>API: POST JSON (items {productId, qty}, contacto,<br/>zoneId, date, slot, notes, idempotencyKey)
    API->>V: parseOrderBody(body, now)
    Note over V: precios, tarifa de zona y totales se calculan<br/>del catálogo del servidor, nunca del body
    alt body inválido o franja cerrada
        Note over V: isSlotOrderable(date, slot, now) re-valida<br/>contra el reloj del servidor: si el cutoff<br/>ya pasó, fields incluye 'slot'
        API-->>UI: 422 VALIDATION_ERROR + fields
    else válido
        API->>DB: order.create(datos + montos del servidor)
        alt creado
            DB-->>API: row
            API-->>UI: 201 pedido serializado
        else P2002 (UNIQUE idempotency_key)
            Note over API,DB: la única constraint UNIQUE además del id<br/>es idempotency_key: es un reintento
            API->>DB: findUnique(idempotencyKey)
            alt existe (replay)
                DB-->>API: row existente
                API-->>UI: 200 el MISMO pedido, sin duplicar
            else no existe
                API-->>UI: 500 INTERNAL_ERROR
            end
        else otro error
            API-->>UI: 500 INTERNAL_ERROR
        end
    end

    alt 201 o 200
        UI->>C: Pantalla de confirmación: id corto, ítems,<br/>domicilio, total en efectivo, día y franja
    else 422 con fields que incluye 'slot'
        UI->>UI: limpia slotValue y recarga franjas
        UI->>SL: GET /api/orders/slots (refresco)
        UI->>C: "Esa franja ya cerró... elige otra"
    else otro 4xx/5xx
        UI->>C: "No pudimos registrar tu pedido..."
    else falla de red
        UI->>C: "Intenta de nuevo: tu pedido no se duplicará"<br/>(la idempotencyKey se conserva)
    end
```

## Notas

- **Franjas:** `GET /api/orders/slots` decide qué franjas son pedibles con el reloj del servidor (`upcomingSlots`, zona `America/Bogota`); el cliente solo las muestra. El `POST` vuelve a validar con `isSlotOrderable`: si el cutoff pasó mientras el cliente llenaba el formulario, responde `422` con `fields: ['slot']` y la UI recarga las franjas.
- **Idempotencia (ADR-0008):** la `idempotencyKey` nace una vez por intento (`crypto.randomUUID()` en `useState`). Ante `P2002` el servidor busca el pedido por `idempotency_key` y devuelve `200` con el mismo pedido: un doble clic o un reintento de red nunca duplican.
- **El servidor es la fuente de verdad:** títulos, precios unitarios, tarifa de zona, subtotal y total se calculan en `parseOrderBody` desde `src/data/content.js`; del body solo se toman ids y cantidades.
- **Fuera del diagrama:** `GET /api/admin/orders` y `PATCH /api/admin/orders/:id` (requieren sesión admin; ver `admin-flujo.md`).
