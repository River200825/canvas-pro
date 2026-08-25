<template>
  <div
    class="fixed inset-0 z-[140] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
    @click.self="close"
  >
    <div class="w-full max-w-md card animate-scale-in overflow-hidden" role="dialog" aria-label="AI 生成画布草稿">
      <div class="flex items-center justify-between px-5 py-4 border-b border-canvas-border">
        <h2 class="text-lg font-semibold text-text flex items-center gap-2">
          <Sparkles class="h-5 w-5 text-primary-600" /> AI 生成画布草稿
        </h2>
        <button class="btn-icon text-text-muted hover:text-text" aria-label="关闭" @click="close">
          <X class="h-5 w-5" />
        </button>
      </div>

      <div class="p-5 space-y-4">
        <div>
          <label class="block text-sm font-medium text-text mb-1.5">
            描述你的创业想法（{{ canvasStore.currentTemplate?.name }}）
          </label>
          <textarea
            v-model="idea"
            class="input resize-none"
            rows="4"
            placeholder="例：面向独居养猫人群的上门喂猫服务平台，按次收费，主打实时视频反馈"
          />
        </div>

        <p class="text-xs text-text-muted leading-relaxed">
          AI 将为每个区块生成 1-3 张便签草稿，<span class="text-text">追加</span>到当前画布，可用 Ctrl+Z 撤销。
        </p>

        <div v-if="streamTail" class="text-xs font-mono bg-gray-50 dark:bg-gray-800 rounded-lg p-3 max-h-28 overflow-y-auto custom-scrollbar text-text-muted break-all">
          {{ streamTail }}
        </div>

        <p v-if="error" class="text-sm text-red-500 leading-relaxed">{{ error }}</p>
      </div>

      <div class="flex items-center justify-between px-5 py-4 border-t border-canvas-border bg-gray-50 dark:bg-gray-800/50">
        <button class="btn-ghost !px-2 text-xs gap-1 text-text-muted" @click="aiState.settingsOpen = true">
          <Settings2 class="h-3.5 w-3.5" /> AI 设置
        </button>
        <div class="flex gap-2">
          <button class="btn-secondary" :disabled="generating" @click="close">取消</button>
          <button class="btn-primary gap-2 min-w-[110px]" :disabled="generating || !idea.trim()" @click="generate">
            <Loader2 v-if="generating" class="h-4 w-4 animate-spin" />
            {{ generating ? '生成中...' : '生成草稿' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import { Loader2, Settings2, Sparkles, X } from 'lucide-vue-next'
import { useCanvasStore } from '@/stores'
import { useSettingsStore } from '@/stores/settings'
import { useToast } from '@/composables/useToast'
import { aiState } from './aiState'
import { generateCanvasDraft } from '@/utils/ai'

const emit = defineEmits<{
  (e: 'close'): void
}>()

const canvasStore = useCanvasStore()
const settings = useSettingsStore()
const toast = useToast()

const idea = ref('')
const generating = ref(false)
const error = ref('')
const streamTail = ref('')

let controller: AbortController | null = null

function close(): void {
  controller?.abort()
  emit('close')
}

async function generate(): Promise<void> {
  error.value = ''
  streamTail.value = ''
  generating.value = true
  controller = new AbortController()

  try {
    const seeds = await generateCanvasDraft({
      settings: settings.ai,
      idea: idea.value.trim(),
      template: canvasStore.currentTemplate,
      signal: controller.signal,
      onDelta(delta) {
        streamTail.value = (streamTail.value + delta).slice(-120)
      },
    })

    const count = canvasStore.fillExample(seeds)
    toast.success(`AI 已生成 ${count} 张便签草稿，Ctrl+Z 可撤销`)
    emit('close')
  } catch (e) {
    if ((e as Error).name === 'AbortError') return
    error.value = e instanceof Error ? e.message : '生成失败，请重试'
  } finally {
    generating.value = false
    controller = null
  }
}

onUnmounted(() => controller?.abort())
</script>
