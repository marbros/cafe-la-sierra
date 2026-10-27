const VARIANTS = {
  primary:
    'bg-primary text-on-primary hover:bg-primary-strong disabled:bg-outline disabled:text-surface',
  outline:
    'border border-primary text-primary hover:bg-primary-container disabled:border-outline disabled:text-outline',
  ghost: 'text-primary hover:bg-primary-container',
};

export default function Button({ variant = 'primary', className = '', ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-pill px-6 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}
