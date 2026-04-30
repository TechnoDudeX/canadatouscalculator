/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        grotesk: ['Space Grotesk', 'system-ui', 'sans-serif'],
        sans: ['Geist', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'monospace']
      },
      colors: {
        night: '#0E0B2C',
        'night-deep': '#070518',
        'night-soft': '#1A1545',
        cream: '#FFF6E5',
        'cream-soft': '#F5EBD3',
        lime: '#D4FF3A',
        'lime-deep': '#A8D420',
        pink: '#FF3D7F',
        'pink-deep': '#D11758',
        cobalt: '#3956FF',
        'cobalt-deep': '#1F36C7',
        tangerine: '#FF8A2B',
        lavender: '#B9A8FF'
      }
    }
  }
};
