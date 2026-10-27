'use client';

// Flujo de compra (PRD: catálogo → cantidad → datos de entrega → confirmación).
// El servidor re-valida todo: este componente solo guía y evita errores obvios.
// La idempotencyKey nace una vez por intento de compra: un doble clic o un reintento
// de red devuelven el MISMO pedido (caso borde 5 del PRD).
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Container from '../ui/Container.jsx';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import { catalog, delivery, formatCop } from '../../data/content.js';
import { formatDateLabel } from '../../lib/time.js';

const EMPTY_QTYS = Object.fromEntries(catalog.products.map((p) => [p.id, 0]));

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-on-surface">{label}</span>
      <div className="mt-1.5">{children}</div>
      {error ? <p className="mt-1 text-xs font-medium text-danger">{error}</p> : null}
    </label>
  );
}

const inputClass =
  'w-full rounded-xl border border-primary/20 bg-background-deep/50 px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-muted/60';

export default function ComprarCafe() {
  const [qtys, setQtys] = useState(EMPTY_QTYS);
  const [form, setForm] = useState({ customerName: '', customerPhone: '', address: '', zoneId: '', slotValue: '', notes: '' });
  const [slots, setSlots] = useState(null); // null = cargando
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [confirmed, setConfirmed] = useState(null);
  const [idempotencyKey] = useState(() => crypto.randomUUID());

  const loadSlots = () =>
    fetch('/api/orders/slots')
      .then((r) => r.json())
      .then((data) => setSlots(data.slots ?? []))
      .catch(() => setSlots([]));

  useEffect(() => {
    loadSlots();
  }, []);

  const items = useMemo(
    () =>
      catalog.products
        .filter((p) => qtys[p.id] > 0)
        .map((p) => ({ productId: p.id, title: p.title, unitPrice: p.price, qty: qtys[p.id] })),
    [qtys],
  );
  const subtotal = items.reduce((sum, it) => sum + it.unitPrice * it.qty, 0);
  const zone = delivery.zones.find((z) => z.id === form.zoneId) ?? null;
  const total = subtotal + (zone?.fee ?? 0);

  const phoneDigits = form.customerPhone.replace(/\D/g, '').length;
  const errors = {
    items: items.length === 0 ? 'Elige al menos una bolsa de café.' : null,
    customerName: form.customerName.trim() === '' ? 'Escribe tu nombre.' : null,
    customerPhone:
      phoneDigits < 7 || phoneDigits > 15 ? 'Escribe un teléfono válido (7 a 15 dígitos).' : null,
    address: form.address.trim().length < 8 ? 'Escribe la dirección completa de entrega.' : null,
    zoneId: zone ? null : 'Elige tu zona para ver la tarifa del domicilio.',
    slotValue: form.slotValue === '' ? 'Elige el día y la franja de entrega.' : null,
  };
  const isValid = Object.values(errors).every((e) => e === null);

  const setQty = (id, delta) =>
    setQtys((q) => ({
      ...q,
      [id]: Math.min(catalog.maxQtyPerProduct, Math.max(0, q[id] + delta)),
    }));
  const setField = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setTouched(true);
    setServerError(null);
    if (!isValid || submitting) return;

    const [date, slot] = form.slotValue.split('|');
    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(({ productId, qty }) => ({ productId, qty })),
          customerName: form.customerName,
          customerPhone: form.customerPhone,
          address: form.address,
          zoneId: form.zoneId,
          date,
          slot,
          notes: form.notes || null,
          idempotencyKey,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setConfirmed(data);
        return;
      }
      if (res.status === 422 && data.fields?.includes('slot')) {
        setForm((f) => ({ ...f, slotValue: '' }));
        setSlots(null);
        loadSlots();
        setServerError('Esa franja ya cerró mientras completabas el pedido. Elige otra, por favor.');
      } else {
        setServerError('No pudimos registrar tu pedido. Revisa los datos e intenta de nuevo.');
      }
    } catch {
      setServerError('Hubo un problema de conexión. Intenta de nuevo: tu pedido no se duplicará.');
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmed) {
    const slotLabel = `${formatDateLabel(confirmed.date)} — ${delivery.slotLabels[confirmed.slot]}`;
    return (
      <Container className="max-w-xl">
        <div data-testid="confirmacion" className="glass rounded-card p-8 text-center shadow-card">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-pill bg-success-container text-success">
            <Icon name="check" className="h-7 w-7" />
          </span>
          <h1 className="mt-4 font-display text-3xl font-semibold text-on-surface">
            ¡Pedido confirmado!
          </h1>
          <p className="mt-2 text-sm text-on-surface-muted">
            Pedido <span className="font-mono font-semibold">{confirmed.id.slice(0, 8)}</span>. Te
            llamaremos al {confirmed.customerPhone} si necesitamos confirmar algo.
          </p>
          <dl className="mt-6 space-y-2 rounded-card bg-background-deep/50 p-5 text-left text-sm">
            {confirmed.items.map((it) => (
              <div key={it.productId} className="flex justify-between">
                <dt>
                  {it.qty} × {it.title}
                </dt>
                <dd className="font-semibold">{formatCop(it.unitPrice * it.qty)}</dd>
              </div>
            ))}
            <div className="flex justify-between text-on-surface-muted">
              <dt>Domicilio · {confirmed.zoneName}</dt>
              <dd>{formatCop(confirmed.deliveryFee)}</dd>
            </div>
            <div className="flex justify-between border-t border-outline pt-2 text-base font-semibold">
              <dt>Total a pagar en efectivo</dt>
              <dd data-testid="total-confirmado">{formatCop(confirmed.total)}</dd>
            </div>
          </dl>
          <p className="mt-4 text-sm text-on-surface-muted">
            Entrega: <span className="font-semibold text-on-surface">{slotLabel}</span>
            <br />
            {confirmed.address}
          </p>
          <p className="mt-4 text-xs text-on-surface-muted">{delivery.paymentNote}</p>
          <Link href="/" className="mt-6 inline-block rounded-pill bg-primary px-6 py-3 text-sm font-semibold text-on-primary hover:bg-primary-strong">
            Volver al inicio
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container className="max-w-2xl">
      <h1 className="font-display text-3xl font-semibold text-on-surface sm:text-4xl">Tu pedido</h1>
      <p className="mt-2 text-sm text-on-surface-muted">
        Elige tus cafés, cuéntanos dónde entregarte y paga en efectivo al recibir.
      </p>

      <form onSubmit={submit} noValidate className="mt-8 space-y-8">
        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold uppercase tracking-wide text-on-surface-muted">
            1 · Elige tus cafés
          </legend>
          {catalog.products.map((p) => (
            <div
              key={p.id}
              data-testid={`producto-${p.id}`}
              className="glass flex items-center justify-between gap-4 rounded-card p-5 shadow-card"
            >
              <div>
                <h3 className="font-display text-lg font-semibold text-on-surface">{p.title}</h3>
                <p className="text-xs text-on-surface-muted">
                  {p.roast} · {p.weight} · {formatCop(p.price)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label={`Quitar ${p.title}`}
                  onClick={() => setQty(p.id, -1)}
                  className="h-9 w-9 rounded-pill border border-primary/30 text-lg font-semibold text-primary hover:bg-primary/10"
                >
                  −
                </button>
                <span data-testid={`qty-${p.id}`} className="w-6 text-center font-semibold">
                  {qtys[p.id]}
                </span>
                <button
                  type="button"
                  aria-label={`Agregar ${p.title}`}
                  onClick={() => setQty(p.id, 1)}
                  className="h-9 w-9 rounded-pill border border-primary/30 text-lg font-semibold text-primary hover:bg-primary/10"
                >
                  +
                </button>
              </div>
            </div>
          ))}
          {touched && errors.items ? (
            <p className="text-xs font-medium text-danger">{errors.items}</p>
          ) : null}
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold uppercase tracking-wide text-on-surface-muted">
            2 · Datos de entrega
          </legend>
          <Field label="Nombre" error={touched ? errors.customerName : null}>
            <input
              name="customerName"
              value={form.customerName}
              onChange={setField('customerName')}
              placeholder="¿Quién recibe?"
              className={inputClass}
            />
          </Field>
          <Field label="Teléfono" error={touched ? errors.customerPhone : null}>
            <input
              name="customerPhone"
              type="tel"
              value={form.customerPhone}
              onChange={setField('customerPhone')}
              placeholder="300 123 4567"
              className={inputClass}
            />
          </Field>
          <Field label="Dirección de entrega" error={touched ? errors.address : null}>
            <input
              name="address"
              value={form.address}
              onChange={setField('address')}
              placeholder="Calle, número, apto, referencias"
              className={inputClass}
            />
          </Field>
          <Field label="Zona (define la tarifa del domicilio)" error={touched ? errors.zoneId : null}>
            <select name="zoneId" value={form.zoneId} onChange={setField('zoneId')} className={inputClass}>
              <option value="">Elige tu zona…</option>
              {delivery.zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name} — domicilio {formatCop(z.fee)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Día y franja de entrega" error={touched ? errors.slotValue : null}>
            <select
              name="slotValue"
              value={form.slotValue}
              onChange={setField('slotValue')}
              className={inputClass}
              disabled={slots === null}
            >
              <option value="">
                {slots === null ? 'Cargando franjas…' : 'Elige día y franja…'}
              </option>
              {(slots ?? []).map(({ date, slot }) => (
                <option key={`${date}|${slot}`} value={`${date}|${slot}`}>
                  {formatDateLabel(date)} — {delivery.slotLabels[slot]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Notas para la entrega (opcional)">
            <input
              name="notes"
              value={form.notes}
              onChange={setField('notes')}
              placeholder="Ej: timbre dañado, llamar al llegar"
              className={inputClass}
            />
          </Field>
        </fieldset>

        <div className="glass rounded-card p-5 shadow-card">
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd data-testid="subtotal">{formatCop(subtotal)}</dd>
            </div>
            <div className="flex justify-between text-on-surface-muted">
              <dt>Domicilio{zone ? ` · ${zone.name}` : ''}</dt>
              <dd>{zone ? formatCop(zone.fee) : '—'}</dd>
            </div>
            <div className="flex justify-between border-t border-outline pt-2 text-base font-semibold">
              <dt>Total (efectivo contra entrega)</dt>
              <dd data-testid="total">{formatCop(total)}</dd>
            </div>
          </dl>
        </div>

        {serverError ? (
          <p role="alert" className="rounded-card bg-danger-container px-4 py-3 text-sm font-medium text-danger">
            {serverError}
          </p>
        ) : null}

        <Button type="submit" disabled={submitting} className="w-full py-4 text-base">
          {submitting ? 'Confirmando…' : 'Confirmar pedido'}
        </Button>
      </form>
    </Container>
  );
}
