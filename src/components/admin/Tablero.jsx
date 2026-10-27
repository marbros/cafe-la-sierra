'use client';

// Tablero kanban del operador (PRD): 5 estados, semáforo contra la franja comprometida,
// filtros por día y zona. El semáforo se recalcula en cada render con el reloj del
// navegador vía src/lib/time.js (misma lógica pura que usa el servidor).
import { useCallback, useEffect, useState } from 'react';
import { board, delivery, formatCop, site } from '../../data/content.js';
import { STATUSES, TRANSITIONS } from '../../lib/orders.js';
import { formatDateLabel, trafficLight } from '../../lib/time.js';

const LIGHT_STYLES = {
  verde: { dot: 'bg-success', label: 'Con tiempo' },
  amarillo: { dot: 'bg-warning', label: 'Entrega hoy' },
  rojo: { dot: 'bg-danger animate-pulse-danger', label: 'Franja vencida' },
};

function OrderCard({ order, onMove, busy }) {
  const light = trafficLight(order);
  const l = light ? LIGHT_STYLES[light] : null;
  return (
    <article
      data-testid={`pedido-${order.id}`}
      className="glass rounded-card p-4 shadow-card"
    >
      <header className="flex items-center justify-between gap-2">
        <h3 className="truncate text-sm font-semibold text-on-surface">{order.customerName}</h3>
        {l ? (
          <span className="flex items-center gap-1.5 text-xs font-medium text-on-surface-muted">
            <span className={`h-2.5 w-2.5 rounded-pill ${l.dot}`} aria-hidden="true" />
            {l.label}
          </span>
        ) : null}
      </header>
      <p className="mt-1 text-xs text-on-surface-muted">
        {formatDateLabel(order.date)} · {delivery.slotLabels[order.slot]}
      </p>
      <p className="mt-1 text-xs text-on-surface-muted">
        {order.zoneName} — {order.address}
      </p>
      <p className="mt-1 text-xs text-on-surface-muted">Tel: {order.customerPhone}</p>
      <ul className="mt-2 space-y-0.5 text-xs text-on-surface">
        {order.items.map((it) => (
          <li key={it.productId}>
            {it.qty} × {it.title}
          </li>
        ))}
      </ul>
      {order.notes ? <p className="mt-1.5 text-xs italic text-on-surface-muted">“{order.notes}”</p> : null}
      <p className="mt-2 font-display text-sm font-extrabold text-primary-strong">{formatCop(order.total)}</p>
      {TRANSITIONS[order.status].length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {TRANSITIONS[order.status].map((next) => (
            <button
              key={next}
              type="button"
              disabled={busy}
              onClick={() => onMove(order, next)}
              className={`rounded-pill px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                next === 'CANCELADO'
                  ? 'border border-danger/40 text-danger hover:bg-danger-container'
                  : 'bg-primary text-on-primary hover:bg-primary-strong'
              }`}
            >
              {board.actionLabels[next]}
            </button>
          ))}
        </div>
      ) : null}
    </article>
  );
}

export default function Tablero() {
  const [orders, setOrders] = useState(null);
  const [filters, setFilters] = useState({ date: '', zone: '' });
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (filters.date) params.set('date', filters.date);
    if (filters.zone) params.set('zone', filters.zone);
    try {
      const res = await fetch(`/api/admin/orders?${params}`);
      if (res.status === 401) {
        window.location.href = '/admin/login';
        return;
      }
      const data = await res.json();
      setOrders(data.orders ?? []);
      setError(null);
    } catch {
      setError('No se pudo cargar el tablero. Reintentando…');
    }
  }, [filters]);

  useEffect(() => {
    setOrders(null);
    load();
    const t = setInterval(load, 60_000); // el semáforo y los pedidos se refrescan solos
    return () => clearInterval(t);
  }, [load]);

  async function move(order, next) {
    setBusyId(order.id);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders((os) => os.map((o) => (o.id === updated.id ? updated : o)));
      } else {
        await load(); // transición inválida o pedido movido por otra pestaña: re-sincroniza
      }
    } catch {
      setError('No se pudo mover el pedido. Revisa tu conexión.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold uppercase tracking-wide text-primary">
            {site.name} — Pedidos
          </h1>
          <p className="text-sm text-on-surface-muted">
            Semáforo: <span className="font-medium text-success">verde</span> con tiempo ·{' '}
            <span className="font-medium text-warning">amarillo</span> entrega hoy ·{' '}
            <span className="font-medium text-danger">rojo</span> franja vencida sin salir
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs font-semibold text-on-surface-muted">
            Día
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters((f) => ({ ...f, date: e.target.value }))}
              className="ml-2 rounded-xl border border-primary/20 bg-background-deep/50 px-3 py-2 text-sm font-normal text-on-surface [color-scheme:dark]"
            />
          </label>
          <label className="text-xs font-semibold text-on-surface-muted">
            Zona
            <select
              value={filters.zone}
              onChange={(e) => setFilters((f) => ({ ...f, zone: e.target.value }))}
              className="ml-2 rounded-xl border border-primary/20 bg-background-deep/50 px-3 py-2 text-sm font-normal text-on-surface"
            >
              <option value="">Todas</option>
              {delivery.zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
          </label>
          {filters.date || filters.zone ? (
            <button
              type="button"
              onClick={() => setFilters({ date: '', zone: '' })}
              className="rounded-pill px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/10"
            >
              Limpiar filtros
            </button>
          ) : null}
        </div>
      </header>

      {error ? (
        <p role="alert" className="mt-4 rounded-card bg-danger-container px-4 py-3 text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}

      {orders === null ? (
        <p className="mt-10 text-center text-sm text-on-surface-muted">Cargando pedidos…</p>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-3 xl:grid-cols-5">
          {STATUSES.map((status) => {
            const column = orders.filter((o) => o.status === status);
            return (
              <section key={status} data-testid={`columna-${status}`} className="rounded-card bg-background-deep/60 p-3">
                <h2 className="flex items-center justify-between px-1 text-sm font-semibold text-on-surface">
                  {board.statusLabels[status]}
                  <span className="rounded-pill bg-primary/10 px-2 py-0.5 text-xs text-on-surface-muted">
                    {column.length}
                  </span>
                </h2>
                <div className="mt-3 space-y-3">
                  {column.map((o) => (
                    <OrderCard key={o.id} order={o} onMove={move} busy={busyId === o.id} />
                  ))}
                  {column.length === 0 ? (
                    <p className="px-1 py-4 text-center text-xs text-on-surface-muted">Sin pedidos</p>
                  ) : null}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}
