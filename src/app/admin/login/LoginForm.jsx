'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '../../../components/ui/Button.jsx';
import { site } from '../../../data/content.js';

export default function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.replace('/admin');
        router.refresh();
        return;
      }
      setError(res.status === 401 ? 'Clave incorrecta.' : 'No se pudo iniciar sesión. Intenta de nuevo.');
    } catch {
      setError('Problema de conexión. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="glass w-full max-w-sm rounded-card p-8 shadow-card">
      <h1 className="font-display text-2xl font-black uppercase tracking-[0.1em] text-primary">{site.name}</h1>
      <p className="mt-1 text-sm text-on-surface-muted">Tablero de pedidos del operador</p>
      <label className="mt-6 block">
        <span className="text-sm font-semibold text-on-surface">Clave de acceso</span>
        <input
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          className="mt-1.5 w-full rounded-xl border border-primary/20 bg-background-deep/50 px-4 py-3 text-sm text-on-surface"
        />
      </label>
      {error ? (
        <p role="alert" className="mt-3 text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={submitting || password === ''} className="mt-6 w-full">
        {submitting ? 'Entrando…' : 'Entrar'}
      </Button>
    </form>
  );
}
