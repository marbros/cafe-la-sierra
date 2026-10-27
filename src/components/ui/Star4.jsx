// Estrella decorativa de 4 puntas (firma visual de las secciones, DESIGN.md).
export default function Star4({ size = 40, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 46 46" fill="none" aria-hidden="true" className={className}>
      <path
        d="M23 0 L23 23 L0 23 L23 23 L23 46 L23 23 L46 23 L23 23 Z"
        stroke="rgba(232,213,183,0.40)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M23 4 L23 23 L4 23 L23 23 L23 42 L23 23 L42 23 L23 23 Z" fill="rgba(232,213,183,0.22)" />
    </svg>
  );
}
