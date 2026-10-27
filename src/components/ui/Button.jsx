const VARIANTS = {
  primary:
    'bg-primary text-on-primary shadow-glow hover:bg-primary-strong disabled:bg-outline disabled:text-on-surface-muted disabled:shadow-none',
  outline:
    'border border-primary/40 text-primary hover:bg-primary/10 disabled:border-outline disabled:text-outline',
  ghost: 'text-primary hover:bg-primary/10',
};

export default function Button({ variant = 'primary', className = '', ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-pill px-6 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}
