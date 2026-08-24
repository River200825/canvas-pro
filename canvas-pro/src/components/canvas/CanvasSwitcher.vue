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
    <ConfirmDialog
      v-if="confirmDelete"
      danger
      title="删除画布"
      :message="`将永久删除「${canvasStore.currentCanvas?.name}」及其 ${canvasStore.currentCanvas?.notes.length ?? 0} 张便利贴，此操作无法撤销。`"
      confirm-text="删除"
      @confirm="confirmDeleteCanvas"
      @cancel="confirmDelete = false"
    />

    <ConfirmDialog
      v-if="importPreview"
      title="导入画布"
      :message="`将导入「${importPreview.name}」：${importPreview.notes} 张便利贴、${importPreview.blocks} 个区块。\n导入后会创建为新画布，不影响现有画布。`"
      confirm-text="导入"
      @confirm="confirmImport"
      @cancel="importPreview = null"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { Copy, FilePlus, Pencil, Trash2, Upload } from 'lucide-vue-next'
import { useCanvasStore } from '@/stores'
import { useToast } from '@/composables/useToast'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import type { CanvasInstance } from '@/types'

const canvasStore = useCanvasStore()
const toast = useToast()

const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const renamingId = ref<string | null>(null)
const renameDraft = ref('')
const confirmDelete = ref(false)
const importPreview = ref<{ name: string; notes: number; blocks: number; json: string } | null>(null)

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
  if (canvasStore.canvases.length <= 1) return
  confirmDelete.value = true
}

function confirmDeleteCanvas(): void {
  const id = canvasStore.currentCanvasId
  confirmDelete.value = false
  if (id && canvasStore.canvases.length > 1) {
    canvasStore.deleteCanvas(id)
    toast.info('画布已删除')
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
      const parsed = JSON.parse(String(reader.result)) as Partial<CanvasInstance>
      if (!parsed || !Array.isArray(parsed.notes) || !Array.isArray(parsed.blocks)) {
        throw new Error('INVALID')
      }
      importPreview.value = {
        name: parsed.name || file.name.replace(/\.json$/i, ''),
        notes: parsed.notes.length,
        blocks: parsed.blocks.length,
        json: String(reader.result),
      }
    } catch {
      toast.error('导入失败：JSON 格式不正确或缺少必要字段')
    }
  }
  reader.readAsText(file)
  input.value = ''
}

function confirmImport(): void {
  if (!importPreview.value) return
  try {
    const canvas = canvasStore.importCanvas(importPreview.value.json)
    const name = importPreview.value.name
    if (name && !canvas.name.startsWith(name)) canvasStore.renameCanvas(canvas.id, name)
    toast.success(`已导入「${canvas.name}」`)
    open.value = false
  } catch {
    toast.error('导入失败：数据格式不正确')
  } finally {
    importPreview.value = null
  }
}
</script>
