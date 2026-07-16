import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// host: true (equivalent to --host) lets other phones on the same WiFi reach the dev server.
// base matches the GitHub Pages project-site path (https://<user>.github.io/HFAC_Test1/);
// only applies to the production build, not `vite dev`.
export default defineConfig({
  plugins: [react()],
  base: '/HFAC_Test1/',
  server: {
    host: true,
  },
});
