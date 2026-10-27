/**
 * Design tokens de Café La Sierra, derivados de docs/02-diseno/DESIGN.md.
 * Los componentes solo usan estos tokens semánticos: nada de colores hardcodeados.
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        background: '#faf6f0',
        surface: '#ffffff',
        'surface-dim': '#f1e9de',
        'on-surface': '#2b1b12',
        'on-surface-muted': '#6f5c4e',
        primary: '#7c4a21',
        'primary-strong': '#5e3718',
        'on-primary': '#fff8f0',
        'primary-container': '#f3e3d2',
        'on-primary-container': '#4a2b12',
        secondary: '#3e5c45',
        'on-secondary': '#ffffff',
        'secondary-container': '#dcebe0',
        outline: '#d9cbbb',
        success: '#2f7d4f',
        'success-container': '#def2e4',
        warning: '#b7791f',
        'warning-container': '#fdeed3',
        danger: '#c2362b',
        'danger-container': '#fde3e0',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '1rem',
        pill: '9999px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(43, 27, 18, 0.06), 0 8px 24px rgba(43, 27, 18, 0.08)',
      },
      keyframes: {
        'pulse-danger': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.45' },
        },
      },
      animation: {
        'pulse-danger': 'pulse-danger 1.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
