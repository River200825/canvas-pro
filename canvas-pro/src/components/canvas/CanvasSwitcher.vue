<template>
  <div ref="rootRef" class="relative">
    <button
      class="btn-secondary !py-1.5 flex items-center gap-2 min-w-[160px] max-w-[280px]"
      aria-label="切换画布"
      @click.stop="open = !open"
    >
      <span class="truncate flex-1 text-left">{{ canvasStore.currentCanvas?.name ?? '无画布' }}</span>
      <ChevronDown class="h-4 w-4 shrink-0 transition-transform" :class="{ 'rotate-180': open }" />
    </button>

    <div
      v-if="open"
      class="absolute left-0 top-full mt-1 min-w-[240px] max-h-80 overflow-y-auto card shadow-xl p-1 z-50 custom-scrollbar"
    >
      <button
        class="w-full flex items-center gap-2 px-3 py-2 text-sm text-text hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
        @click.stop="handleNew"
      >
        <FilePlus class="h-4 w-4" /> 新建画布
      </button>
      <button
        class="w-full flex items-center gap-2 px-3 py-2 text-sm text-text hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
        @click.stop="triggerImport"
      >
        <Upload class="h-4 w-4" /> 导入 JSON
      </button>
      <input
        ref="fileInputRef"
        type="file"
        accept=".json,application/json"
        class="hidden"
        @change="handleImportFile"
      />
      <hr class="my-1 border-canvas-border" />

      <div v-for="canvas in canvasStore.canvases" :key="canvas.id" class="group/item relative">
        <template v-if="renamingId === canvas.id">
          <input
            v-model="renameDraft"
            class="input !py-1.5 mx-1 my-0.5 !w-[calc(100%-8px)]"
            autofocus
            @click.stop
            @keydown.enter.prevent="commitRename(canvas.id)"
            @keydown.esc="renamingId = null"
            @blur="commitRename(canvas.id)"
          />
        </template>
        <template v-else>
          <button
            class="w-full text-left px-3 py-2 pr-16 text-sm rounded-lg transition-colors truncate"
            :class="
              canvas.id === canvasStore.currentCanvasId
                ? 'bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 font-medium'
                : 'text-text hover:bg-gray-100 dark:hover:bg-gray-800'
            "
            @click.stop="switchTo(canvas.id)"
          >
            {{ canvas.name }}
          </button>
          <div
            class="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover/item:flex items-center gap-0.5"
          >
            <button
              class="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-text-muted"
              aria-label="重命名画布"
              title="重命名"
              @click.stop="startRename(canvas)"
            >
              <Pencil class="h-3.5 w-3.5" />
            </button>
            <button
              class="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-text-muted"
              aria-label="复制画布"
              title="复制"
              @click.stop="duplicate(canvas.id)"
            >
              <Copy class="h-3.5 w-3.5" />
            </button>
            <button
              class="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-text-muted hover:text-red-500 disabled:opacity-30 disabled:pointer-events-none"
              :disabled="canvasStore.canvases.length <= 1"
              aria-label="删除画布"
              title="删除"
              @click.stop="remove(canvas.id)"
            >
              <Trash2 class="h-3.5 w-3.5" />
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { Copy, FilePlus, Pencil, Trash2, Upload } from 'lucide-vue-next'
import { useCanvasStore } from '@/stores'
import type { CanvasInstance } from '@/types'

const canvasStore = useCanvasStore()

const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const renamingId = ref<string | null>(null)
const renameDraft = ref('')

function closeMenus(event: MouseEvent): void {
  if (rootRef.value && !rootRef.value.contains(event.target as Node)) {
    open.value = false
    renamingId.value = null
  }
}

onMounted(() => document.addEventListener('click', closeMenus))
onUnmounted(() => document.removeEventListener('click', closeMenus))

function handleNew(): void {
  canvasStore.createCanvas()
  open.value = false
}

function switchTo(id: string): void {
  if (renamingId.value === id) return
  canvasStore.switchCanvas(id)
  open.value = false
}

function startRename(canvas: CanvasInstance): void {
  renamingId.value = canvas.id
  renameDraft.value = canvas.name
}

function commitRename(id: string): void {
  const name = renameDraft.value.trim()
  if (name) canvasStore.renameCanvas(id, name)
  renamingId.value = null
}

function duplicate(id: string): void {
  canvasStore.duplicateCanvas(id)
}

function remove(id: string): void {
  if (canvasStore.canvases.length > 1) {
    canvasStore.deleteCanvas(id)
  }
}

function triggerImport(): void {
  fileInputRef.value?.click()
}

function handleImportFile(event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    try {
      const canvas = canvasStore.importCanvas(String(reader.result))
      canvas.name = canvas.name.replace(' (导入)', '') || file.name.replace(/\.json$/i, '')
      canvasStore.renameCanvas(canvas.id, canvas.name)
      open.value = false
    } catch {
      alert('导入失败：JSON 格式不正确或缺少必要字段')
    }
  }
  reader.readAsText(file)
  input.value = ''
}
</script>
