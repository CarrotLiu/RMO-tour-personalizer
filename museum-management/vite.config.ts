import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Deployed by committing dist/ into the repo, served by branch-based GitHub Pages
// at https://carrotliu.github.io/RMO-tour-personalizer/museum-management/dist/.
// A relative base makes the build work at any subpath (same pattern as final-prototype).
export default defineConfig(({ command }) => ({
  base: command === 'build' ? './' : '/',
  plugins: [react()],
}));
