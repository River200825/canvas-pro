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
          <button
            v-if="latestCanvas"
            class="btn-primary !py-1.5 text-sm gap-1.5 mr-1"
            :title="`继续编辑：${latestCanvas.name}`"
            @click="router.push(`/canvas/${latestCanvas.id}`)"
          >
            <PencilLine class="w-4 h-4" /> 我的画布
          </button>
          <ThemeToggle />
          <button class="btn-ghost text-sm" @click="router.push('/guide')">教程</button>
          <button class="btn-ghost text-sm" @click="router.push('/examples')">案例库</button>
          <template v-if="currentUser">
            <button v-if="currentUser.role === 'admin'" class="btn-ghost text-sm" @click="router.push('/admin')">用户管理</button>
            <span class="text-xs text-text-muted px-1">{{ currentUser.email }}</span>
            <button class="btn-ghost text-sm text-red-500" @click="logout">退出</button>
          </template>
          <button v-else class="btn-ghost text-sm" @click="router.push('/login')">登录</button>
        </nav>
      </div>
    </header>

    <HeroSection @create="createCanvas()" @guide="router.push('/guide')" @examples="router.push('/examples')" />
    <TemplateGallery @select="(id: string) => createCanvas(id)" />
    <RecentCanvases @open="(id: string) => router.push(`/canvas/${id}`)" />
    <FeatureHighlights />

    <footer class="border-t border-canvas-border py-6 text-center text-sm text-text-muted">
      CanvasPro — 专业级个人商业画布工具
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { PencilLine } from 'lucide-vue-next'
import { useCanvasStore } from '@/stores'
import { getTemplateById } from '@/templates'
import ThemeToggle from '@/components/toolbar/ThemeToggle.vue'
import HeroSection from '@/components/home/HeroSection.vue'
import TemplateGallery from '@/components/home/TemplateGallery.vue'
import RecentCanvases from '@/components/home/RecentCanvases.vue'
import FeatureHighlights from '@/components/home/FeatureHighlights.vue'

const router = useRouter()
const canvasStore = useCanvasStore()

const currentUser = ref<{ email: string; role: string } | null>(null)

function readCurrentUser(): void {
  const raw = localStorage.getItem('canvas-pro:currentUser')
  currentUser.value = raw ? JSON.parse(raw) : null
}

onMounted(() => {
  document.title = 'CanvasPro - 把创业想法理成一张清晰的商业模式图'
  readCurrentUser()
})

// 每次路由变化重新读取登录状态
watch(() => router.currentRoute.value.path, () => {
  readCurrentUser()
})

function logout(): void {
  canvasStore.logout()
  localStorage.removeItem('canvas-pro:currentUser')
  currentUser.value = null
  router.push('/login')
}

/** 最近更新的画布，供「我的画布」一键继续 */
const latestCanvas = computed(() => {
  const list = [...canvasStore.canvases].sort((a, b) => b.updatedAt - a.updatedAt)
  return list[0] ?? null
})

function createCanvas(templateId?: string): void {
  canvasStore.setTemplate(templateId ? getTemplateById(templateId) : getTemplateById('business-model-canvas'))
  router.push({ path: '/canvas/new', query: templateId ? { template: templateId } : {} })
}
</script>
