<template>
  <div class="fixed inset-0 z-[100] flex flex-col bg-white dark:bg-gray-900">
    <header class="flex items-center justify-between px-4 py-3 border-b border-canvas-border shrink-0">
      <div class="flex items-center gap-3">
        <svg class="w-8 h-8" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <rect width="32" height="32" rx="6" fill="#0ea5e9" />
          <path d="M8 10h16M8 16h12M8 22h8" stroke="white" stroke-width="2.5" stroke-linecap="round" />
        </svg>
        <span class="text-lg font-semibold text-text">交互教程</span>
      </div>
      <div class="flex items-center gap-2">
        <button class="btn-ghost text-sm gap-1" @click="showShortcuts = true">
          <Keyboard class="w-4 h-4" /> 快捷键
        </button>
        <button class="btn-ghost text-sm" @click="skipGuide">跳过</button>
      </div>
    </header>

    <div class="px-4 pt-3 shrink-0">
      <div class="h-1.5 bg-canvas-border rounded-full overflow-hidden">
        <div
          class="h-full bg-primary-600 transition-all duration-300 ease-out rounded-full"
          :style="{ width: progressPercent + '%' }"
        />
      </div>
      <div class="flex mt-2 gap-1">
        <div v-for="(step, index) in steps" :key="step.id" class="flex-1 flex justify-center py-1 cursor-pointer" @click="currentStep = index">
          <div
            class="w-2 h-2 rounded-full transition-all duration-300"
            :class="index <= currentStep ? 'bg-primary-600' : 'bg-canvas-border'"
            :title="step.title"
          />
        </div>
      </div>
    </div>

    <main class="flex-1 overflow-y-auto p-4 md:p-8 flex items-start md:items-center justify-center custom-scrollbar">
      <div class="max-w-3xl w-full">
        <GuideStep
          v-for="(step, index) in steps"
          :key="step.id"
          :step="step"
          :is-active="index === currentStep"
          :is-completed="index < currentStep"
        />
      </div>
    </main>

    <footer class="flex items-center justify-between px-4 py-4 border-t border-canvas-border shrink-0">
      <button class="btn-secondary gap-2" :disabled="currentStep === 0" @click="prevStep">
        <ChevronLeft class="w-4 h-4" /> 上一步
      </button>
      <div class="text-sm text-text-muted">步骤 {{ currentStep + 1 }} / {{ steps.length }}</div>
      <button :class="isLast ? 'btn-primary' : 'btn-secondary'" class="gap-2" @click="nextStep">
        <template v-if="isLast"><CheckCircle class="w-4 h-4" /> 开始创作</template>
        <template v-else>下一步 <ChevronRight class="w-4 h-4" /></template>
      </button>
    </footer>

    <KeyboardShortcutsTable v-if="showShortcuts" @close="showShortcuts = false" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { CheckCircle, ChevronLeft, ChevronRight, Keyboard } from 'lucide-vue-next'
import GuideStep from '@/components/guide/GuideStep.vue'
import KeyboardShortcutsTable from '@/components/guide/KeyboardShortcutsTable.vue'

interface StepData {
  id: string
  title: string
  description: string
}

const router = useRouter()

const steps: StepData[] = [
  {
    id: 'welcome',
    title: '欢迎使用 CanvasPro',
    description:
      'CanvasPro 是专业级个人商业画布工具，1:1 复刻 Canvanizer 核心体验。\n本教程将带你快速掌握核心操作，随时可以点击右上角「跳过」。',
  },
  {
    id: 'create-note',
    title: '创建便利贴',
    description:
      '有三种方式创建便利贴：\n1. 点击区块右上角的 "+" 按钮\n2. 点击区块内的空白虚线区域\n3. 快捷键 N（规划中）\n\n新建的便利贴会自动聚焦标题输入框。',
  },
  {
    id: 'edit-note',
    title: '编辑便利贴',
    description:
      '单击便利贴的标题或内容区域即可进入编辑模式：\n- Enter 提交，Shift+Enter 内容区换行\n- Esc 取消编辑\n- 悬停显示操作按钮：改色 / 锁定 / 复制 / 删除',
  },
  {
    id: 'drag-note',
    title: '拖拽移动便利贴',
    description:
      '直接拖拽便利贴到目标位置：\n- 跨区块拖拽时自动归属新区块\n- 拖入区块高亮显示蓝色描边\n- 锁定状态的便利贴不可拖拽',
  },
  {
    id: 'viewport',
    title: '缩放与平移画布',
    description:
      '多种方式控制视野：\n- Ctrl + 滚轮：以鼠标为中心缩放 (25% ~ 300%)\n- 空白处按住拖拽：平移画布\n- 双击画布空白处：重置视图 (100%)',
  },
  {
    id: 'export-share',
    title: '导出与备份',
    description:
      '工具栏右侧提供完整导出功能：\n- PNG：1x/2x/3x 倍率，可选透明背景\n- PDF：A4/A3、横纵向、自动分页\n- Markdown / JSON：结构化文档与完整数据备份\n- 导入 JSON：在切换器中随时恢复备份',
  },
  {
    id: 'presentation',
    title: '演示模式与快捷键',
    description:
      '按 F 或点击工具栏全屏按钮进入演示模式：\n- 隐藏所有 UI，仅留画布内容\n- Esc 退出\n\n常用快捷键：Ctrl+S 创建快照 | Ctrl+E 导出 | ? 查看全部快捷键',
  },
  {
    id: 'complete',
    title: '教程完成！',
    description:
      '你已掌握 CanvasPro 核心操作。\n点击「开始创作」进入编辑器，开始你的第一张商业画布吧！',
  },
]

const currentStep = ref(0)
const showShortcuts = ref(false)

const isLast = computed(() => currentStep.value === steps.length - 1)
const progressPercent = computed(() =>
  steps.length > 1 ? Math.round((currentStep.value / (steps.length - 1)) * 100) : 100
)

function nextStep(): void {
  if (!isLast.value) {
    currentStep.value++
  } else {
    completeGuide()
  }
}

function prevStep(): void {
  if (currentStep.value > 0) currentStep.value--
}

function skipGuide(): void {
  completeGuide()
}

function completeGuide(): void {
  localStorage.setItem('guideShown', 'true')
  router.push('/canvas/new?template=business-model-canvas')
}

function handleKeydown(event: KeyboardEvent): void {
  const target = event.target as HTMLElement
  if (target.closest('input, textarea, [contenteditable]')) return
  if (event.key === 'ArrowRight') nextStep()
  else if (event.key === 'ArrowLeft') prevStep()
  else if (event.key === 'Escape') skipGuide()
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
</script>
