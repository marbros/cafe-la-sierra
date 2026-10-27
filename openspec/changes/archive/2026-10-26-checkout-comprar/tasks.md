## 1. Carrito y formulario

- [x] 1.1 `ComprarCafe.jsx`: steppers de cantidad por producto (0..10) con subtotal, tarifa
      de zona y total recalculados en vivo
- [x] 1.2 Formulario de datos de entrega: nombre, teléfono, dirección, selector de zona con
      tarifa visible por opción y notas opcionales
- [x] 1.3 Selector de día y franja poblado con `GET /api/orders/slots` (deshabilitado
      mientras carga, value `date|slot`, etiqueta `fecha legible — franja`)
- [x] 1.4 Validación en el cliente (≥1 bolsa, nombre, teléfono 7–15 dígitos, dirección ≥8,
      zona y franja elegidas) con errores visibles tras el primer submit

## 2. Envío y confirmación

- [x] 2.1 `idempotencyKey` con `crypto.randomUUID()` una sola vez al montar; POST a
      `/api/orders` con items `{ productId, qty }` y datos del formulario
- [x] 2.2 Botón "Confirmar pedido" deshabilitado durante el envío con texto "Confirmando…"
- [x] 2.3 Franja cerrada (`422` con `slot` en `fields`): limpiar selección, recargar slots y
      mostrar "Esa franja ya cerró mientras completabas el pedido. Elige otra, por favor.";
      error de red: "tu pedido no se duplicará"
- [x] 2.4 Pantalla de confirmación con id corto, ítems, domicilio por zona, total en
      efectivo, franja legible, dirección, nota de pago y enlace "Volver al inicio"

## 3. Verificación

- [x] 3.1 `npm run build` en verde
- [x] 3.2 E2E Playwright del flujo feliz: elegir cafés, llenar datos, confirmar y ver la
      pantalla de confirmación con el total del servidor
- [x] 3.3 Prueba manual: doble clic en confirmar no duplica (misma `idempotencyKey`) y la
      franja cerrada recarga las opciones
