<template>
  <Transition name="bar">
    <div
      v-if="visible"
      class="fixed bottom-16 left-1/2 -translate-x-1/2 z-[120] card shadow-2xl px-3 py-2 flex items-center gap-1.5 animate-slide-up"
      :style="{ marginBottom: 'env(safe-area-inset-bottom)' }"
      role="toolbar"
      aria-label="批量操作"
    >
      <span class="text-sm font-medium text-text px-1.5 whitespace-nowrap">
        已选 {{ canvasStore.selectedIds.length }} 张
      </span>

      <div class="w-px h-5 bg-canvas-border mx-0.5" />

      <!-- 批量改色 -->
      <div class="relative">
        <button
          class="btn-icon-sm text-text-muted hover:text-text"
          :class="{ 'text-primary-600': colorOpen }"
          aria-label="批量更改颜色"
          title="更改颜色"
          @click.stop="colorOpen = !colorOpen"
        >
          <Palette class="h-4 w-4" />
        </button>
        <div
          v-if="colorOpen"
          class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-canvas-border p-2 flex gap-1"
          @click.stop
        >
          <button
            v-for="c in NOTE_COLORS"
            :key="c.id"
            class="w-6 h-6 rounded-lg border-2 transition-all hover:scale-110"
            :style="{ backgroundColor: c.bg, borderColor: c.border }"
            :aria-label="c.id"
            :title="c.id"
            @click="applyColor(c.id)"
          />
        </div>
      </div>

      <!-- 批量移动到区块 -->
      <div class="relative">
        <button
          class="btn-icon-sm text-text-muted hover:text-text"
          :class="{ 'text-primary-600': moveOpen }"
          aria-label="移动到区块"
          title="移动到区块"
          @click.stop="moveOpen = !moveOpen"
        >
          <FolderInput class="h-4 w-4" />
        </button>
        <div
          v-if="moveOpen"
          class="absolute bottom-full mb-2 right-0 min-w-[160px] max-h-56 overflow-y-auto card shadow-xl p-1 custom-scrollbar"
          @click.stop
        >
          <button
            v-for="block in blocks"
            :key="block.id"
            class="dropdown-item w-full !py-1.5"
            @click="applyMove(block.id)"
          >
            {{ block.title }}
          </button>
        </div>
      </div>

      <button
        class="btn-icon-sm text-text-muted hover:text-text"
        aria-label="批量复制"
        title="复制"
        @click="applyDuplicate"
      >
        <Copy class="h-4 w-4" />
      </button>

      <div class="w-px h-5 bg-canvas-border mx-0.5" />

      <button
        class="btn-icon-sm text-text-muted hover:text-red-500"
        aria-label="批量删除"
        title="删除"
        @click="applyDelete"
      >
        <Trash2 class="h-4 w-4" />
      </button>

      <button class="btn-ghost !px-2 !py-1 text-xs text-text-muted" @click="clear">取消</button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Copy, FolderInput, Palette, Trash2 } from 'lucide-vue-next'
import { useCanvasStore } from '@/stores'
import { useUIStore } from '@/stores/ui'
import { useToast } from '@/composables/useToast'
import { NOTE_COLORS, type NoteColorId } from '@/types/note'

const canvasStore = useCanvasStore()
const uiStore = useUIStore()
const toast = useToast()

const colorOpen = ref(false)
const moveOpen = ref(false)

const visible = computed(
  () => !uiStore.presentationMode && canvasStore.selectedIds.length > 1
)

const blocks = computed(() => {
  const t = canvasStore.currentTemplate
  return t ? t.blocks.slice().sort((a, b) => a.order - b.order) : []
})

function closePopovers(): void {
  colorOpen.value = false
  moveOpen.value = false
}

function applyColor(color: NoteColorId): void {
  canvasStore.colorNotes([...canvasStore.selectedIds], color)
  closePopovers()
}

function applyMove(blockId: string): void {
  const count = canvasStore.selectedIds.length
  canvasStore.moveNotesToBlock([...canvasStore.selectedIds], blockId)
  const blockTitle = blocks.value.find(b => b.id === blockId)?.title ?? ''
  toast.success(`已移动 ${count} 张到「${blockTitle}」`)
  closePopovers()
  canvasStore.selectNote(null)
}

function applyDuplicate(): void {
  const count = canvasStore.duplicateNotes([...canvasStore.selectedIds])
  toast.success(`已复制 ${count} 张`)
  closePopovers()
  canvasStore.selectNote(null)
}

function applyDelete(): void {
  const count = canvasStore.selectedIds.length
  canvasStore.deleteNotes([...canvasStore.selectedIds])
  toast.success(`已删除 ${count} 张（Ctrl+Z 可撤销）`)
  closePopovers()
}

function clear(): void {
  canvasStore.selectNote(null)
  closePopovers()
}

function onGlobalClick(): void {
  closePopovers()
}

onMounted(() => window.addEventListener('click', onGlobalClick))
onUnmounted(() => window.removeEventListener('click', onGlobalClick))
</script>

<style scoped>
.bar-enter-active,
.bar-leave-active {
  transition: all 180ms ease-out;
}
.bar-enter-from,
.bar-leave-to {
  opacity: 0;
  transform: translate(-50%, 12px);
}
</style>
