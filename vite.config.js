import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  server: {
    host: '127.0.0.1',
    port: 5173
  },
  build: {
    // Not 'esnext': the CSS minifier then rewrites (max-width: 580px) as
    // (width<=580px), which Safari before 16.4 ignores, so older iPhones got
    // the desktop layout at phone width. Safari 14 = iPhone 6s/7/8 era.
    target: ['es2020', 'safari14', 'chrome87', 'firefox78', 'edge88'],
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) {
            return 'three-vendor';
          }
        }
      }
    }
  }
})
