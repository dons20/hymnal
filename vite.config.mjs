import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
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
        manualChunks: (id) => {
          // React ecosystem - Core React libraries
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-vendor';
          }
          
          // React Router - Routing library
          if (id.includes('node_modules/react-router')) {
            return 'react-router';
          }
          
          // Mantine UI - Main UI framework components
          if (id.includes('node_modules/@mantine/core')) {
            return 'mantine-core';
          }
          
          // Mantine utilities and hooks
          if (id.includes('node_modules/@mantine/hooks') || 
              id.includes('node_modules/@mantine/modals') || 
              id.includes('node_modules/@mantine/notifications')) {
            return 'mantine-utils';
          }
          
          // Icons - Icon libraries (these can be large)
          if (id.includes('node_modules/@tabler/icons-react') || 
              id.includes('node_modules/react-icons')) {
            return 'icons';
          }
          
          // Search and data libraries
          if (id.includes('node_modules/fuse.js') || 
              id.includes('node_modules/localforage')) {
            return 'data-libs';
          }
          
          // UI utilities and helpers
          if (id.includes('node_modules/classnames') || 
              id.includes('node_modules/focus-visible') || 
              id.includes('node_modules/use-debounce') || 
              id.includes('node_modules/react-intersection-observer') || 
              id.includes('node_modules/react-window') ||
              id.includes('node_modules/@dr.pogodin/react-helmet')) {
            return 'ui-utils';
          }
          
          // SCSS/Sass related
          if (id.includes('node_modules/sass') || id.includes('.scss') || id.includes('.css')) {
            return 'styles';
          }
          
          // All other vendor packages
          if (id.includes('node_modules/')) {
            return 'vendor';
          }
        },
      },
    },
  },
});
