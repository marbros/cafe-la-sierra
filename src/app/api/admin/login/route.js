import { cookies } from 'next/headers';
import {
  ADMIN_COOKIE,
  adminConfigured,
  createSessionToken,
  passwordMatches,
  sessionTtlSeconds,
} from '../../../../lib/admin-auth.js';

export const dynamic = 'force-dynamic';

const noStore = { 'Cache-Control': 'no-store' };
const json = (body, status) => Response.json(body, { status, headers: noStore });

// POST /api/admin/login — clave única del dueño → cookie HttpOnly firmada (ADR-0006).
export async function POST(request) {
  if (!adminConfigured()) return json({ error: 'ADMIN_NOT_CONFIGURED' }, 503);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'VALIDATION_ERROR', fields: ['body'] }, 422);
  }

  const ok = await passwordMatches(body?.password);
  if (!ok) return json({ error: 'INVALID_CREDENTIALS' }, 401);

  const store = await cookies();
  store.set(ADMIN_COOKIE, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: sessionTtlSeconds(),
  });
  return json({ ok: true }, 200);
}
