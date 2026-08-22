<template>
  <div class="space-y-4">
    <div class="flex items-start gap-3 p-3 rounded-lg border border-canvas-border bg-white dark:bg-gray-800">
      <div class="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-primary-100 dark:bg-primary-900">
        <Sparkles class="w-5 h-5 text-primary-600" />
      </div>
      <div class="flex-1" v-if="content">
        <p class="font-medium text-text">{{ content.title }}</p>
        <p class="text-sm text-text-muted mt-1 whitespace-pre-line">{{ content.instruction }}</p>
      </div>
    </div>

    <div v-if="content?.canvasMode" class="relative">
      <div class="aspect-video bg-canvas-bg rounded-xl border border-canvas-border overflow-hidden relative flex items-center justify-center">
        <div class="text-center p-4 pointer-events-none">
          <p class="text-text-muted mb-1">练习区域</p>
          <p class="text-xs text-text-muted">此处为演示示意，完成教程后请在编辑器中实际操作</p>
        </div>
      </div>
    </div>

    <p v-else-if="content" class="text-sm text-text-muted text-center py-2">
      该步骤无需练习区操作，完成后进入编辑器体验即可
    </p>

    <button class="btn-primary w-full gap-2" :disabled="done" @click="done = true">
      <CheckCircle v-if="done" class="w-4 h-4" />
      {{ done ? '已完成练习' : '我已理解，继续下一步' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { CheckCircle, Sparkles } from 'lucide-vue-next'

const props = defineProps<{
  stepId: string
}>()

interface PracticeContent {
  title: string
  instruction: string
  canvasMode: boolean
}

const CONTENT: Record<string, PracticeContent> = {
  'create-note': {
    title: '尝试创建便利贴',
    instruction: '双击画布空白处，或点击区块右上角的 "+" 按钮',
    canvasMode: true,
  },
  'edit-note': {
    title: '尝试编辑便利贴',
    instruction: '点击便利贴的标题或内容区域进行编辑\nEnter 提交，Esc 取消',
    canvasMode: true,
  },
  'drag-note': {
    title: '尝试拖拽便利贴',
    instruction: '按住便利贴拖拽到其他区块，松手后自动归属新区块',
    canvasMode: true,
  },
  viewport: {
    title: '尝试缩放和平移',
    instruction: 'Ctrl + 滚轮以鼠标为中心缩放\n空白处拖拽平移，双击空白处重置视图',
    canvasMode: true,
  },
  'export-share': {
    title: '了解导出功能',
    instruction: '工具栏提供 PNG / PDF / Markdown / JSON 导出与分享链接',
    canvasMode: false,
  },
  presentation: {
    title: '尝试演示模式',
    instruction: '按 F 进入演示模式：隐藏 UI、←/→ 切换画布、Esc 退出',
    canvasMode: false,
  },
}

const done = ref(false)

const content = computed<PracticeContent | null>(() => CONTENT[props.stepId] ?? null)
</script>
