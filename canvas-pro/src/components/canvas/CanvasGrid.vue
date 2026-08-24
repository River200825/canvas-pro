<template>
  <div
    ref="containerRef"
    class="relative h-full w-full overflow-hidden bg-canvas-bg"
    :class="isPanning ? 'cursor-grabbing select-none' : spaceHeld ? 'cursor-grab' : 'cursor-default'"
    @pointerdown="handlePointerDown"
    @pointermove="handlePointerMove"
    @pointerup="handlePointerUp"
    @pointerleave="handlePointerUp"
    @dblclick="handleDoubleClick"
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
        class="tpl-grid"
        :style="gridStyle ?? { gridTemplateColumns: 'repeat(3, minmax(240px, 1fr))', maxWidth: '1200px', margin: '0 auto', display: 'grid', gap: '1rem' }"
        role="list"
        aria-label="画布区块"
      >
        <CanvasBlock
          v-for="block in blocks"
          :key="block.id"
          :block="block"
          :notes="notesByBlock.get(block.id) ?? []"
          :presentation-mode="presentationMode"
          @add-note="addNote"
          @note-moved="handleNoteMoved"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import CanvasBlock from './CanvasBlock.vue'
import type { NoteMovedPayload } from './CanvasBlock.vue'
import { useCanvasStore } from '@/stores'
import { getGridStyle } from '@/templates/layout'
import type { StickyNote } from '@/types/note'

defineProps<{
  presentationMode?: boolean
}>()

const canvasStore = useCanvasStore()

const containerRef = ref<HTMLElement | null>(null)
const isPanning = ref(false)
const spaceHeld = ref(false)
const panStart = ref({ x: 0, y: 0 })
const viewportStart = ref({ x: 0, y: 0 })

const viewport = computed(() => canvasStore.currentCanvas?.viewport ?? { x: 0, y: 0, scale: 1 })

const blocks = computed(() => {
  const t = canvasStore.currentTemplate
  if (!t?.blocks) return []
  return t.blocks.slice().sort((a, b) => a.order - b.order)
})

const gridStyle = computed(() => {
  const t = canvasStore.currentTemplate
  return t ? getGridStyle(t) : null
})

const notesByBlock = computed(() => {
  const map = new Map<string, StickyNote[]>()
  const canvas = canvasStore.currentCanvas
  if (canvas) {
    for (const note of canvas.notes) {
      const key = note.blockId ?? '_free'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(note)
    }
    map.forEach(notes => notes.sort((a, b) => a.order - b.order))
  }
  return map
})

function handleWheel(event: WheelEvent): void {
  if (event.ctrlKey || event.metaKey) {
    event.preventDefault()
    const vp = canvasStore.currentCanvas?.viewport
    if (!vp || !containerRef.value) return

    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1
    const newScale = Math.min(Math.max(vp.scale * zoomFactor, 0.25), 3)
    if (newScale === vp.scale) return

    // 以鼠标位置为中心缩放：保持光标下的画布点不动
    const rect = containerRef.value.getBoundingClientRect()
    const cx = event.clientX - rect.left
    const cy = event.clientY - rect.top
    const ratio = newScale / vp.scale
    canvasStore.setViewport({
      scale: newScale,
      x: cx - (cx - vp.x) * ratio,
      y: cy - (cy - vp.y) * ratio,
    })
  }
}

function handlePointerDown(event: PointerEvent): void {
  if (event.button !== 0) return
  const target = event.target as HTMLElement
  const onInteractive = !!target.closest('.sticky-note, button, input, textarea, [contenteditable]')

  if (!spaceHeld.value) {
    if (onInteractive) return
    canvasStore.selectNote(null)
  }

  isPanning.value = true
  panStart.value = { x: event.clientX, y: event.clientY }
  const vp = canvasStore.currentCanvas?.viewport
  viewportStart.value = vp ? { x: vp.x, y: vp.y } : { x: 0, y: 0 }
}

function handlePointerMove(event: PointerEvent): void {
  if (!isPanning.value) return
  canvasStore.setViewport({
    x: viewportStart.value.x + (event.clientX - panStart.value.x),
    y: viewportStart.value.y + (event.clientY - panStart.value.y),
  })
}

function handlePointerUp(): void {
  isPanning.value = false
}

function handleDoubleClick(event: MouseEvent): void {
  const target = event.target as HTMLElement
  if (target.closest('.sticky-note, .canvas-block-inner')) return
  canvasStore.setViewport({ x: 0, y: 0, scale: 1 })
}

function addNote(blockId: string): void {
  canvasStore.addNote(blockId)
}

function handleNoteMoved(payload: NoteMovedPayload): void {
  const canvas = canvasStore.currentCanvas
  if (!canvas) return
  const note = canvas.notes.find(n => n.id === payload.noteId)
  if (!note || note.blockId === payload.targetBlockId) return

  const targetCount = canvas.notes.filter(n => n.blockId === payload.targetBlockId).length
  canvasStore.moveNote(payload.noteId, payload.targetBlockId, targetCount)
}

// 空格按住 → 任意位置拖拽平移（输入框内除外）
function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null
  return !!el?.closest?.('input, textarea, [contenteditable]')
}

function handleSpaceKeyDown(event: KeyboardEvent): void {
  if (event.code !== 'Space') return
  if (isTypingTarget(event.target)) return
  event.preventDefault()
  spaceHeld.value = true
}

function handleSpaceKeyUp(event: KeyboardEvent): void {
  if (event.code === 'Space') spaceHeld.value = false
}

onMounted(() => {
  containerRef.value?.addEventListener('wheel', handleWheel, { passive: false })
  window.addEventListener('keydown', handleSpaceKeyDown)
  window.addEventListener('keyup', handleSpaceKeyUp)
})

onUnmounted(() => {
  containerRef.value?.removeEventListener('wheel', handleWheel)
  window.removeEventListener('keydown', handleSpaceKeyDown)
  window.removeEventListener('keyup', handleSpaceKeyUp)
})
</script>

<style scoped>
/* 小屏退化为两列流式布局，忽略传统区域 */
@media (max-width: 899px) {
  .tpl-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    grid-template-areas: none !important;
    grid-template-rows: auto !important;
  }
  .tpl-grid > :deep(*) {
    grid-area: auto !important;
  }
}
</style>
