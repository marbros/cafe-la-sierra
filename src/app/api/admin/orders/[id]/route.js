import { prisma } from '../../../../../lib/db.js';
import { hasValidAdminSession } from '../../../../../lib/admin-auth.js';
import { serializeOrder, STATUSES, TRANSITIONS } from '../../../../../lib/orders.js';

export const dynamic = 'force-dynamic';

const noStore = { 'Cache-Control': 'no-store' };
const json = (body, status) => Response.json(body, { status, headers: noStore });

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// PATCH /api/admin/orders/:id — transición de estado del tablero. Solo transiciones
// válidas (ADR-0005): el update es condicional al estado actual para no pisar
// cambios concurrentes de otra pestaña.
export async function PATCH(request, { params }) {
  if (!(await hasValidAdminSession())) return json({ error: 'UNAUTHORIZED' }, 401);

  const { id } = await params;
  if (!UUID_RE.test(id ?? '')) return json({ error: 'NOT_FOUND' }, 404);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'VALIDATION_ERROR', fields: ['body'] }, 422);
  }
  const next = body?.status;
  if (!STATUSES.includes(next)) {
    return json({ error: 'VALIDATION_ERROR', fields: ['status'] }, 422);
  }

  try {
    const current = await prisma.order.findUnique({ where: { id } });
    if (!current) return json({ error: 'NOT_FOUND' }, 404);
    if (!TRANSITIONS[current.status].includes(next)) {
      return json({ error: 'INVALID_TRANSITION', from: current.status, to: next }, 409);
    }
    // updateMany condicional: si otra sesión ya movió el pedido, no se pisa (count 0 → 409).
    const res = await prisma.order.updateMany({
      where: { id, status: current.status },
      data: { status: next },
    });
    if (res.count === 0) {
      return json({ error: 'INVALID_TRANSITION', from: 'STALE', to: next }, 409);
    }
    const row = await prisma.order.findUnique({ where: { id } });
    return json(serializeOrder(row), 200);
  } catch (err) {
    console.error('PATCH /api/admin/orders/[id]', err);
    return json({ error: 'INTERNAL_ERROR' }, 500);
  }
}
