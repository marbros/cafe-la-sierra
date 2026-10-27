'use client';

import { motion } from 'framer-motion';
import Star4 from './ui/Star4.jsx';
import { features, site } from '../data/content.js';

const fadeIn = (delay = 0, x = 0) => ({
  initial: { opacity: 0, x, y: x === 0 ? 20 : 0 },
  whileInView: { opacity: 1, x: 0, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] },
});

function FeatureItem({ number, title, text, side, delay }) {
  const isLeft = side === 'left';
  return (
    <motion.div {...fadeIn(delay, isLeft ? -28 : 28)} className="relative">
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -top-[0.15em] select-none font-serif text-[clamp(72px,8vw,110px)] font-black leading-none tracking-tight text-[rgba(140,80,20,0.22)] ${
          isLeft ? '-left-1' : '-right-1'
        }`}
      >
        {number}
      </div>
      <div className={isLeft ? 'pl-10 text-left sm:pl-12' : 'pr-10 text-right sm:pr-12'}>
        <h3 className="mb-2.5 font-display text-lg font-bold leading-tight text-on-surface">{title}</h3>
        <p className="text-[13px] leading-relaxed text-on-surface-muted/80">{text}</p>
      </div>
    </motion.div>
  );
}

export default function Features() {
  const [f1, f2, f3] = features;
  return (
    <section id="porque" className="grain relative overflow-x-clip bg-surface-dim px-6 py-16 sm:px-16 sm:py-24">
      <div className="relative mx-auto max-w-6xl">
        <motion.div {...fadeIn(0)} className="mb-12 text-center sm:mb-16">
          <span className="font-display text-xl font-black uppercase tracking-[0.12em] text-on-surface sm:text-2xl">
            {site.name}
          </span>
          <span className="ml-2.5 font-display text-xl font-light uppercase tracking-wider text-primary/55 sm:text-2xl">
            es
          </span>
        </motion.div>

        <div className="flex flex-col items-center gap-12 md:flex-row md:gap-10">
          <div className="flex flex-1 flex-col gap-12">
            <FeatureItem number="1" {...f1} side="left" delay={0.1} />
            <FeatureItem number="2" {...f2} side="left" delay={0.22} />
          </div>

          {/* Centro: cuchara de café levitando */}
          <div className="flex w-[clamp(240px,30vw,400px)] shrink-0 flex-col items-center gap-7">
            <img
              src="/spoon.png"
              alt=""
              aria-hidden="true"
              draggable={false}
              className="w-full select-none animate-levitate"
              style={{ filter: 'drop-shadow(0 24px 40px rgba(0,0,0,0.6))' }}
            />
          </div>

          <div className="flex flex-1 flex-col gap-12">
            <FeatureItem number="3" {...f3} side="right" delay={0.34} />
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.4 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.5 }}
        className="pointer-events-none absolute bottom-6 right-7 z-[5]"
      >
        <Star4 size={32} />
      </motion.div>
    </section>
  );
}
