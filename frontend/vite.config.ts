import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  server: {
    port: 3000,
    strictPort: true,
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png', 'og-image.png'],
      manifest: {
        name: 'Vikni.me – Намери специалист',
        short_name: 'Vikni.me',
        description: 'Платформа за услуги – намери или предложи услуга',
        theme_color: '#1B2A5E',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          { src: '/icons/pwa-64x64.png',    sizes: '64x64',   type: 'image/png' },
          { src: '/icons/pwa-96x96.png',    sizes: '96x96',   type: 'image/png' },
          { src: '/icons/pwa-128x128.png',  sizes: '128x128', type: 'image/png' },
          { src: '/icons/pwa-192x192.png',  sizes: '192x192', type: 'image/png' },
          { src: '/icons/pwa-384x384.png',  sizes: '384x384', type: 'image/png' },
          { src: '/icons/pwa-512x512.png',  sizes: '512x512', type: 'image/png' },
          { src: '/icons/maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          {
            name: 'Търси услуга',
            short_name: 'Търсене',
            description: 'Намери услуга или специалист',
            url: '/search',
            icons: [{ src: '/icons/pwa-96x96.png', sizes: '96x96' }],
          },
          {
            name: 'Моите резервации',
            short_name: 'Резервации',
            description: 'Преглед на резервации',
            url: '/bookings',
            icons: [{ src: '/icons/pwa-96x96.png', sizes: '96x96' }],
          },
          {
            name: 'Съобщения',
            short_name: 'Чат',
            description: 'Отвори съобщенията',
            url: '/chat',
            icons: [{ src: '/icons/pwa-96x96.png', sizes: '96x96' }],
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api',
              expiration: { maxEntries: 50, maxAgeSeconds: 5 * 60 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-stylesheets' },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 },
            },
          },
          // Unsplash images (mock service photos)
          {
            urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'unsplash-images',
              expiration: { maxEntries: 100, maxAgeSeconds: 7 * 24 * 60 * 60 },
            },
          },
          // DiceBear avatars
          {
            urlPattern: /^https:\/\/api\.dicebear\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'dicebear-avatars',
              expiration: { maxEntries: 50, maxAgeSeconds: 7 * 24 * 60 * 60 },
            },
          },
        ],
      },
      devOptions: { enabled: true },
    }),
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react-router')) return 'react-vendor'
            if (id.includes('@supabase')) return 'supabase'
            if (id.includes('@tanstack')) return 'query'
            if (id.includes('framer-motion')) return 'motion'
            if (id.includes('react-hook-form') || id.includes('zod') || id.includes('@hookform')) return 'forms'
          }
        },
      },
    },
  },
})
