<template>
  <div
    class="fixed inset-0 z-[140] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
    @click.self="$emit('close')"
  >
    <div class="w-full max-w-md card animate-scale-in overflow-hidden" role="dialog" aria-label="AI 设置">
      <div class="flex items-center justify-between px-5 py-4 border-b border-canvas-border">
        <h2 class="text-lg font-semibold text-text flex items-center gap-2">
          <Sparkles class="h-5 w-5 text-primary-600" /> AI 设置
        </h2>
        <button class="btn-icon text-text-muted hover:text-text" aria-label="关闭 AI 设置" @click="$emit('close')">
          <X class="h-5 w-5" />
        </button>
      </div>

      <div class="p-5 space-y-4">
        <div>
          <label class="block text-sm font-medium text-text mb-1.5">接口地址（OpenAI 兼容）</label>
          <input v-model="draft.baseUrl" class="input font-mono !text-xs" placeholder="https://api.openai.com/v1" />
        </div>
        <div>
          <label class="block text-sm font-medium text-text mb-1.5">API Key</label>
          <input
            v-model="draft.apiKey"
            type="password"
            class="input font-mono !text-xs"
            placeholder="sk-..."
            autocomplete="off"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-text mb-1.5">模型</label>
          <input v-model="draft.model" class="input font-mono !text-xs" placeholder="gpt-4o-mini" />
        </div>

        <p class="text-xs text-text-muted leading-relaxed flex gap-1.5">
          <ShieldCheck class="w-4 h-4 shrink-0 text-green-600" />
          Key 仅保存在此浏览器（localStorage），请求由你的浏览器直连所填服务商，本应用不经手任何数据。
        </p>

        <p v-if="testResult" class="text-sm" :class="testOk ? 'text-green-600' : 'text-red-500'">{{ testResult }}</p>
      </div>

      <div class="flex items-center justify-between px-5 py-4 border-t border-canvas-border bg-gray-50 dark:bg-gray-800/50">
        <button class="btn-secondary gap-1.5" :disabled="testing" @click="runTest">
          <Loader2 v-if="testing" class="h-4 w-4 animate-spin" /> 测试连接
        </button>
        <div class="flex gap-2">
          <button class="btn-secondary" @click="$emit('close')">取消</button>
          <button class="btn-primary" @click="save">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { Loader2, ShieldCheck, Sparkles, X } from 'lucide-vue-next'
import { useSettingsStore } from '@/stores/settings'
import { useToast } from '@/composables/useToast'
import { testAiConnection } from '@/utils/ai'

const emit = defineEmits<{
  (e: 'close'): void
}>()

const settings = useSettingsStore()
const toast = useToast()

const draft = reactive({ ...settings.ai })
const testing = ref(false)
const testResult = ref('')
const testOk = ref(false)

async function runTest(): Promise<void> {
  testing.value = true
  testResult.value = ''
  try {
    testResult.value = await testAiConnection({ ...draft })
    testOk.value = true
  } catch (e) {
    testResult.value = e instanceof Error ? e.message : '连接失败'
    testOk.value = false
  } finally {
    testing.value = false
  }
}

function save(): void {
  if (!draft.apiKey.trim()) {
    toast.error('请填写 API Key')
    return
  }
  settings.setAiSettings({ ...draft })
  toast.success('AI 设置已保存（仅本地）')
  emit('close')
}
</script>
