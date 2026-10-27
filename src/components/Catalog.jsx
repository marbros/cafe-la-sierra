'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Star4 from './ui/Star4.jsx';
import { catalog, formatCop } from '../data/content.js';

const CUP_IMAGES = { 'cafe-medio': '/cup-2.png', 'cafe-oscuro': '/cup-1.png' };

function ProductCard({ product, index }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-[340px] pt-[120px]"
    >
      {/* Taza flotante sobre la tarjeta */}
      <img
        src={CUP_IMAGES[product.id]}
        alt={product.title}
        draggable={false}
        className="absolute left-1/2 top-0 z-[3] w-[210px] -translate-x-1/2 select-none"
        style={{ filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.55))' }}
      />

      <div className="glass relative flex flex-col gap-2 rounded-card px-5 pb-5 pt-20 text-center shadow-card">
        <h3 className="mt-4 font-serif text-2xl font-bold text-on-surface">{product.title}</h3>
        <span className="mx-auto rounded-pill border border-gold/30 bg-background-deep/75 px-2.5 py-1 text-[11px] font-bold text-on-surface">
          {product.roast} · {product.weight}
        </span>
        <p className="text-xs leading-relaxed text-on-surface-muted">{product.description}</p>

        <div className="mt-2 flex items-center justify-center gap-4">
          <span className="font-display text-xl font-extrabold text-on-surface">
            {formatCop(product.price)}
          </span>
          <Link
            href="/comprar"
            aria-label={`Pedir ${product.title}`}
            className="flex h-9 w-9 items-center justify-center rounded-pill bg-secondary pb-px text-xl leading-none text-on-secondary transition-transform hover:scale-110 hover:bg-secondary-strong"
          >
            +
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

export default function Catalog() {
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

      <div className="relative z-10 mx-auto max-w-4xl px-6 pt-4">
        <div className="mb-9 flex flex-wrap items-start justify-center gap-10 sm:gap-6">
          {catalog.products.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
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
            Arma tu pedido completo
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
