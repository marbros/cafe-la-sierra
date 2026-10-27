---
title: "Café La Sierra: del pedido a tu puerta"
---

# PRD: Café La Sierra: del pedido a tu puerta

## Problema

Hoy los pedidos de Café La Sierra llegan por WhatsApp. Al ser muchos chats sin estructura, el dueño pierde tiempo gestionándolos, se olvidan pedidos y no hay visibilidad de qué se debe entregar y cuándo — lo que genera errores, pedidos perdidos y líos operativos. El botón "Comprar ahora" de la landing existente no lleva a ningún flujo de compra real, así que el cliente interesado no puede comprar solo: toda venta depende de una conversación manual.

El problema tiene dos caras: el cliente no puede comprar sin escribir (fricción de venta) y el dueño no puede gestionar lo vendido (caos operativo). Esta versión ataca las dos.

## Usuario objetivo

- **Primario — el comprador:** persona natural que descubre Café La Sierra por Instagram o TikTok, llega a la landing y quiere comprar 1-2 bolsas de café para su casa sin tener que escribir por WhatsApp.
- **Secundario — el operador (dueño):** recibe los pedidos ordenados en un solo lugar (un tablero) en vez de dispersos en chats. Lo revisa al inicio del día y al menos una vez más para saber qué entregas salen hoy y cuáles están en riesgo.

## Objetivo / resultado esperado

Automatizar la toma y gestión de pedidos con entrega: el cliente compra solo desde la landing y el pedido queda registrado con sus datos de entrega, sin gestión por chat. **Resultado esperado en semanas:** los pedidos nuevos entran por la web con dirección, zona y franja de entrega claras, y el dueño gestiona las entregas desde un tablero único con alertas visuales, en vez de reconstruirlas desde WhatsApp.

<!-- REVISAR: el outcome es operativo (orden y automatización), no de crecimiento de ventas — el crecimiento sería un efecto secundario bienvenido, no el criterio principal. -->

## Alcance (qué sí incluye esta versión)

**Flujo de compra (cliente, sobre la landing existente):**

- Catálogo con los 2 cafés (Medio $25.000 y Oscuro $27.000 / 340g) con precio y presentación.
- Selección de producto y cantidad (carrito simple o compra directa).
- Formulario de pedido: nombre, teléfono, dirección de entrega, **selector de zona con tarifa de domicilio fija visible** (tabla estática definida por el dueño), y franja de entrega deseada (lunes a sábado, mañana o tarde).
- Pantalla de confirmación al cliente. El pago es **efectivo contra entrega** vía domicilios.

**Tablero de pedidos (operador, estilo kanban con semáforo):**

- Cada pedido confirmado entra como tarjeta al tablero con 5 estados: **Nuevo → Preparando → En camino → Entregado**, más **Devuelto/Cancelado** como estado final alternativo.
- Semáforo dinámico contra la franja de entrega comprometida: verde con tiempo, amarillo si la entrega es hoy, rojo parpadeante si la franja venció y el pedido no salió.
- Filtros por día y zona.

## No alcance (qué explícitamente no incluye esta versión)

- No incluye pago online (pasarela, tarjetas, Nequi) — el pago es efectivo contra entrega.
- No incluye cuentas de usuario ni login para el cliente — compra como invitado cada vez.
- No incluye notificaciones automáticas al cliente (WhatsApp/SMS/correo de estado del pedido).
- No incluye control de inventario/stock — se asume café siempre disponible.
- No incluye asignación de domiciliarios ni ruteo — el tablero dice qué sale y cuándo, no quién lo lleva ni por qué ruta.
- No incluye reportes ni estadísticas de ventas — el tablero es operativo, no analítico.
- No incluye integraciones externas (Trello, Google Calendar, apps de domicilios).
- No incluye cálculo automático de domicilio por dirección/mapa/distancia — solo tabla fija por zona.

## Criterios de éxito

