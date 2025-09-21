import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  server: {
    // This makes Vite accessible from all network interfaces (WSL-friendly)
    host: true,
  },
  plugins: [
    react(), 
    tsconfigPaths(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,webmanifest}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
        // Only apply runtime caching, skip precaching in development
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30
              }
            }
          },
          {
            urlPattern: /https:\/\/cloud\.umami\.is\/script\.js/,
            handler: 'NetworkOnly'
          }
        ]
      },
      includeAssets: ['favicon.ico', 'launcher-144.png', 'launcher-192.png', 'launcher-512.png'],
      manifest: {
        name: 'Hymns for all Times',
        short_name: 'Hymnal',
        description: 'A Hymnal Web App with offline support for worship and spiritual songs',
        categories: ['music', 'lifestyle', 'productivity'],
        lang: 'en',
        dir: 'ltr',
        orientation: 'any',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#1890ff',
        background_color: '#ffffff',
        prefer_related_applications: false,
        icons: [
          {
            src: 'favicon.ico',
            sizes: '64x64',
            type: 'image/x-icon'
          },
          {
            src: 'launcher-144.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'launcher-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'launcher-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
    })
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.mjs',
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        additionalData: `@use "${path.join(process.cwd(), 'src/_mantine').replace(/\\/g, '/')}" as mantine;`,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // CRITICAL: React core must be first priority to load before anything else
          if (id.includes('react-dom') || id.includes('react/') || id.includes('react\\') || id === 'react') {
            return '01-react-core'; // Use numeric prefix to ensure proper ordering
          }
          
          // Combine all Mantine packages into one chunk to avoid circular dependencies
          if (id.includes('@mantine/core') || id.includes('@mantine/hooks') || 
              id.includes('@mantine/modals') || id.includes('@mantine/notifications')) {
            return '02-mantine-all'; // Single Mantine chunk
          }
          
          // React Router (depends on React)
          if (id.includes('react-router')) {
            return '03-react-router';
          }
          
          // Icons (may depend on React)
          if (id.includes('@tabler/icons-react') || id.includes('react-icons')) {
            return '04-icons';
          }
          
          // Other utilities
          if (id.includes('classnames') || id.includes('focus-visible') || 
              id.includes('use-debounce') || id.includes('react-intersection-observer') ||
              id.includes('react-window') || id.includes('@dr.pogodin/react-helmet')) {
            return '05-utils';
          }
          
          // Data libraries (independent)
          if (id.includes('fuse.js') || id.includes('localforage')) {
            return '06-data-libs';
          }
          
          // Leave everything else in the main bundle
          return undefined;
        }
      },
    },
    chunkSizeWarningLimit: 800,
  },
  // Add resolve configuration to handle potential module resolution issues
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
});
