/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {
    colors: { brand: {
      // Les couleurs viennent du réglage « couleur » du client (voir src/site.ts, variables CSS posées dans main.tsx)
      DEFAULT: 'rgb(var(--brand, 29 63 168) / <alpha-value>)', dark: 'rgb(var(--brand-dark, 12 25 67) / <alpha-value>)',
      light: 'rgb(var(--brand-light, 243 246 252) / <alpha-value>)', soft: 'rgb(var(--brand-soft, 220 229 247) / <alpha-value>)',
      line: 'rgb(var(--brand-line, 213 221 240) / <alpha-value>)', muted: 'rgb(var(--brand-muted, 74 88 120) / <alpha-value>)',
    } },
    fontFamily: { sans: ['"Plus Jakarta Sans"', 'sans-serif'] },
    keyframes: {
      fadeUp: { '0%': { opacity: '0', transform: 'translateY(24px)' }, '100%': { opacity: '1', transform: 'none' } },
      fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
      float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-14px)' } },
      pop: { from: { opacity: '0', transform: 'scale(.95)' }, to: { opacity: '1', transform: 'none' } },
      drop: { from: { opacity: '0', transform: 'translateY(-8px)' }, to: { opacity: '1', transform: 'none' } },
    },
    animation: {
      'fade-up': 'fadeUp .7s ease-out both', 'fade-in': 'fadeIn .5s ease-out both',
      float: 'float 6s ease-in-out infinite', pop: 'pop .2s ease-out both', drop: 'drop .25s ease-out both',
    },
  } },
  plugins: [],
}
