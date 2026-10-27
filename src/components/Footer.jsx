import Container from './ui/Container.jsx';
import { site } from '../data/content.js';

export default function Footer() {
  return (
    <footer className="border-t border-outline/50 bg-surface-dim/40">
      <Container className="flex flex-col items-center gap-2 py-8 text-center text-sm text-on-surface-muted">
        <p className="font-display text-base font-semibold text-primary-strong">{site.name}</p>
        <p>© 2026 {site.name}. Café de origen colombiano.</p>
      </Container>
    </footer>
  );
}
