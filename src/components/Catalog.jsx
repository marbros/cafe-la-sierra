import Link from 'next/link';
import Container from './ui/Container.jsx';
import Icon from './ui/Icon.jsx';
import { catalog, formatCop } from '../data/content.js';

export default function Catalog() {
  return (
    <section id="cafes" className="bg-surface-dim/60 py-16 sm:py-20">
      <Container>
        <h2 className="text-center font-display text-3xl font-semibold text-on-surface">
          Nuestros cafés
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-on-surface-muted">
          Dos tuestes, un mismo origen. Elige el tuyo y pídelo a tu puerta.
        </p>
        <div className="mx-auto mt-10 grid max-w-3xl gap-6 sm:grid-cols-2">
          {catalog.products.map((p) => (
            <article
              key={p.id}
              className="flex flex-col rounded-card border border-outline/60 bg-surface p-8 shadow-card"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-pill bg-primary-container text-primary">
                <Icon name="bean" />
              </span>
              <h3 className="mt-5 font-display text-2xl font-semibold text-on-surface">{p.title}</h3>
              <p className="text-sm font-medium uppercase tracking-wide text-on-surface-muted">
                {p.roast} · {p.weight}
              </p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-on-surface-muted">
                {p.description}
              </p>
              <p className="mt-5 font-display text-3xl font-semibold text-primary-strong">
                {formatCop(p.price)}
              </p>
              <Link
                href="/comprar"
                className="mt-5 rounded-pill bg-primary px-6 py-3 text-center text-sm font-semibold text-on-primary transition-colors hover:bg-primary-strong"
              >
                Pedir este café
              </Link>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
