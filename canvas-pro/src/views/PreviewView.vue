<template>
  <div v-if="!canvasData" class="min-h-screen bg-canvas-bg flex items-center justify-center p-4">
    <div class="text-center">
      <AlertCircle class="h-12 w-12 mx-auto text-text-muted mb-4" />
      <p class="text-text-muted text-lg mb-2">无效的分享链接</p>
      <p class="text-sm text-text-muted mb-6">请检查链接是否完整，或从首页创建新画布</p>
      <button class="btn-primary" @click="router.push('/')">返回首页</button>
    </div>
  </div>

  <div v-else class="h-screen w-screen overflow-hidden bg-canvas-bg flex flex-col">
    <header
      v-if="!isFullscreen"
      class="bg-white dark:bg-gray-900 border-b border-canvas-border px-4 py-2.5 flex items-center gap-3 shrink-0"
      data-export-ignore
    >
      <span class="text-base font-bold text-text">CanvasPro</span>
      <span class="text-sm text-text-muted truncate flex-1">{{ canvasData.name }}</span>
      <span class="px-2 py-0.5 text-xs font-medium rounded bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 shrink-0">
        只读
      </span>
      <button
        class="btn-icon text-text-muted hover:text-text"
        aria-label="全屏预览"
        title="全屏预览"
        @click="isFullscreen = true"
      >
        <Maximize2 class="h-5 w-5" />
      </button>
      <button class="btn-primary !py-1.5 gap-1.5 shrink-0" @click="openEditor">
        <Edit class="w-4 h-4" /> 编辑副本
      </button>
    </header>

    <button
      v-if="isFullscreen"
      class="fixed top-3 right-3 z-50 btn-secondary !py-1.5 text-sm"
      aria-label="退出全屏"
      @click="isFullscreen = false"
    >
      退出全屏
    </button>

    <main
      ref="mainRef"
      class="flex-1 overflow-hidden relative"
      data-canvas-area
      :class="isPanning ? 'cursor-grabbing select-none' : 'cursor-default'"
      @pointerdown="handlePointerDown"
      @pointermove="handlePointerMove"
      @pointerup="handlePointerUp"
      @pointerleave="handlePointerUp"
      @dblclick="resetViewport"
    >
      <div
        class="absolute top-0 left-0 p-6"
        :style="{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`,
          transformOrigin: '0 0',
          width: '100%',
        }"
      >
        <div
          class="grid gap-4"
          :style="{ gridTemplateColumns: 'repeat(3, minmax(240px, 1fr))', maxWidth: '1200px', margin: '0 auto' }"
        >
          <div
            v-for="block in blocks"
            :key="block.id"
            class="flex flex-col min-h-[180px] rounded-xl border border-canvas-border shadow-block overflow-hidden"
            :style="{ borderTopColor: block.color || '#e2e8f0', borderTopWidth: '3px' }"
          >
            <div
              class="flex items-center gap-2 px-3 py-2 border-b border-canvas-border"
              :style="{ backgroundColor: (block.color || '#e2e8f0') + '33' }"
            >
              <h3 class="font-semibold text-sm flex-1 truncate" :style="{ color: block.color || 'inherit' }">
                {{ block.title }}
              </h3>
              <span class="px-2 py-0.5 text-xs font-medium rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300">
                {{ (notesByBlock.get(block.id) ?? []).length }}
              </span>
            </div>

            <div class="flex-1 p-2 space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
              <div
                v-for="note in notesByBlock.get(block.id) ?? []"
                :key="note.id"
                class="rounded-lg shadow-sm p-2.5 pl-3.5 relative overflow-hidden"
                :style="{ backgroundColor: getNoteColor(note.color).bg }"
              >
                <p v-if="note.title" class="font-semibold text-sm text-gray-800 truncate">{{ note.title }}</p>
                <p v-if="note.content" class="text-xs text-gray-700 whitespace-pre-wrap break-words mt-1">
                  {{ note.content }}
                </p>
                <p v-if="!note.title && !note.content" class="text-xs text-gray-400 italic">空便利贴</p>
              </div>

              <p v-if="(notesByBlock.get(block.id) ?? []).length === 0" class="text-xs text-gray-400 italic p-3 text-center">
                暂无内容
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        class="fixed bottom-4 right-4 z-40 flex items-center gap-1 card shadow-lg px-1.5 py-1"
        data-export-ignore
      >
        <button class="btn-icon-sm text-text-muted hover:text-text" aria-label="缩小" title="缩小 (Ctrl+-)" @click="zoomOut">
          <Minus class="w-4 h-4" />
        </button>
        <span class="text-xs text-text-muted w-10 text-center tabular-nums">{{ zoomPercent }}%</span>
        <button class="btn-icon-sm text-text-muted hover:text-text" aria-label="放大" title="放大 (Ctrl++)" @click="zoomIn">
          <Plus class="w-4 h-4" />
        </button>
        <button class="btn-icon-sm text-text-muted hover:text-text" aria-label="重置视图" title="重置视图 (双击空白)" @click="resetViewport">
          <RotateCcw class="w-3.5 h-3.5" />
        </button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AlertCircle, Edit, Maximize2, Minus, Plus, RotateCcw } from 'lucide-vue-next'
