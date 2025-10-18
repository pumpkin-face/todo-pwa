import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      manifest: {
        name: "To-Do App",
        short_name: "To-Do",
        description: "Simple Tasks App.",
        start_url: '/',
        display: "standalone",
        background_color: "#121212",
        theme_color: '#FF007F',
        orientation: "portrait",
        categories: ["productivity", "utilities"],
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        // --- AÑADIDO: Capturas de pantalla ---
        screenshots: [
          {
            "src": "/icon-1280x780.png",
            "sizes": "1280x780",
            "type": "image/png",
            "form_factor": "wide",
            "label": "Vista de Tareas en Escritorio"
          },
          {
            "src": "/screenshot-mobile.png",
            "sizes": "750x1334",
            "type": "image/png",
            "form_factor": "narrow",
            "label": "Vista de Tareas en Móvil"
          }
        ]
      },
    })
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['axios', 'idb']
        }
      }
    }
  }
});