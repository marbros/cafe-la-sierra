import Container from './ui/Container.jsx';
import Icon from './ui/Icon.jsx';
import { features } from '../data/content.js';

export default function Features() {
  return (
    <section id="porque" className="py-16 sm:py-20">
      <Container>
        <h2 className="text-center font-display text-3xl font-semibold text-on-surface">
          Por qué La Sierra
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-card bg-surface p-6 text-center shadow-card">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-pill bg-primary-container text-primary">
                <Icon name={f.icon} />
              </span>
              <h3 className="mt-4 font-display text-xl font-semibold text-on-surface">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-on-surface-muted">{f.text}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
