import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: 'app.html',
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
  plugins: [react()],
});
