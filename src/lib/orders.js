// Validación y serialización de pedidos para las API routes.
// El catálogo y la tabla de zonas son autoridad del servidor (src/data/content.js):
// precios, tarifas y totales se calculan aquí, nunca se toman del body.
import { catalog, delivery } from '../data/content.js';
import { isSlotOrderable, isValidDate, SLOTS } from './time.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PHONE_CHARS_RE = /^[\d\s+().-]+$/;

const PRODUCTS = new Map(catalog.products.map((p) => [p.id, p]));
const ZONES = new Map(delivery.zones.map((z) => [z.id, z]));

export const STATUSES = ['NUEVO', 'PREPARANDO', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO'];

// Transiciones permitidas del tablero (PRD: Nuevo → Preparando → En camino → Entregado,
// con Devuelto/Cancelado como final alternativo desde cualquier estado no final).
export const TRANSITIONS = {
  NUEVO: ['PREPARANDO', 'CANCELADO'],
  PREPARANDO: ['EN_CAMINO', 'CANCELADO'],
  EN_CAMINO: ['ENTREGADO', 'CANCELADO'],
  ENTREGADO: [],
  CANCELADO: [],
};

/**
 * Valida el body de POST /api/orders. Devuelve { fields: [...] } con los campos
 * inválidos, o { data } con el payload limpio y los montos calculados por el servidor.
 */
export function parseOrderBody(body, now = new Date()) {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return { fields: ['body'] };
  }
  const fields = [];
  const data = {};

  for (const k of ['customerName', 'customerPhone', 'address']) {
    const v = body[k];
    if (typeof v !== 'string' || v.trim() === '') fields.push(k);
    else data[k] = v.trim();
  }

  if ('customerPhone' in data) {
    const digits = data.customerPhone.replace(/\D/g, '').length;
    if (!PHONE_CHARS_RE.test(data.customerPhone) || digits < 7 || digits > 15) {
      fields.push('customerPhone');
    }
  }

  if ('address' in data && data.address.length < 8) fields.push('address');

  const zone = ZONES.get(body.zoneId);
  if (!zone) fields.push('zoneId');
  else {
    data.zoneId = zone.id;
    data.zoneName = zone.name;
    data.deliveryFee = zone.fee;
  }

  // Ítems: productos del catálogo, sin repetidos, cantidades 1..max. El snapshot
  // (título y precio unitario) sale del catálogo, no del cliente.
  const items = body.items;
  if (!Array.isArray(items) || items.length === 0 || items.length > PRODUCTS.size) {
    fields.push('items');
  } else {
    const seen = new Set();
    const snapshot = [];
    let ok = true;
    for (const it of items) {
      const product = it && typeof it === 'object' ? PRODUCTS.get(it.productId) : null;
      const qty = it?.qty;
      if (
        !product ||
        seen.has(product.id) ||
        !Number.isInteger(qty) ||
        qty < 1 ||
        qty > catalog.maxQtyPerProduct
      ) {
        ok = false;
        break;
      }
      seen.add(product.id);
      snapshot.push({ productId: product.id, title: product.title, unitPrice: product.price, qty });
    }
    if (!ok) fields.push('items');
    else {
      data.items = snapshot;
      data.subtotal = snapshot.reduce((sum, it) => sum + it.unitPrice * it.qty, 0);
    }
  }

  if (data.subtotal != null && data.deliveryFee != null) {
    data.total = data.subtotal + data.deliveryFee;
  }

  // Franja: se re-valida contra el reloj del servidor (PRD casos borde 3 y 6).
  if (typeof body.date !== 'string' || !isValidDate(body.date)) fields.push('date');
  else data.date = body.date;
  if (typeof body.slot !== 'string' || !SLOTS[body.slot]) fields.push('slot');
  else data.slot = body.slot;
  if (data.date && data.slot && !isSlotOrderable(data.date, data.slot, now)) {
    fields.push('slot');
  }

  if (body.notes == null || body.notes === '') data.notes = null;
  else if (typeof body.notes === 'string' && body.notes.length <= 500) data.notes = body.notes;
  else fields.push('notes');

  if (typeof body.idempotencyKey !== 'string' || !UUID_RE.test(body.idempotencyKey)) {
    fields.push('idempotencyKey');
  } else {
    data.idempotencyKey = body.idempotencyKey.toLowerCase();
  }

  return fields.length ? { fields } : { data };
}

/** Valor para la columna @db.Date a partir de 'YYYY-MM-DD'. */
export function dateToColumn(date) {
  return new Date(`${date}T00:00:00.000Z`);
}

/** Fila Prisma -> JSON público (date como 'YYYY-MM-DD'). */
export function serializeOrder(row) {
  return {
    id: row.id,
    items: row.items,
    subtotal: row.subtotal,
    deliveryFee: row.deliveryFee,
    total: row.total,
    customerName: row.customerName,
    customerPhone: row.customerPhone,
    address: row.address,
    zoneId: row.zoneId,
    zoneName: row.zoneName,
    date: row.date.toISOString().slice(0, 10),
    slot: row.slot,
    status: row.status,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    idempotencyKey: row.idempotencyKey,
  };
}
