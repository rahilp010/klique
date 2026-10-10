import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    proxy: {
      '/api/nara': {
        target: 'https://router.bynara.id',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/nara/, '')
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Core React runtime — tiny, cached forever
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/scheduler/')) {
            return 'react-core';
          }
          // React Router
          if (id.includes('node_modules/react-router') || id.includes('node_modules/router')) {
            return 'react-router';
          }
          // Motion / animation
          if (id.includes('node_modules/framer-motion') || id.includes('node_modules/motion')) {
            return 'motion';
          }
          // Lucide icons — shared across all chunks
          if (id.includes('node_modules/lucide-react')) {
            return 'lucide';
          }
          // Large datasets are also dynamically imported by their tool pages.
          // Keep them in dedicated chunks so they are not merged into shared UI code.
          if (id.includes('emoji-datasource')) {
            return 'emoji-data';
          }
          if (id.includes('city-timezones')) {
            return 'city-timezones';
          }
          // Country flag
          if (id.includes('react-country-flag')) {
            return 'country-flag';
          }
        }
      }
    }
  }
})



