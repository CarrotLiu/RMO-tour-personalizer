import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Served from https://carrotliu.github.io/RMO-tour-personalizer/ on GitHub Pages,
// so the production build needs that repo path as its base. Dev stays at '/'.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/RMO-tour-personalizer/' : '/',
  plugins: [react()],
}));
