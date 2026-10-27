// Módulo único de tiempo del negocio (ADR-0007).
// `date` ('YYYY-MM-DD') y las horas de las franjas son hora de pared del negocio.
// Nadie construye un Date a partir de ellas fuera de este archivo.

export const BUSINESS_TIMEZONE = 'America/Bogota';

// Franjas de entrega (PRD: lunes a sábado, mañana o tarde). `cutoff` es la hora
// límite del MISMO día para pedir esa franja; `end` es contra lo que corre el semáforo.
export const SLOTS = {
  manana: { start: '09:00', end: '12:00', cutoff: '08:00' },
  tarde: { start: '14:00', end: '18:00', cutoff: '12:00' },
};
export const SLOT_IDS = Object.keys(SLOTS);

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

const formatterCache = new Map();
function partsFormatter(timeZone) {
  let f = formatterCache.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    formatterCache.set(timeZone, f);
  }
  return f;
}

// Offset (ms) de `timeZone` respecto de UTC en el instante `ms`.
function zoneOffsetMs(ms, timeZone) {
  const p = {};
  for (const { type, value } of partsFormatter(timeZone).formatToParts(new Date(ms))) {
    p[type] = Number(value);
  }
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - Math.floor(ms / 1000) * 1000;
}

/** 'YYYY-MM-DD' del día actual en la zona del negocio. */
export function todayInBusinessTz(now = new Date(), timeZone = BUSINESS_TIMEZONE) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

/**
 * Instante UTC (Date) que corresponde a `date` ('YYYY-MM-DD') y `time` ('HH:mm', 24h)
 * como hora de pared en la zona del negocio. Lanza Error si el formato es inválido.
 */
export function wallTimeToInstant(date, time, timeZone = BUSINESS_TIMEZONE) {
  const d = DATE_RE.exec(date ?? '');
  const t = TIME_RE.exec(time ?? '');
  if (!d || !t) throw new Error(`Formato inválido de date/time: ${date} ${time}`);
  const [y, mo, da, h, mi] = [d[1], d[2], d[3], t[1], t[2]].map(Number);
  const naive = Date.UTC(y, mo - 1, da, h, mi);
  const check = new Date(naive);
  if (check.getUTCMonth() !== mo - 1 || check.getUTCDate() !== da) {
    throw new Error(`Fecha inexistente: ${date}`);
  }
  // Dos pasadas para estabilizar el offset alrededor de cambios de horario.
  let guess = naive - zoneOffsetMs(naive, timeZone);
  guess = naive - zoneOffsetMs(guess, timeZone);
  return new Date(guess);
}

/** true si `date` existe en el calendario. */
export function isValidDate(date) {
  try {
    wallTimeToInstant(date, '00:00');
    return true;
  } catch {
    return false;
  }
}

/** true si `date` es lunes a sábado (el negocio no entrega los domingos). Solo calendario. */
export function isBusinessDay(date) {
  const d = DATE_RE.exec(date ?? '');
  if (!d) return false;
  const weekday = new Date(Date.UTC(Number(d[1]), Number(d[2]) - 1, Number(d[3]), 12)).getUTCDay();
  return weekday !== 0;
}

/** Instante en que vence la franja (fin de la franja): contra esto corre el semáforo. */
export function slotEndInstant(date, slotId) {
  const slot = SLOTS[slotId];
  if (!slot) throw new Error(`Franja desconocida: ${slotId}`);
  return wallTimeToInstant(date, slot.end);
}

/**
 * true si la franja `date`+`slotId` todavía se puede pedir en el instante `now`:
 * fecha real, lunes a sábado, y `now` antes del corte de ese día (PRD caso borde 3 y 6).
 */
export function isSlotOrderable(date, slotId, now = new Date()) {
  const slot = SLOTS[slotId];
  if (!slot || !isValidDate(date) || !isBusinessDay(date)) return false;
  return now < wallTimeToInstant(date, slot.cutoff);
}

/** Próximas franjas pedibles: [{ date, slot }] para los siguientes `days` días. */
export function upcomingSlots(now = new Date(), days = 7) {
  const out = [];
  const start = todayInBusinessTz(now);
  const [y, m, d] = start.split('-').map(Number);
  for (let i = 0; out.length < days * SLOT_IDS.length && i < days + 3; i++) {
    const day = new Date(Date.UTC(y, m - 1, d + i, 12));
    const date = day.toISOString().slice(0, 10);
    for (const slotId of SLOT_IDS) {
      if (isSlotOrderable(date, slotId, now)) out.push({ date, slot: slotId });
    }
  }
  return out;
}

/** Etiqueta legible ('martes, 1 de diciembre') de `date`. Solo calendario, sin zona. */
export function formatDateLabel(date, locale = 'es-CO') {
  const d = DATE_RE.exec(date ?? '');
  if (!d) return '';
  return new Intl.DateTimeFormat(locale, {
    timeZone: 'UTC',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(Date.UTC(Number(d[1]), Number(d[2]) - 1, Number(d[3]), 12)));
}

/**
 * Semáforo del tablero (PRD): 'verde' (con tiempo), 'amarillo' (la entrega es hoy),
 * 'rojo' (la franja venció y el pedido no salió). Estados finales o en camino → null.
 */
export function trafficLight(order, now = new Date()) {
  if (order.status === 'ENTREGADO' || order.status === 'CANCELADO') return null;
  const vencida = now > slotEndInstant(order.date, order.slot);
  if (vencida) return order.status === 'EN_CAMINO' ? 'amarillo' : 'rojo';
  return order.date === todayInBusinessTz(now) ? 'amarillo' : 'verde';
}
