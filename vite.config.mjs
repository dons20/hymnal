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
