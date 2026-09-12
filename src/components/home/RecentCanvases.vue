<template>
  <section v-if="recentCanvases.length > 0" class="px-4 pb-16">
    <div class="max-w-6xl mx-auto">
      <h2 class="text-2xl font-bold text-text mb-6">最近画布</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          v-for="canvas in recentCanvases"
          :key="canvas.id"
          class="card p-4 text-left hover:shadow-lg transition-shadow group"
          @click="$emit('open', canvas.id)"
        >
          <div class="flex items-start justify-between gap-2 mb-2">
            <h3 class="font-semibold text-text truncate group-hover:text-primary-600 transition-colors">
              {{ canvas.name }}
            </h3>
            <span class="text-xs px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 shrink-0">
              {{ templateName(canvas.templateId) }}
            </span>
          </div>
          <p class="text-xs text-text-muted">
            {{ canvas.notes.length }} 张便利贴 · 更新于 {{ formatTime(canvas.updatedAt) }}
          </p>
        </button>
      </div>
    </div>
  </section>

  <section v-else class="px-4 pb-16">
    <div class="max-w-6xl mx-auto card p-10 text-center border-dashed">
      <LayoutTemplate class="w-12 h-12 mx-auto text-text-muted mb-4" />
      <p class="text-text-muted mb-1">还没有画布</p>
      <p class="text-sm text-text-muted">从上方模板选择一个开始你的第一张商业画布</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { LayoutTemplate } from 'lucide-vue-next'
import { useCanvasStore } from '@/stores'
import { getTemplateById } from '@/templates'

defineEmits<{
  (e: 'open', canvasId: string): void
}>()

const canvasStore = useCanvasStore()

const recentCanvases = computed(() =>
  canvasStore.canvases
    .slice()
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 6)
)

function templateName(id: string): string {
  return getTemplateById(id).name
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())}`
}
</script>
