import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      manifest: {
        name: "To-Do App",
        short_name: "To-Do",
        description: "Simple Tasks App.",
        start_url: '/',
        display: "standalone",
        background_color: "#121212",
        theme_color: '#FF007F',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ],
        screenshots: [
          {
            src: '/screenshots/icon-1280x780.png',
            sizes: '1280x780',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Vista de Escritorio'
          },
          {
            src: '/screenshots/screenshot-mobile.png',
            sizes: '750x1334',
            type: 'image/png',
            label: 'Vista Móvil'
          }
        ],
      },
      devOptions: {
        enabled: false,
      },
    })
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://server:5000',
        changeOrigin: true,
      },
    },
  },
});