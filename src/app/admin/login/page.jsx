import { redirect } from 'next/navigation';
import { hasValidAdminSession } from '../../../lib/admin-auth.js';
import LoginForm from './LoginForm.jsx';

export const metadata = { title: 'Acceso del operador — Café La Sierra' };
export const dynamic = 'force-dynamic';

export default async function AdminLoginPage() {
  if (await hasValidAdminSession()) redirect('/admin');
  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <LoginForm />
    </main>
  );
}
