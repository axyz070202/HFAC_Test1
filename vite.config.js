import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// host: true (equivalent to --host) lets other phones on the same WiFi reach the dev server.
export default defineConfig({
    plugins: [react()],
    server: {
        host: true,
    },
});
