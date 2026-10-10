/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {
    colors: { brand: { DEFAULT: '#1D3FA8', dark: '#0F1F4D', light: '#F3F6FC', soft: '#DCE5F7', line: '#D5DDF0', muted: '#4A5878' } },
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
