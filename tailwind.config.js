/**
 * Design tokens de Café La Sierra v2 ("cuero y crema"), derivados de
 * docs/02-diseno/DESIGN.md. Tema oscuro tipo brulería artesanal: fondo cuero
 * #1c1008, crema #e8d5b7 como color de acción, salvia #5b7566 y dorado #c9a84c.
 * Los componentes solo usan estos tokens semánticos: nada de colores hardcodeados.
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        background: '#1c1008',
        'background-deep': '#0e0804',
        surface: '#261409',
        'surface-dim': '#1c0e04',
        'on-surface': '#f0e2c8',
        'on-surface-muted': '#b8a080',
        primary: '#e8d5b7',
        'primary-strong': '#f5e8cc',
        'on-primary': '#1c0e04',
        'primary-container': '#33200f',
        'on-primary-container': '#e8d5b7',
        secondary: '#5b7566',
        'secondary-strong': '#4d6457',
        'on-secondary': '#f0e8d8',
        'secondary-container': '#223129',
        gold: '#c9a84c',
        outline: '#4a2f18',
        success: '#6fbf8f',
        'success-container': '#22402d',
        warning: '#d9a441',
        'warning-container': '#42351a',
        danger: '#e05c4e',
        'danger-container': '#43201b',
      },
      fontFamily: {
        display: ['Manrope', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '20px',
        pill: '9999px',
      },
      boxShadow: {
        card: '0 8px 32px rgba(0, 0, 0, 0.40), inset 0 1px 0 rgba(232, 213, 183, 0.10)',
        glow: '0 4px 20px rgba(0, 0, 0, 0.5)',
      },
      keyframes: {
        'pulse-danger': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.45' },
        },
        levitate: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-16px)' },
        },
        'marquee-ltr': {
          from: { transform: 'translateX(-50%)' },
          to: { transform: 'translateX(0%)' },
        },
      },
      animation: {
        'pulse-danger': 'pulse-danger 1.2s ease-in-out infinite',
        levitate: 'levitate 3.5s ease-in-out infinite',
        marquee: 'marquee-ltr 18s linear infinite',
      },
    },
  },
  plugins: [],
};
