'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Star4 from './ui/Star4.jsx';
import { delivery, site } from '../data/content.js';

const fadeLeft = (delay = 0) => ({
  initial: { opacity: 0, x: -34 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
});

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
});

function HeroCoffeeImage() {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const rotateY = useSpring(useTransform(x, [-1, 1], [-6, 6]), { stiffness: 160, damping: 22 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={(e) => {
        const rect = ref.current.getBoundingClientRect();
        x.set((e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2));
      }}
      onMouseLeave={() => x.set(0)}
      initial={{ opacity: 0, y: 40, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: '900px', transformStyle: 'preserve-3d' }}
      className="relative shrink-0"
    >
      <motion.img
        src="/hero-coffee.png"
        alt="Tazas de café de origen La Sierra"
        draggable={false}
        style={{
          rotateY,
          transformStyle: 'preserve-3d',
          width: 'clamp(420px, 48vw, 720px)',
          filter: 'drop-shadow(0 28px 48px rgba(0,0,0,0.70)) drop-shadow(0 8px 18px rgba(0,0,0,0.55))',
        }}
        className="block h-auto object-contain"
      />
    </motion.div>
  );
}

export default function Hero() {
  return (
    <section className="grain relative flex min-h-screen items-center overflow-x-clip bg-[#231208]">
      {/* Brillos radiales cálidos sobre el cuero */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            'radial-gradient(ellipse 55% 70% at 82% 42%, rgba(58, 28, 10, 1) 0%, transparent 70%)',
            'radial-gradient(ellipse 40% 40% at 95% 5%, rgba(48, 22, 6, 0.7) 0%, transparent 60%)',
            'radial-gradient(ellipse 60% 40% at 50% 100%, rgba(10, 5, 1, 0.8) 0%, transparent 70%)',
          ].join(', '),
        }}
      />
      {/* Oscurecido del lado izquierdo para que el titular respire */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(100deg, rgba(14,6,1,0.75) 0%, rgba(14,6,1,0.45) 40%, rgba(14,6,1,0) 70%)',
        }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl items-center gap-8 px-6 pb-16 pt-32 sm:px-12 lg:gap-20">
        <div className="max-w-xl">
          <motion.div {...fadeLeft(0.1)} className="mb-7">
            <span className="inline-flex items-center gap-2 rounded-pill border border-secondary/40 bg-secondary/10 px-4 py-1.5 text-[13px] font-medium text-secondary">
              <span className="h-[7px] w-[7px] shrink-0 rounded-pill bg-secondary" />
              Domicilios de lunes a sábado · mañana o tarde
            </span>
          </motion.div>

          <motion.h1
            {...fadeLeft(0.24)}
            className="mb-5 font-display text-4xl font-black leading-[1.05] tracking-tight text-on-surface sm:text-5xl lg:text-6xl"
          >
            Café colombiano de <span className="text-gold">origen</span>, directo a tu taza
          </motion.h1>

          <motion.p {...fadeLeft(0.4)} className="mb-9 max-w-md leading-relaxed text-on-surface-muted">
            {site.description} Pide en línea y paga en efectivo al recibir.
          </motion.p>

          <motion.div {...fadeUp(0.54)} className="flex flex-wrap items-center gap-4">
            <Link
              href="/comprar"
              className="inline-flex items-center rounded-pill bg-secondary px-8 py-3.5 text-[15px] font-semibold text-on-secondary shadow-glow transition-all hover:-translate-y-0.5 hover:bg-secondary-strong"
            >
              Comprar ahora
            </Link>
            <a
              href="#cafes"
              className="inline-flex items-center rounded-pill border border-primary/30 px-6 py-3.5 text-[15px] font-medium text-primary transition-colors hover:bg-primary/10"
            >
              Ver los cafés
            </a>
          </motion.div>

          <motion.p {...fadeUp(0.68)} className="mt-6 text-sm text-on-surface-muted/80">
            {delivery.paymentNote}
          </motion.p>
        </div>
      </div>

      {/* Imagen hero a la derecha, se asoma sobre el navbar */}
      <div className="absolute -top-20 right-0 z-20 hidden lg:right-6 lg:block">
        <HeroCoffeeImage />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.4, rotate: -15 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.85, delay: 0.95, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute bottom-8 right-8 z-10"
      >
        <Star4 size={46} />
      </motion.div>
    </section>
  );
}
