## ADDED Requirements

### Requirement: Zona horaria del negocio única y compartida
El sistema SHALL definir una única constante de zona horaria del negocio, con valor
`America/Bogota`, importable tanto desde código de cliente como de servidor.

#### Scenario: Valor de la constante
- **WHEN** se consulta la zona horaria del negocio (`BUSINESS_TIMEZONE`)
- **THEN** su valor es `America/Bogota`

### Requirement: Catálogo de franjas con hora de corte
El sistema SHALL definir exactamente dos franjas de entrega: `manana` (inicio `09:00`, fin
`12:00`, corte `08:00`) y `tarde` (inicio `14:00`, fin `18:00`, corte `12:00`). El `cutoff`
es la hora límite del MISMO día para pedir esa franja; el `end` es contra lo que corre el
semáforo. Las horas SHALL vivir solo en `src/lib/time.js`; el copy de las etiquetas vive en
`src/data/content.js`.

#### Scenario: Identificadores de franja
- **WHEN** se consultan las franjas disponibles (`SLOT_IDS`)
- **THEN** son exactamente `manana` y `tarde`

### Requirement: Día actual del negocio
El sistema SHALL proveer una operación (`todayInBusinessTz`) que devuelva la fecha actual en
la zona del negocio con formato `YYYY-MM-DD`, independiente de la zona del entorno de
ejecución.

#### Scenario: Cerca de medianoche UTC
- **WHEN** el instante actual es 2026-03-11T02:00:00Z (21:00 del 10 de marzo en Bogotá)
- **THEN** la operación devuelve `2026-03-10`

#### Scenario: Entorno en otra zona
- **WHEN** el proceso corre con otra zona horaria (por ejemplo `TZ=Asia/Tokyo`)
- **THEN** el resultado sigue siendo la fecha de Bogotá

### Requirement: Conversión de hora de pared a instante
El sistema SHALL proveer una operación (`wallTimeToInstant`) que, dados `date` (`YYYY-MM-DD`)
y `time` (`HH:mm`, 24h), devuelva el instante UTC real correspondiente a esa hora de pared en
la zona del negocio, resolviendo el offset del día concreto, y SHALL lanzar un error cuando
`date` o `time` no tengan el formato esperado o la fecha no exista en el calendario.

#### Scenario: Hora de pared en Bogotá
- **WHEN** se convierte `2026-03-10` y `12:00`
- **THEN** el instante es 2026-03-10T17:00:00.000Z (UTC-5)

#### Scenario: Formato inválido
- **WHEN** se convierte `2026-3-10` o `25:00`
- **THEN** se lanza un error

#### Scenario: Fecha inexistente
- **WHEN** se convierte `2026-02-30`
- **THEN** se lanza un error

### Requirement: Días de entrega de lunes a sábado
El sistema SHALL proveer una operación (`isBusinessDay`) que devuelva `true` solo para fechas
de lunes a sábado: el negocio no entrega los domingos. Es una regla de calendario pura, sin
zona horaria.

#### Scenario: Domingo
- **WHEN** se evalúa una fecha que cae domingo
- **THEN** devuelve `false`

#### Scenario: Sábado
- **WHEN** se evalúa una fecha que cae sábado
- **THEN** devuelve `true`

### Requirement: Pedibilidad de una franja contra su hora de corte
El sistema SHALL proveer una operación (`isSlotOrderable`) que devuelva `true` solo si la
franja existe, la fecha es real y de lunes a sábado, y el instante actual es anterior al
corte (`cutoff`) de esa franja en ese día. Pasado el corte del mismo día, la franja deja de
ser pedible (PRD casos borde 3 y 6).

#### Scenario: Franja de la tarde antes del corte
- **WHEN** en Bogotá son las 11:00 de un día hábil y se evalúa la franja `tarde` de hoy
- **THEN** devuelve `true` (el corte de la tarde es a las 12:00)

#### Scenario: Franja de la mañana pasada su hora de corte
- **WHEN** en Bogotá son las 09:00 y se evalúa la franja `manana` de hoy
- **THEN** devuelve `false` (el corte de la mañana es a las 08:00)

#### Scenario: Domingo nunca es pedible
- **WHEN** se evalúa cualquier franja de una fecha que cae domingo
- **THEN** devuelve `false`

### Requirement: Próximas franjas pedibles
El sistema SHALL proveer una operación (`upcomingSlots`) que devuelva la lista ordenada
`[{ date, slot }]` de las franjas pedibles de los próximos 7 días a partir del día del
negocio, excluyendo domingos y franjas cuyo corte ya pasó.

#### Scenario: Hoy por la mañana
- **WHEN** en Bogotá son las 07:00 de un día hábil
- **THEN** la lista incluye las franjas `manana` y `tarde` de hoy

#### Scenario: Hoy después del mediodía
- **WHEN** en Bogotá son las 13:00
- **THEN** la lista no incluye ninguna franja de hoy; empieza en el siguiente día hábil

### Requirement: Semáforo contra la franja comprometida
El sistema SHALL proveer una operación (`trafficLight`) que calcule el semáforo de un pedido
contra el FIN de su franja (`slotEndInstant`): pedidos `ENTREGADO` o `CANCELADO` → `null`
(sin semáforo); si la franja ya venció → `amarillo` cuando el pedido está `EN_CAMINO` y
`rojo` en caso contrario (no salió a tiempo); si no venció → `amarillo` cuando la entrega es
hoy (día del negocio) y `verde` cuando es un día futuro.

#### Scenario: Entrega futura
- **WHEN** un pedido `NUEVO` tiene franja de un día posterior al día del negocio
- **THEN** el semáforo es `verde`

#### Scenario: Entrega hoy con la franja vigente
- **WHEN** un pedido `PREPARANDO` tiene franja de hoy y aún no llega el fin de la franja
- **THEN** el semáforo es `amarillo`

#### Scenario: Franja vencida sin salir
- **WHEN** un pedido `NUEVO` o `PREPARANDO` tiene una franja cuyo fin ya pasó
- **THEN** el semáforo es `rojo`

#### Scenario: Franja vencida pero el pedido va en camino
- **WHEN** un pedido `EN_CAMINO` tiene una franja cuyo fin ya pasó
- **THEN** el semáforo es `amarillo`

#### Scenario: Estados finales sin semáforo
- **WHEN** un pedido está `ENTREGADO` o `CANCELADO`
- **THEN** el semáforo es `null`
