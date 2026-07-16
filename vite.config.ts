import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// host: true (equivalent to --host) lets other phones on the same WiFi reach the dev server.
// base matches the GitHub Pages project-site path (https://<user>.github.io/HFAC_Test1/) for
// the web build. The Capacitor Android build serves dist/ from its own local scheme instead
// of a subpath, so it needs base '/' — set CAP_BUILD=1 (see the build:android script) to
// switch it.
export default defineConfig({
  plugins: [react()],
  base: process.env.CAP_BUILD ? '/' : '/HFAC_Test1/',
  server: {
    host: true,
  },
});
