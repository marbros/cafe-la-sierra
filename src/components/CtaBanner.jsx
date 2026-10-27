'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { delivery } from '../data/content.js';

export default function CtaBanner() {
  return (
    <section className="grain relative flex min-h-[300px] items-center overflow-x-clip bg-surface-dim">
      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-12 sm:px-16">
        <motion.div
          initial={{ opacity: 0, x: -32 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="glass flex w-full max-w-xl flex-col gap-5 rounded-card p-8 shadow-card sm:p-10"
        >
          <h2 className="font-serif text-2xl font-bold leading-snug text-on-surface sm:text-3xl">
            Pide hoy y recíbelo en tu puerta
          </h2>
          <p className="text-sm leading-relaxed text-on-surface-muted">{delivery.paymentNote}</p>
          <div>
            <Link
              href="/comprar"
              className="inline-flex items-center rounded-pill border border-primary/40 bg-primary/10 px-7 py-3 text-sm font-medium text-primary transition-colors hover:border-primary/60 hover:bg-primary/20"
            >
              Hacer mi pedido
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
