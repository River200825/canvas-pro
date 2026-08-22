import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import unocss from 'unocss/vite'
import path from 'path'

export default defineConfig({
  base: '/canvas-pro/',
  plugins: [
    vue(),
    unocss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('vue') || id.includes('pinia') || id.includes('vue-router')) return 'vendor-vue'
            if (id.includes('@dnd-kit')) return 'vendor-dnd'
            if (id.includes('html-to-image') || id.includes('pdf-lib') || id.includes('file-saver')) return 'vendor-export'
            if (id.includes('lucide-vue-next')) return 'vendor-icons'
            return 'vendor'
          }
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
})