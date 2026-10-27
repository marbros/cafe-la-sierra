'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { site } from '../data/content.js';

const links = [
  { href: '/#cafes', label: 'Nuestros cafés' },
  { href: '/#porque', label: 'Por qué La Sierra' },
];

export default function Header() {
  const [mobileOpen, setMobile] = useState(false);
  const pathname = usePathname();

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-4 sm:px-10"
    >
      <Link
        href="/"
        className="font-display text-lg font-black uppercase tracking-[0.14em] text-primary"
      >
        {site.name}
      </Link>

      <nav className="glass absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-pill px-2 py-1.5 shadow-glow md:flex">
        {links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className="whitespace-nowrap rounded-pill px-5 py-1.5 text-sm text-on-surface-muted transition-colors hover:bg-primary/10 hover:text-primary"
          >
            {l.label}
          </a>
        ))}
      </nav>

      <div className="hidden items-center md:flex">
        <Link
          href="/comprar"
          className="whitespace-nowrap rounded-pill bg-primary px-6 py-2.5 text-sm font-semibold text-on-primary shadow-glow transition-all hover:-translate-y-px hover:bg-primary-strong"
        >
          Comprar ahora
        </Link>
      </div>

      <button
        type="button"
        onClick={() => setMobile(!mobileOpen)}
        aria-label="Abrir menú"
        className="rounded-pill p-2 text-primary md:hidden"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {mobileOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
        </svg>
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="glass absolute inset-x-4 top-full mt-2 rounded-card bg-background-deep/95 p-3 md:hidden"
          >
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMobile(false)}
                className="block rounded-card px-4 py-2.5 text-sm text-on-surface-muted hover:text-primary"
              >
                {l.label}
              </a>
            ))}
            <Link
              href="/comprar"
              onClick={() => setMobile(false)}
              className={`mt-2 block rounded-pill bg-secondary px-4 py-3 text-center text-sm font-semibold text-on-secondary ${
                pathname === '/comprar' ? 'pointer-events-none opacity-60' : ''
              }`}
            >
              Comprar ahora
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
