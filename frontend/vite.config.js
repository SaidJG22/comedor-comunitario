import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Sin precache
      workbox: {
        globIgnores: [
          '**/assets/jspdf*', '**/assets/html2canvas*', '**/assets/purify*', '**/assets/index.es-*', '**/assets/browser-*',
          '**/assets/Graficos-*',
        ],
      },
      manifest: {
        name: 'ComeTUC – Comedor comunitario',
        short_name: 'ComeTUC',
        lang: 'es-AR',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#1e3a8a',
        // Íconos
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:3000' },
  },
});
