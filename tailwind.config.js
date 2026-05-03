/** @type {import('tailwindcss').Config} */
/* The token names below (cream/night/lime/pink/cobalt) carry the wizard's
   existing semantic intent — `cream` = page background, `night` = text/lines,
   `lime/pink/cobalt` = accents — but their hex values now map to the
   variant-B fintech palette so wizard.html and the landing page share one
   visual language. */
module.exports = {
  content: ['./wizard.html'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
        grotesk: ['Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace']
      },
      colors: {
        /* Foreground (was deep ink, now light grayscale) */
        night: '#e7ecf3',
        'night-deep': '#ffffff',
        'night-soft': 'rgba(231,236,243,0.85)',
        /* Background (was cream, now dark navy) */
        cream: '#0a0e1a',
        'cream-soft': '#111726',
        /* Mint accent (was lime) */
        lime: '#5eead4',
        'lime-deep': '#34d3b8',
        /* Coral accent (was pink) */
        pink: '#ff7a7a',
        'pink-deep': '#ef4444',
        /* Blue accent (was cobalt) */
        cobalt: '#5b8bff',
        'cobalt-deep': '#3d6dff',
        /* Amber accent (was tangerine) */
        tangerine: '#fbbf24',
        /* Blue-soft (was lavender) */
        lavender: '#a3bbff'
      }
    }
  }
};
