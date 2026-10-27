import { prisma } from '../../../lib/db.js';
import { dateToColumn, parseOrderBody, serializeOrder } from '../../../lib/orders.js';

export const dynamic = 'force-dynamic';

const noStore = { 'Cache-Control': 'no-store' };
const json = (body, status) => Response.json(body, { status, headers: noStore });

// POST /api/orders — crea el pedido (ADR-0005). Idempotente por idempotencyKey (ADR-0008):
// el reintento del mismo envío devuelve 200 con el mismo pedido, nunca lo duplica.
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'VALIDATION_ERROR', fields: ['body'] }, 422);
  }

  const parsed = parseOrderBody(body);
  if (!parsed.data) return json({ error: 'VALIDATION_ERROR', fields: parsed.fields }, 422);
  const d = parsed.data;

  try {
    const row = await prisma.order.create({ data: { ...d, date: dateToColumn(d.date) } });
    return json(serializeOrder(row), 201);
  } catch (err) {
    if (err?.code !== 'P2002') {
      console.error('POST /api/orders', err);
      return json({ error: 'INTERNAL_ERROR' }, 500);
    }
    // Única constraint UNIQUE además del id: idempotency_key → es un reintento.
    try {
      const existing = await prisma.order.findUnique({
        where: { idempotencyKey: d.idempotencyKey },
      });
      if (existing) return json(serializeOrder(existing), 200);
      return json({ error: 'INTERNAL_ERROR' }, 500);
    } catch (err2) {
      console.error('POST /api/orders (replay lookup)', err2);
      return json({ error: 'INTERNAL_ERROR' }, 500);
    }
  }
}
