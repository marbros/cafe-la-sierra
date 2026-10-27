# ADR-0010 — Tarifas de domicilio por tabla estática de zonas en código

- Estado: aceptada · Fecha: 2026-10-26

## Contexto

El PRD excluye explícitamente el cálculo de domicilio por dirección/mapa/distancia. El
dueño define 4 zonas con tarifa fija y cambian poco.

## Decisión

Las zonas viven en `src/data/content.js` (`delivery.zones`: id, nombre, tarifa en COP),
igual que el catálogo de cafés. El checkout muestra la tarifa en el selector de zona
(transparencia exigida por el PRD); el pedido guarda `zone_id` + `zone_name` + tarifa como
snapshot (ADR-0004). No hay tabla `zones` en la base ni panel para editarlas.

## Consecuencias

- (+) Cero infraestructura para un dato que cambia a lo sumo unas veces al año.
- (+) El snapshot congela la tarifa que vio el cliente aunque la tabla cambie después.
- (−) Cambiar tarifas requiere deploy; registrado como supuesto en el PRD ("si precios o
  zonas cambian seguido, la tabla estática se queda corta").
