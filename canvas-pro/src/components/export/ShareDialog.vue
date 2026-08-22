<template>
  <div
    class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
    @click.self="$emit('close')"
  >
    <div class="w-full max-w-lg card animate-scale-in overflow-hidden" role="dialog" aria-label="分享画布">
      <div class="flex items-center justify-between px-5 py-4 border-b border-canvas-border">
        <h2 class="text-lg font-semibold text-text flex items-center gap-2">
          <Share2 class="h-5 w-5 text-primary-600" /> 分享画布
        </h2>
        <button class="btn-icon text-text-muted hover:text-text" aria-label="关闭分享对话框" @click="$emit('close')">
          <X class="h-5 w-5" />
        </button>
      </div>

      <div class="p-5 space-y-4">
        <p class="text-sm text-text-muted leading-relaxed">
          链接包含完整画布数据（Base64 编码），任何人打开即可只读预览，并可一键创建可编辑副本。
        </p>

        <div class="flex gap-2">
          <input
            :value="shareLink"
            readonly
            class="input flex-1 !text-xs font-mono"
            aria-label="分享链接"
            @focus="($event.target as HTMLInputElement).select()"
          />
        </div>

        <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
      </div>

      <div class="flex justify-end gap-2 px-5 py-4 border-t border-canvas-border bg-gray-50 dark:bg-gray-800/50">
        <button class="btn-secondary" @click="openInNewTab">新标签打开</button>
        <button class="btn-primary gap-2 min-w-[110px]" @click="copyLink">
          <Check v-if="copied" class="h-4 w-4" /> {{ copied ? '已复制' : '复制链接' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Check, Share2, X } from 'lucide-vue-next'
import { useCanvasStore } from '@/stores'
import { createShareLink } from '@/utils/export'

const emit = defineEmits<{
  (e: 'close'): void
}>()

const canvasStore = useCanvasStore()
const copied = ref(false)
const error = ref('')

const shareLink = computed(() => {
  if (!canvasStore.currentCanvas) return ''
  try {
    return createShareLink(canvasStore.currentCanvas)
  } catch {
    error.value = '生成链接失败：画布数据过大'
    return ''
  }
})

async function copyLink(): Promise<void> {
  if (!shareLink.value) return
  try {
    await navigator.clipboard.writeText(shareLink.value)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch {
    window.prompt('复制以下分享链接：', shareLink.value)
  }
}

function openInNewTab(): void {
  if (shareLink.value) window.open(shareLink.value, '_blank')
}
</script>