import { useCanvasStore } from '@/stores'
import { getTemplateById } from '@/templates'
import { getNoteColor, type StickyNote } from '@/types/note'
import type { CanvasInstance } from '@/types'

const route = useRoute()
const router = useRouter()
const canvasStore = useCanvasStore()

const canvasData = ref<CanvasInstance | null>(null)
const isFullscreen = ref(false)

const mainRef = ref<HTMLElement | null>(null)
const viewport = ref({ x: 0, y: 0, scale: 1 })
const isPanning = ref(false)
const panStart = ref({ x: 0, y: 0 })
const viewportStart = ref({ x: 0, y: 0 })

const MIN_SCALE = 0.25
const MAX_SCALE = 3

const zoomPercent = computed(() => Math.round(viewport.value.scale * 100))

onMounted(() => {
  let raw = route.query.data as string | undefined
  if (!raw) {
    const match = window.location.hash.match(/\?data=([^&]+)/)
    if (match) raw = match[1]
  }
  if (!raw) return

  try {
    // 编码顺序: JSON.stringify → encodeURIComponent → btoa；解码反之
    const json = decodeURIComponent(atob(raw))
    const parsed = JSON.parse(json) as CanvasInstance
    if (parsed && typeof parsed.id === 'string' && Array.isArray(parsed.notes)) {
      canvasData.value = parsed
    }
  } catch (e) {
    console.error('Failed to parse shared canvas:', e)
  }

  mainRef.value?.addEventListener('wheel', handleWheel, { passive: false })
})

onUnmounted(() => {
  mainRef.value?.removeEventListener('wheel', handleWheel)
})

function clampScale(scale: number): number {
  return Math.min(Math.max(scale, MIN_SCALE), MAX_SCALE)
}

function handleWheel(event: WheelEvent): void {
  if (!event.ctrlKey && !event.metaKey) return
  event.preventDefault()
  const el = mainRef.value
  if (!el) return

  const vp = viewport.value
  const factor = event.deltaY > 0 ? 0.9 : 1.1
  const newScale = clampScale(vp.scale * factor)
  if (newScale === vp.scale) return

  const rect = el.getBoundingClientRect()
  const cx = event.clientX - rect.left
  const cy = event.clientY - rect.top
  const ratio = newScale / vp.scale
  viewport.value = {
    scale: newScale,
    x: cx - (cx - vp.x) * ratio,
    y: cy - (cy - vp.y) * ratio,
  }
}

function zoomIn(): void {
  viewport.value.scale = clampScale(viewport.value.scale * 1.2)
}

function zoomOut(): void {
  viewport.value.scale = clampScale(viewport.value.scale / 1.2)
}

function resetViewport(): void {
  viewport.value = { x: 0, y: 0, scale: 1 }
}

function handlePointerDown(event: PointerEvent): void {
  if (event.button !== 0) return
  const target = event.target as HTMLElement
  if (target.closest('button, a, input, textarea')) return
  isPanning.value = true
  panStart.value = { x: event.clientX, y: event.clientY }
  viewportStart.value = { x: viewport.value.x, y: viewport.value.y }
}

function handlePointerMove(event: PointerEvent): void {
  if (!isPanning.value) return
  viewport.value.x = viewportStart.value.x + (event.clientX - panStart.value.x)
  viewport.value.y = viewportStart.value.y + (event.clientY - panStart.value.y)
}

function handlePointerUp(): void {
  isPanning.value = false
}

const blocks = computed(() => {
  if (!canvasData.value) return []
  const template = getTemplateById(canvasData.value.templateId)
  return template.blocks.slice().sort((a, b) => a.order - b.order)
})

const notesByBlock = computed(() => {
  const map = new Map<string, StickyNote[]>()
  for (const note of canvasData.value?.notes ?? []) {
    const key = note.blockId ?? '_free'
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(note)
  }
  map.forEach(notes => notes.sort((a, b) => a.order - b.order))
  return map
})

function openEditor(): void {
  if (!canvasData.value) return
  try {
    const canvas = canvasStore.importCanvas(JSON.stringify(canvasData.value))
    router.push(`/canvas/${canvas.id}`)
  } catch {
    alert('导入失败，数据格式不正确')
  }
}
</script>
