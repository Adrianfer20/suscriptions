import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'A|R System',
        short_name: 'AR System',
        description: 'Sistema de Gestión de Suscripciones',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    host: true,
    proxy: {
      // Proxy API requests to backend to avoid CORS in development
      '/clients': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      '/auth': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      '/subscriptions': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      '/communications': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      '/automation': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
