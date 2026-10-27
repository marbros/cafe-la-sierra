import Link from 'next/link';
import Container from './ui/Container.jsx';
import Icon from './ui/Icon.jsx';
import { site, delivery } from '../data/content.js';

export default function Hero() {
  return (
    <section className="bg-gradient-to-b from-primary-container/60 to-background">
      <Container className="flex flex-col items-center gap-6 py-20 text-center sm:py-28">
        <span className="inline-flex items-center gap-2 rounded-pill bg-secondary-container px-4 py-1.5 text-xs font-semibold text-secondary">
          <Icon name="truck" className="h-4 w-4" />
          Domicilios de lunes a sábado, mañana o tarde
        </span>
        <h1 className="max-w-2xl font-display text-4xl font-semibold leading-tight text-on-surface sm:text-5xl">
          {site.tagline}
        </h1>
        <p className="max-w-xl text-lg text-on-surface-muted">{site.description}</p>
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/comprar"
            className="rounded-pill bg-primary px-8 py-4 text-base font-semibold text-on-primary shadow-card transition-colors hover:bg-primary-strong"
          >
            Comprar ahora
          </Link>
          <a
            href="#cafes"
            className="rounded-pill px-6 py-4 text-base font-semibold text-primary hover:bg-primary-container"
          >
            Ver los cafés
          </a>
        </div>
        <p className="flex items-center gap-2 text-sm text-on-surface-muted">
          <Icon name="cash" className="h-4 w-4" />
          {delivery.paymentNote}
        </p>
      </Container>
    </section>
  );
}
