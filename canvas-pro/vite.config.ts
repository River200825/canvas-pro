import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import unocss from 'unocss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  base: '/canvas-pro/',
  plugins: [
    vue(),
    unocss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons.svg'],
      manifest: {
        name: 'CanvasPro - 个人商业画布',
        short_name: 'CanvasPro',
        description: '专业级个人商业画布工具，1:1 复刻 Canvanizer 体验',
        theme_color: '#0ea5e9',
        background_color: '#f8fafc',
        display: 'standalone',
        start_url: '/canvas-pro/',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallbackDenylist: [],
      },
    }),
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