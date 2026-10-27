'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Star4 from './ui/Star4.jsx';
import Icon from './ui/Icon.jsx';
import { catalog, formatCop } from '../data/content.js';
import { addToCart } from '../lib/cart.js';

function RatingBadge({ rating }) {
  return (
    <span className="absolute right-3 top-3 z-[4] flex items-center gap-1 rounded-pill border border-gold/30 bg-background-deep/75 px-2 py-0.5">
      <span className="text-[11.5px] font-bold text-on-surface">{rating.toFixed(1)}</span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="#c9a84c" aria-hidden="true" className="shrink-0">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    </span>
  );
}

function AddButton({ product }) {
  return (
    <button
      type="button"
      aria-label={`Agregar ${product.title} al carrito`}
      onClick={() => addToCart(product.id, 1)}
      className="flex h-9 w-9 items-center justify-center rounded-pill bg-secondary pb-px text-xl leading-none text-on-secondary shadow-glow transition-transform hover:scale-110 hover:bg-secondary-strong active:scale-95"
    >
      +
    </button>
  );
}

// Tarjeta de bebida: taza flotante + rating, como la vitrina de la referencia.
function DrinkCard({ product, index }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-[315px] flex-1 pt-[120px]"
      data-testid={`producto-${product.id}`}
    >
      <img
        src={product.image}
        alt={product.title}
        draggable={false}
        className="absolute left-1/2 top-0 z-[3] w-[210px] -translate-x-1/2 select-none"
        style={{ filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.55))' }}
      />
      <div className="glass relative flex flex-col gap-2 rounded-card px-4 pb-5 pt-[78px] text-center shadow-card">
        <RatingBadge rating={product.rating} />
        <h3 className="mt-4 font-serif text-2xl font-bold text-on-surface">{product.title}</h3>
        <p className="text-xs leading-relaxed text-on-surface-muted">{product.description}</p>
        <div className="mt-2 flex items-center justify-center gap-4">
          <span className="font-display text-xl font-extrabold text-on-surface">
            {formatCop(product.price)}
          </span>
          <AddButton product={product} />
        </div>
      </div>
    </motion.article>
  );
}

// Tarjeta de café en grano: sin taza, con el grano como ícono y el tueste visible.
function BeanCard({ product, index }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="glass relative flex w-full max-w-[340px] flex-col gap-2 rounded-card p-6 text-center shadow-card"
      data-testid={`producto-${product.id}`}
    >
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-pill bg-primary/10 text-primary">
        <Icon name="bean" />
      </span>
      <h3 className="font-serif text-2xl font-bold text-on-surface">{product.title}</h3>
      <span className="mx-auto rounded-pill border border-gold/30 bg-background-deep/75 px-2.5 py-1 text-[11px] font-bold text-on-surface">
        {product.roast} · {product.presentation}
      </span>
      <p className="text-xs leading-relaxed text-on-surface-muted">{product.description}</p>
      <div className="mt-2 flex items-center justify-center gap-4">
        <span className="font-display text-xl font-extrabold text-on-surface">
          {formatCop(product.price)}
        </span>
        <AddButton product={product} />
      </div>
    </motion.article>
  );
}

export default function Catalog() {
  const drinks = catalog.products.filter((p) => p.kind === 'bebida');
  const beans = catalog.products.filter((p) => p.kind === 'grano');

  return (
    <section id="cafes" className="grain relative overflow-hidden bg-surface-dim pb-20">
      {/* Título marquee estilo vitrina */}
      <div aria-hidden="true" className="mb-2 overflow-hidden leading-none">
        <div className="pointer-events-none flex w-max select-none animate-marquee">
          {[0, 1].map((i) => (
            <span
              key={i}
              className="whitespace-nowrap pr-[0.4em] font-serif text-[clamp(56px,9.5vw,136px)] font-bold uppercase leading-none tracking-wider text-[rgba(140,90,30,0.55)]"
            >
              Nuestros cafés de origen ·
            </span>
          ))}
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-6 pt-4">
        {/* Bebidas de la casa */}
        <div className="mb-10 flex flex-wrap items-start justify-center gap-5">
          {drinks.map((p, i) => (
            <DrinkCard key={p.id} product={p} index={i} />
          ))}
        </div>

        {/* Café en grano para llevar */}
        <motion.h3
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-6 text-center font-display text-sm font-bold uppercase tracking-[0.18em] text-on-surface-muted"
        >
          Nuestro grano, para tu casa
        </motion.h3>
        <div className="mb-9 flex flex-wrap items-stretch justify-center gap-6">
          {beans.map((p, i) => (
            <BeanCard key={p.id} product={p} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <Link
            href="/comprar"
            className="inline-flex items-center rounded-pill border border-primary/30 px-7 py-3 text-sm text-on-surface-muted transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
          >
            Completar mi pedido
          </Link>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.4 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.45 }}
        className="pointer-events-none absolute bottom-6 right-7 z-[5]"
      >
        <Star4 size={32} />
      </motion.div>
    </section>
  );
}
