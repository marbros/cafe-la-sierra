// Íconos inline (sin dependencias ni requests externos). Trazos de 1.75 sobre caja 24x24.
const PATHS = {
  mountain: 'M3 20L10 7l4 6 2.5-3.5L21 20H3z',
  flame: 'M12 3c1 3-4 5-4 9a4 4 0 008 0c0-1.5-.6-2.6-1.3-3.6C14 10 16 9 15.5 6.5 14.5 7.5 13 7.5 12 3z',
  handshake: 'M4 11l4-4 4 3 4-3 4 4M8 7v6a2 2 0 002 2h4a2 2 0 002-2V7M6 13l-2 2m16-2l2 2',
  bean: 'M7 4c5 0 10 5 10 10a6 6 0 01-10-10zm0 0a6 6 0 1010 10M9 8c2 1 4 3 5 5',
  truck: 'M3 7h11v8H3zM14 10h4l3 3v2h-7zM7 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm10 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z',
  cash: 'M3 7h18v10H3zM12 14a2 2 0 100-4 2 2 0 000 4zM6 10h.01M18 14h.01',
  check: 'M4 12l5 5L20 6',
};

export default function Icon({ name, className = 'h-6 w-6' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d={PATHS[name] ?? ''} />
    </svg>
  );
}
