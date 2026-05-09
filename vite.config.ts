import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/suscriptions/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{html,js,css,svg,png,ico}'],
        globIgnores: ['**/sw.js', '**/workbox-*.js'],
        maximumFileSizeToCacheInBytes: 2_000_000,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 15 },
              networkTimeoutSeconds: 5
            }
          }
        ]
      },
      manifest: {
        name: 'A|R System - Gestión de Suscripciones',
        short_name: 'A|R System',
        description: 'Sistema de Gestión de Suscripciones y Comunicciones',
        theme_color: '#0f172a',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '.',
        orientation: 'portrait-primary',
        scope: '/suscriptions/',
        lang: 'es',
        categories: ['business', 'productivity'],
        icons: [
          {
            src: 'icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: 'icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom', 'react-hot-toast'],
          'firebase-core': ['firebase/app'],
          'firebase-auth': ['firebase/auth'],
          'firebase-messaging': ['firebase/messaging'],
          'lucide-icons': ['lucide-react'],
        }
      }
    },
    chunkSizeWarningLimit: 600,
    minify: 'esbuild',
    cssCodeSplit: true,
    sourcemap: false,
  },
  server: {
    host: true,
    proxy: {
      '/clients': { target: 'http://localhost:3000', changeOrigin: true, secure: false },
      '/auth': { target: 'http://localhost:3000', changeOrigin: true, secure: false },
      '/subscriptions': { target: 'http://localhost:3000', changeOrigin: true, secure: false },
      '/communications': { target: 'http://localhost:3000', changeOrigin: true, secure: false },
      '/automation': { target: 'http://localhost:3000', changeOrigin: true, secure: false }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'react-hot-toast'],
  }
})
