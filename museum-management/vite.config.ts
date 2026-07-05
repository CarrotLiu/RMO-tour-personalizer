import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

// Deployed by GitHub Actions, which copies dist/ to the Pages artifact at
// /museum-management/. A relative base keeps bundled assets scoped there.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? './' : '/',
  build: {
    rollupOptions: {
      input: resolve(__dirname, 'app.html'),
    },
  },
  plugins: [react()],
}));
