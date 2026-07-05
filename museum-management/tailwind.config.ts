import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#111827',
        museum: '#172033',
        panel: '#f7f4ed',
        gold: '#c9a74f',
        clay: '#8a443b',
      },
      boxShadow: {
        card: '0 18px 45px rgba(15, 23, 42, 0.10)',
      },
    },
  },
  plugins: [],
} satisfies Config;
