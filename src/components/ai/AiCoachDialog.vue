<template>
  <div
    class="fixed inset-0 z-[140] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
    @click.self="close"
  >
    <div class="w-full max-w-md card animate-scale-in overflow-hidden" role="dialog" aria-label="AI 打磨便签">
      <div class="flex items-center justify-between px-5 py-4 border-b border-canvas-border">
        <h2 class="text-lg font-semibold text-text flex items-center gap-2">
          <Sparkles class="h-5 w-5 text-primary-600" /> AI 打磨
          <span class="text-sm font-normal text-text-muted">· {{ blockTitle }}</span>
        </h2>
        <button class="btn-icon text-text-muted hover:text-text" aria-label="关闭" @click="close">
          <X class="h-5 w-5" />
        </button>
      </div>

      <div class="p-5 space-y-4">
        <div class="text-sm bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-text-muted whitespace-pre-wrap break-words max-h-24 overflow-y-auto custom-scrollbar">
          {{ note?.content || '（空便签）' }}
        </div>

        <div>
          <label class="block text-sm font-medium text-text mb-1.5">改写指令</label>
          <div class="flex flex-wrap gap-1.5 mb-2">
            <button
              v-for="preset in COACH_PRESETS"
              :key="preset"
              class="px-2.5 py-1 text-xs rounded-full border transition-colors"
              :class="
                instruction === preset
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'border-canvas-border text-text-muted hover:border-primary-400 hover:text-primary-600'
              "
              @click="instruction = preset"
            >
              {{ preset }}
            </button>
          </div>
          <input
            v-model="customInstruction"
            class="input"
            placeholder="或输入自定义指令，如：突出与连锁宠物店的差异"
          />
        </div>

        <div v-if="result || improving">
          <label class="block text-sm font-medium text-text mb-1.5">改写结果（可编辑）</label>
          <textarea v-model="result" class="input resize-none" rows="3" :disabled="improving" />
        </div>

        <p v-if="error" class="text-sm text-red-500 leading-relaxed">{{ error }}</p>
      </div>

      <div class="flex items-center justify-between px-5 py-4 border-t border-canvas-border bg-gray-50 dark:bg-gray-800/50">
        <button class="btn-ghost !px-2 text-xs gap-1 text-text-muted" @click="aiState.settingsOpen = true">
          <Settings2 class="h-3.5 w-3.5" /> AI 设置
        </button>
        <div class="flex gap-2">
          <button class="btn-secondary" :disabled="improving" @click="close">取消</button>
          <button
            v-if="!result"
            class="btn-primary gap-2 min-w-[96px]"
            :disabled="improving || !finalInstruction.trim()"
            @click="run"
          >
            <Loader2 v-if="improving" class="h-4 w-4 animate-spin" />
            {{ improving ? '思考中...' : 'AI 改写' }}
          </button>
          <template v-else>
            <button class="btn-secondary" :disabled="improving" @click="result = ''">重新生成</button>
            <button class="btn-primary" @click="apply">替换内容</button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { Loader2, Settings2, Sparkles, X } from 'lucide-vue-next'
import { useCanvasStore } from '@/stores'
import { useSettingsStore } from '@/stores/settings'
import { useToast } from '@/composables/useToast'
import { aiState } from './aiState'
import { COACH_PRESETS, improveNoteContent } from '@/utils/ai'

const emit = defineEmits<{
  (e: 'close'): void
}>()

const canvasStore = useCanvasStore()
const settings = useSettingsStore()
const toast = useToast()

const instruction = ref<string>(COACH_PRESETS[0])
const customInstruction = ref('')
const result = ref('')
const improving = ref(false)
const error = ref('')

let controller: AbortController | null = null

const note = computed(() =>
  aiState.coachNoteId
    ? canvasStore.currentCanvas?.notes.find(n => n.id === aiState.coachNoteId) ?? null
    : null
)

const blockTitle = computed(() => {
  const blockId = note.value?.blockId
  return canvasStore.currentTemplate?.blocks.find(b => b.id === blockId)?.title ?? '便签'
})

const finalInstruction = computed(() => customInstruction.value.trim() || instruction.value)

function close(): void {
  controller?.abort()
  emit('close')
}

async function run(): Promise<void> {
  if (!note.value) return
  error.value = ''
  improving.value = true
  controller = new AbortController()
  try {
    result.value = await improveNoteContent({
      settings: settings.ai,
      blockTitle: blockTitle.value,
      content: note.value.content || note.value.title,
      instruction: finalInstruction.value,
      signal: controller.signal,
    })
  } catch (e) {
    if ((e as Error).name === 'AbortError') return
    error.value = e instanceof Error ? e.message : '改写失败，请重试'
  } finally {
    improving.value = false
    controller = null
  }
}

function apply(): void {
  if (!note.value || !result.value.trim()) return
  canvasStore.updateNote(note.value.id, { content: result.value.trim() })
  toast.success('已替换便签内容，Ctrl+Z 可撤销')
  emit('close')
}

onUnmounted(() => controller?.abort())
</script>