- **Principal — tasa de entrega exitosa:** pedidos que llegan a "Entregado" con pago recibido ÷ pedidos totales ≥ **95%** en las primeras 4 semanas, con devoluciones/entregas fallidas < 5%. <!-- REVISAR: el 95% es propuesta del agente — ajustar el número a la realidad actual de devoluciones. -->
- **Secundario — adopción del canal:** ≥ 70% de los pedidos entran por la web (no por WhatsApp) al cabo de un mes.
- **Secundario — usabilidad:** un cliente nuevo completa el pedido en < 3 minutos sin ayuda.
- **Anti-métrica:** visitas a la landing — tráfico sin pedidos no valida el sistema.

## Casos borde a contemplar

1. **Abandono a mitad de formulario:** no se guarda nada; solo existe el pedido confirmado. <!-- REVISAR: propuesta del agente. -->
2. **Datos inválidos:** el formulario valida teléfono (formato), dirección no vacía y zona dentro de cobertura; lo demás se corrige por llamada. <!-- REVISAR: propuesta del agente. -->
3. **Franja imposible:** solo se ofrecen franjas lunes a sábado, mañana o tarde. El formulario no permite domingos, y si la franja del mismo día ya pasó su hora de corte, no se muestra como opción. <!-- REVISAR: definir hora de corte, ej. pedidos para la tarde se aceptan hasta las 12pm. -->
4. **Cliente no está o no paga al llegar el domicilio:** el pedido pasa a **Devuelto/Cancelado** — sin reintento automático.
5. **Doble envío:** el botón "Confirmar" se deshabilita al primer clic y muestra pantalla de confirmación clara. <!-- REVISAR: propuesta del agente. -->
6. **Pedido fuera del horario de operación:** la web acepta pedidos a cualquier hora; el formulario solo ofrece franjas futuras válidas. El pedido queda en "Nuevo" hasta que se procese. El semáforo corre contra la franja comprometida, no contra la hora del pedido.

## Supuestos y riesgos abiertos

**Supuestos:**

- Los clientes de Instagram/TikTok están dispuestos a llenar un formulario web en vez de escribir por WhatsApp (si prefieren el chat, el canal web no despega).
- El dueño revisa el tablero al menos 2 veces al día — el semáforo solo sirve si alguien lo mira.
- La operación cabe en 2 productos y tarifas fijas por zona (si precios o zonas cambian seguido, la tabla estática se queda corta).

**Riesgos:**

- **El WhatsApp no muere solo:** los clientes habituales seguirán escribiendo. Riesgo de operar doble canal (tablero + chats) y volver al caos. Mitigación: responder los chats con el link de compra.
- **Efectivo contra entrega = devoluciones:** sin pago anticipado, un pedido fantasma cuesta el domicilio. Por eso la métrica principal es entregados vs devueltos.
- **Alcance vs tiempo del curso:** si checkout + tablero no caben en las semanas disponibles, el recorte es el tablero avanzado (filtros), nunca el flujo de compra.

<!-- REVISAR: los supuestos y riesgos fueron propuestos por el agente y aceptados sin ajustes — validar especialmente la mitigación del doble canal. -->

## Ampliación v1.1 (2026-10-27)

Tras entregar el MVP, el dueño amplió el alcance con dos piezas:

- **Catálogo ampliado:** además de los 2 cafés en grano (Medio $25.000 y Oscuro $27.000 / 340g), la vitrina ofrece 3 bebidas de la casa en vaso de 12 oz — Cappuccino $12.000, Latte $13.000 y Mocha $14.000 — con rating e imagen. El catálogo sigue viviendo en `src/data/content.js` y el servidor sigue siendo la autoridad de precios: la API y el modelo de datos no cambiaron.
- **Carrito persistente en el navegador:** las tarjetas de la landing suman al carrito con un botón "+", un ícono de carrito con contador en el navbar (desktop y móvil) lleva a `/comprar`, y el checkout precarga las cantidades del carrito, las sincroniza al cambiarlas y lo vacía al confirmar el pedido. Esto resuelve lo que el alcance original dejaba abierto como "carrito simple o compra directa": queda como **carrito en localStorage, sin cuentas de usuario**.

Todo lo demás se mantiene igual: pago en efectivo contra entrega, zonas con tarifa fija, franjas de lunes a sábado con corte, y el tablero del operador. El "No alcance" no cambia.
