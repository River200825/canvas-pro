import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import unocss from 'unocss/vite'
import path from 'path'

export default defineConfig({
  plugins: [vue(), unocss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'happy-dom',
    globals: false,
    include: ['src/**/*.{spec,test}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/stores/**', 'src/composables/**', 'src/templates/**', 'src/utils/**'],
      exclude: ['src/**/*.d.ts', 'src/**/index.ts'],
    },
  },
})
