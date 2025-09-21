import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Escucha en todas las interfaces de red para que Docker funcione
    host: '0.0.0.0',
    port: 3000,
    // --- SECCIÓN DEL PROXY ---
    // Esto redirigirá las peticiones del frontend al backend
    proxy: {
      // Cualquier petición que empiece con '/api'
      '/api': {
        // será redirigida a nuestro servidor backend
        target: 'http://server:5000',
        // Cambia el origen de la cabecera para evitar problemas de CORS
        changeOrigin: true,
      },
    },
  },
})