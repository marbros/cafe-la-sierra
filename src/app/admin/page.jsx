import { redirect } from 'next/navigation';
import { hasValidAdminSession } from '../../lib/admin-auth.js';
import Tablero from '../../components/admin/Tablero.jsx';

export const metadata = { title: 'Tablero de pedidos — Café La Sierra' };
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  // Verificación autoritativa (el proxy es solo barrera optimista, ADR-0006).
  if (!(await hasValidAdminSession())) redirect('/admin/login');
  return <Tablero />;
}
