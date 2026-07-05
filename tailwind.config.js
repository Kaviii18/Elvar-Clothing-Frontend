/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'elvar-bg':         '#0f0d0b',
        'elvar-surface':    '#1a1714',
        'elvar-card':       '#211e1a',
        'elvar-border':     '#3d3630',
        'elvar-cream':      '#f0ebe0',
        'elvar-muted':      '#8c7d6e',
        'elvar-gold':       '#c4a55a',
        'elvar-gold-light': '#dfc07a',
        'elvar-accent':     '#7a5c3e',
      },
      fontFamily: {
        'display': ['"Cormorant Garamond"', 'Georgia', 'serif'],
        'body':    ['"Jost"', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        'widest2': '0.25em',
        'widest3': '0.35em',
      },
    },
  },
  plugins: [],
};
