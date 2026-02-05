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
        name: "Ttodo",
        short_name: "todo",
        description: "asdsadasdsad.",
        start_url: '/',
        display: "standalone",
        background_color: "#121212",
        theme_color: '#FF007F',
        orientation: "portrait",
        categories: ["productivity", "utilities"],
        icons: [
          {
            src: '/icon-192x1w.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-512xw.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        // --- AÑADIDO: Capturas de pantalla ---
        screenshots: [
          {
            "src": "/icon-1280xw.png",
            "sizes": "1280x780",
            "type": "image/png",
            "form_factor": "wide",
            "label": "awewea"
          },
          {
            "src": "/screenshoteee.png",
            "sizes": "750x1334",
            "type": "image/png",
            "form_factor": "narrow",
            "label": "asdf"
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
