<template>
  <div class="min-h-screen bg-canvas-bg">
    <header class="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-canvas-border" data-export-ignore>
      <div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <svg class="w-7 h-7" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <rect width="32" height="32" rx="6" fill="#0ea5e9" />
            <path d="M8 10h16M8 16h12M8 22h8" stroke="white" stroke-width="2.5" stroke-linecap="round" />
          </svg>
          <span class="text-lg font-bold text-text">CanvasPro</span>
        </div>
        <nav class="flex items-center gap-1">
          <button class="btn-ghost text-sm" @click="router.push('/guide')">教程</button>
          <button class="btn-ghost text-sm" @click="router.push('/examples')">案例库</button>
        </nav>
      </div>
    </header>

    <HeroSection @create="createCanvas()" @guide="router.push('/guide')" />
    <TemplateGallery @select="(id: string) => createCanvas(id)" />
    <RecentCanvases @open="(id: string) => router.push(`/canvas/${id}`)" />
    <FeatureHighlights />

    <footer class="border-t border-canvas-border py-6 text-center text-sm text-text-muted">
      CanvasPro — 专业级个人商业画布工具
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useCanvasStore } from '@/stores'
import { getTemplateById } from '@/templates'
import HeroSection from '@/components/home/HeroSection.vue'
import TemplateGallery from '@/components/home/TemplateGallery.vue'
import RecentCanvases from '@/components/home/RecentCanvases.vue'
import FeatureHighlights from '@/components/home/FeatureHighlights.vue'

const router = useRouter()
const canvasStore = useCanvasStore()

function createCanvas(templateId?: string): void {
  canvasStore.setTemplate(templateId ? getTemplateById(templateId) : getTemplateById('business-model-canvas'))
  router.push({ path: '/canvas/new', query: templateId ? { template: templateId } : {} })
}
</script>
