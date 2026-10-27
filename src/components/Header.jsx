import Link from 'next/link';
import Container from './ui/Container.jsx';
import { site } from '../data/content.js';

export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-outline/50 bg-background/90 backdrop-blur">
      <Container className="flex items-center justify-between py-4">
        <Link href="/" className="font-display text-xl font-semibold text-primary-strong">
          {site.name}
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-on-surface-muted">
          <a href="/#cafes" className="hidden hover:text-primary sm:block">
            Nuestros cafés
          </a>
          <a href="/#porque" className="hidden hover:text-primary sm:block">
            Por qué La Sierra
          </a>
          <Link
            href="/comprar"
            className="rounded-pill bg-primary px-5 py-2.5 font-semibold text-on-primary transition-colors hover:bg-primary-strong"
          >
            Comprar ahora
          </Link>
        </nav>
      </Container>
    </header>
  );
}
