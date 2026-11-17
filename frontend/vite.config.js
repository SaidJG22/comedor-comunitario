import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Las librerías de exportación (PDF/Excel) se cargan solo al exportar: no se precachean.
      workbox: {
        globIgnores: ['**/assets/jspdf*', '**/assets/html2canvas*', '**/assets/purify*', '**/assets/index.es-*', '**/assets/browser-*'],
      },
      manifest: {
        name: 'Mesa Abierta – Gestión de Comedores Comunitarios',
        short_name: 'Mesa Abierta',
        lang: 'es-AR',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#1f6f50',
        icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:3000' },
  },
});
