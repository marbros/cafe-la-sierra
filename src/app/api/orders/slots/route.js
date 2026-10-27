import { upcomingSlots } from '../../../../lib/time.js';

export const dynamic = 'force-dynamic';

// GET /api/orders/slots — franjas pedibles según el reloj del servidor en la zona
// del negocio (PRD casos borde 3 y 6): el cliente nunca decide qué franja es válida.
export async function GET() {
  return Response.json(
    { slots: upcomingSlots(new Date(), 7) },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
