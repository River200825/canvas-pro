<template>
  <div
    class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
    @click.self="$emit('close')"
  >
    <div class="w-full max-w-lg card animate-scale-in overflow-hidden" role="dialog" aria-label="导出画布">
      <div class="flex items-center justify-between px-5 py-4 border-b border-canvas-border">
        <h2 class="text-lg font-semibold text-text flex items-center gap-2">
          <Download class="h-5 w-5 text-primary-600" /> 导出画布
        </h2>
        <button class="btn-icon text-text-muted hover:text-text" aria-label="关闭导出对话框" @click="$emit('close')">
          <X class="h-5 w-5" />
        </button>
      </div>

      <div class="flex border-b border-canvas-border px-5 gap-1">
        <button
          v-for="tab in TABS"
          :key="tab.id"
          class="px-3 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors"
          :class="
            activeTab === tab.id
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-text-muted hover:text-text'
          "
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="p-5 space-y-4 min-h-[180px]">
        <template v-if="activeTab === 'png'">
          <div>
            <label class="block text-sm font-medium text-text mb-2">图片倍率</label>
            <div class="flex gap-2">
              <button
                v-for="ratio in [1, 2, 3]"
                :key="ratio"
                class="btn-secondary !py-1.5 flex-1"
                :class="{ '!bg-primary-600 !text-white hover:!bg-primary-700': settings.exportPixelRatio === ratio }"
                @click="settings.exportPixelRatio = ratio as 1 | 2 | 3"
              >
                {{ ratio }}x
              </button>
            </div>
          </div>
          <label class="flex items-center gap-2 text-sm text-text cursor-pointer">
            <input v-model="transparentBg" type="checkbox" class="accent-primary-600" />
            透明背景
          </label>
        </template>

        <template v-else-if="activeTab === 'pdf'">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">纸张大小</label>
              <select v-model="paper" class="input">
                <option value="a4">A4</option>
                <option value="a3">A3</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-text mb-1.5">方向</label>
              <select v-model="orientation" class="input">
                <option value="portrait">纵向</option>
                <option value="landscape">横向</option>
              </select>
            </div>
          </div>
          <p class="text-xs text-text-muted leading-relaxed">
            内容自动分页，页眉包含画布名与导出时间，页脚显示页码。中文内容以高清晰度图像嵌入（与 Canvanizer 一致）。
          </p>
        </template>

        <template v-else-if="activeTab === 'markdown'">
          <p class="text-sm text-text-muted leading-relaxed">
            将画布按区块结构化为 Markdown 文档，便于粘贴到 Notion / 语雀等工具继续编辑。
          </p>
          <pre class="text-xs bg-gray-50 dark:bg-gray-800 rounded-lg p-3 overflow-x-auto custom-scrollbar text-text-muted">{{ markdownPreview }}</pre>
        </template>

        <template v-else>
          <p class="text-sm text-text-muted leading-relaxed">
            完整序列化当前画布（含便利贴、区块、视口与快照），可用于备份或跨设备导入。
          </p>
          <pre class="text-xs bg-gray-50 dark:bg-gray-800 rounded-lg p-3 overflow-x-auto max-h-40 custom-scrollbar text-text-muted">{{ jsonPreview }}</pre>
        </template>

        <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
      </div>

      <div class="flex justify-end gap-2 px-5 py-4 border-t border-canvas-border bg-gray-50 dark:bg-gray-800/50">
        <button class="btn-secondary" :disabled="exporting" @click="$emit('close')">取消</button>
        <button class="btn-primary gap-2 min-w-[96px]" :disabled="exporting" @click="handleExport">
          <Loader2 v-if="exporting" class="h-4 w-4 animate-spin" />
          {{ exporting ? '导出中...' : '导出' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Download, Loader2, X } from 'lucide-vue-next'
import { useCanvasStore } from '@/stores'
import { useSettingsStore } from '@/stores/settings'
import { useToast } from '@/composables/useToast'
import { exportJSON, exportMarkdown, exportPNG } from '@/utils/export'
import { exportPDF, type PaperSize, type Orientation } from '@/utils/export-pdf'

type TabId = 'png' | 'pdf' | 'markdown' | 'json'

const emit = defineEmits<{
  (e: 'close'): void
}>()

const canvasStore = useCanvasStore()
const settings = useSettingsStore()
const toast = useToast()

const TABS: { id: TabId; label: string }[] = [
  { id: 'png', label: 'PNG 图片' },
  { id: 'pdf', label: 'PDF 文档' },
  { id: 'markdown', label: 'Markdown' },
  { id: 'json', label: 'JSON' },
]

const LABELS: Record<TabId, string> = {
  png: 'PNG 图片',
  pdf: 'PDF 文档',
  markdown: 'Markdown 文件',
  json: 'JSON 文件',
}

const activeTab = ref<TabId>('png')
const transparentBg = ref(false)
const paper = ref<PaperSize>('a4')
const orientation = ref<Orientation>('portrait')
const exporting = ref(false)
const error = ref('')

const jsonPreview = computed(() => {
  if (!canvasStore.currentCanvas) return '{}'
  return JSON.stringify(canvasStore.currentCanvas, null, 2).slice(0, 400) + '\n...'
})

const markdownPreview = computed(() => {
  const canvas = canvasStore.currentCanvas
  const template = canvasStore.currentTemplate
  if (!canvas || !template) return ''
  const lines = [`# ${canvas.name}`, '', `> 模板：${template.name}`, '']
  template.blocks.slice(0, 3).forEach(b => lines.push(`## ${b.title}`, '', '- （便利贴内容...）', ''))
  return lines.join('\n')
})

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') emit('close')
}
onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))

async function handleExport(): Promise<void> {
  error.value = ''
  const canvas = canvasStore.currentCanvas
  const element = document.querySelector('[data-canvas-area]') as HTMLElement | null
  if (!canvas) {
    error.value = '没有可导出的画布'
    return
  }

  exporting.value = true
  try {
    switch (activeTab.value) {
      case 'png':
        if (!element) throw new Error('未找到画布区域')
        await exportPNG(
          element,
          canvas.name,
          settings.exportPixelRatio,
          transparentBg.value ? null : undefined
        )
        break
      case 'pdf':
        if (!element) throw new Error('未找到画布区域')
        await exportPDF(element, canvas.name, canvasStore.currentTemplate?.name ?? '', canvas.updatedAt, {
          paper: paper.value,
          orientation: orientation.value,
        })
        break
      case 'markdown':
        exportMarkdown(canvas, canvasStore.currentTemplate)
        break
      case 'json':
        exportJSON(canvas)
        break
    }
    toast.success(`已导出 ${LABELS[activeTab.value]}`)
    emit('close')
  } catch (e) {
    error.value = e instanceof Error ? e.message : '导出失败，请重试'
    toast.error('导出失败，请重试')
  } finally {
    exporting.value = false
  }
}
</script>
