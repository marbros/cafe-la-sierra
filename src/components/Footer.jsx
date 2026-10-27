import Container from './ui/Container.jsx';
import { site } from '../data/content.js';

export default function Footer() {
  return (
    <footer className="border-t border-primary/10 bg-background-deep">
      <Container className="flex flex-col items-center gap-2 py-8 text-center text-sm text-on-surface-muted">
        <p className="font-display text-base font-black uppercase tracking-[0.14em] text-primary">
          {site.name}
        </p>
        <p>© 2026 {site.name}. Café de origen colombiano.</p>
      </Container>
    </footer>
  );
}
