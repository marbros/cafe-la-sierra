import { prisma } from '../../../../lib/db.js';
import { hasValidAdminSession } from '../../../../lib/admin-auth.js';
import { dateToColumn, serializeOrder } from '../../../../lib/orders.js';
import { isValidDate } from '../../../../lib/time.js';
import { delivery } from '../../../../data/content.js';

export const dynamic = 'force-dynamic';

const noStore = { 'Cache-Control': 'no-store' };
const json = (body, status) => Response.json(body, { status, headers: noStore });

const ZONE_IDS = new Set(delivery.zones.map((z) => z.id));

// GET /api/admin/orders?date=YYYY-MM-DD&zone=id — listado para el tablero,
// con los filtros por día y zona del PRD. Verificación autoritativa además del proxy.
export async function GET(request) {
  if (!(await hasValidAdminSession())) return json({ error: 'UNAUTHORIZED' }, 401);

  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const zone = searchParams.get('zone');

  const where = {};
  if (date) {
    if (!isValidDate(date)) return json({ error: 'VALIDATION_ERROR', fields: ['date'] }, 422);
    where.date = dateToColumn(date);
  }
  if (zone) {
    if (!ZONE_IDS.has(zone)) return json({ error: 'VALIDATION_ERROR', fields: ['zone'] }, 422);
    where.zoneId = zone;
  }

  try {
    const rows = await prisma.order.findMany({
      where,
      orderBy: [{ date: 'asc' }, { slot: 'asc' }, { createdAt: 'asc' }],
    });
    return json({ orders: rows.map(serializeOrder) }, 200);
  } catch (err) {
    console.error('GET /api/admin/orders', err);
    return json({ error: 'INTERNAL_ERROR' }, 500);
  }
}
