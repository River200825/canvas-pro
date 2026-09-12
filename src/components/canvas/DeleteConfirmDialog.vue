<template>
  <Teleport to="body">
    <div
      v-if="showConfirm"
      class="fixed inset-0 z-[180] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      @click.self="closeConfirm"
    >
      <div class="w-full max-w-md card animate-scale-in overflow-hidden" role="dialog" aria-label="确认删除">
        <div class="flex items-center justify-between px-5 py-4 border-b border-canvas-border">
          <h2 class="text-lg font-semibold text-text flex items-center gap-2">
            <AlertTriangle class="h-5 w-5 text-amber-500" /> 确认删除
        </h2>
        <button class="btn-icon text-text-muted hover:text-text" aria-label="关闭" @click="closeConfirm">
          <X class="h-5 w-5" />
        </button>
      </div>

      <div class="p-5 space-y-4">
        <p class="text-sm text-text-muted leading-relaxed">
          确定要删除选中的 {{ selectedCount }} 张便利贴吗？此操作可通过 <kbd class="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono mr-1">Ctrl</kbd>+<kbd class="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono ml-1">Z</kbd> 撤销。
        </p>

        <label class="flex items-center gap-2 text-sm text-text-muted cursor-pointer">
          <input
            type="checkbox"
            v-model="dontShowAgain"
            class="w-4 h-4 rounded border-canvas-border text-primary-600 focus:ring-2 focus:ring-primary-500"
          />
          <span class="text-text-muted">不再提示</span>
        </div>

        <p v-if="hasLockedNotes" class="text-xs text-amber-500 flex items-center gap-1">
          <AlertTriangle class="w-3.5 h-3.5" />
          <span>选中项中包含已锁定的便利贴，它们将不会被删除</span>
        </div>
      </div>

      <div class="flex justify-end gap-2 px-5 py-4 border-t border-canvas-border bg-gray-50 dark:bg-gray-800/50">
        <button class="btn-secondary" @click="closeConfirm">取消</button>
        <button class="btn-primary gap-2 min-w-[110px]" :disabled="deleting" @click="confirmDelete">
          <Loader2 v-if="deleting" class="h-4 w-4 animate-spin" />
          {{ deleting ? '删除中...' : '确定删除' }}
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCanvasStore } from '@/stores'
import { AlertTriangle, Loader2, X } from 'lucide-vue-next'

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const props = defineProps<{
  selectedCount: number
  hasLockedNotes: boolean
}>

const canvasStore = useCanvasStore()

const showConfirm = ref(false)
const deleting = ref(false)
const dontShowAgain = ref(false)

const STORAGE_KEY = 'canvas-pro:delete-confirm-dismissed'

const hasLockedNotes = computed(() => {
  // This will be passed as prop
  return false // Will be overridden by prop
})

function show(): void {
  const dismissed = localStorage.getItem('canvas-pro:delete-confirm-dismissed')
  if (dismissed) {
    emit('confirm')
    return
  }
  showConfirm.value = true
}

function closeConfirm(): void {
  showConfirm.value = false
  emit('cancel')
}

function close(): void {
  showConfirm.value = false
  emit('cancel')
}

async function confirmDelete(): Promise<void> {
  deleting.value = true
  try {
    // The actual deletion will be handled by parent
    // We just emit confirm and let parent handle the deletion
    if (dontShowAgain.value) {
      localStorage.setItem(STORAGE_KEY, 'true')
    }
    // The parent will handle the actual deletion via emitted event
    // We just close the dialog
    showConfirm.value = false
  } finally {
    deleting.value = false
  }
}

// Expose show method to parent
defineExpose({
  show,
  close: closeConfirm
})

defineProps<{
  selectedCount: number
  hasLockedNotes: boolean
}>()

defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()
</script>