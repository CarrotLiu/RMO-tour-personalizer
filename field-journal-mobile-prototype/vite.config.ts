import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  server: {
    host: '0.0.0.0',
    port: 5174,
    strictPort: true,
    allowedHosts: true,
  },
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
