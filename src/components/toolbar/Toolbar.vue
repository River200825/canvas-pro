<template>
  <header
    v-if="!uiStore.presentationMode"
    class="fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-b border-canvas-border py-2.5 flex items-center gap-2 sm:gap-3"
    :style="{
      paddingLeft: 'max(1rem, env(safe-area-inset-left))',
      paddingRight: 'max(1rem, env(safe-area-inset-right))',
      paddingTop: 'max(0.625rem, env(safe-area-inset-top))',
    }"
    data-export-ignore
  >
    <button class="flex items-center gap-2 shrink-0" title="返回首页" @click="router.push('/')">
      <span class="text-base font-bold text-text">CanvasPro</span>
    </button>

    <CanvasSwitcher />

    <span class="hidden md:inline text-sm text-text-muted truncate">
      {{ canvasStore.currentTemplate?.name }}
    </span>

    <div class="flex-1" />

    <button
      class="btn-icon text-text-muted hover:text-text disabled:opacity-30 disabled:pointer-events-none"
      :disabled="!canvasStore.canUndo"
      aria-label="撤销"
      title="撤销 (Ctrl+Z)"
      @click="canvasStore.undo()"
    >
      <Undo2 class="h-5 w-5" />
    </button>
    <button
      class="btn-icon text-text-muted hover:text-text disabled:opacity-30 disabled:pointer-events-none"
      :disabled="!canvasStore.canRedo"
      aria-label="重做"
      title="重做 (Ctrl+Y)"
      @click="canvasStore.redo()"
    >
      <Redo2 class="h-5 w-5" />
    </button>

    <!-- 次要操作：小屏收进溢出菜单（D3） -->
    <div class="hidden sm:flex items-center gap-1">
      <ThemeToggle />
      <button
        class="btn-icon text-text-muted hover:text-text"
        :class="{ 'text-primary-600': uiStore.activeModal === 'snapshots' }"
        aria-label="快照历史"
        title="快照历史"
        @click="toggleSnapshots"
      >
        <History class="h-5 w-5" />
      </button>
      <button
        class="btn-icon text-text-muted hover:text-text"
        aria-label="交互教程与快捷键"
        title="交互教程"
        @click="router.push('/guide')"
      >
        <Keyboard class="h-5 w-5" />
      </button>
      <button
        class="btn-icon text-text-muted hover:text-text"
        aria-label="进入演示模式"
        title="演示模式 (F)"
        @click="uiStore.setPresentationMode(true)"
      >
        <Maximize2 class="h-5 w-5" />
      </button>
    </div>

    <div class="relative sm:hidden">
      <button
        class="btn-icon text-text-muted hover:text-text"
        aria-label="更多操作"
        title="更多操作"
        @click.stop="moreOpen = !moreOpen"
      >
        <MoreHorizontal class="h-5 w-5" />
      </button>
      <div
        v-if="moreOpen"
        class="absolute right-0 top-full mt-1 min-w-[160px] card shadow-xl p-1 z-50"
        @click.stop
      >
        <button class="dropdown-item w-full gap-2" @click="moreAct(() => uiStore.cycleTheme())">
          <component :is="themeIcon" class="h-4 w-4" /> 主题：{{ themeLabel }}
        </button>
        <button class="dropdown-item w-full gap-2" @click="moreAct(() => toggleSnapshots())">
          <History class="h-4 w-4" /> 快照历史
        </button>
        <button class="dropdown-item w-full gap-2" @click="moreAct(() => router.push('/guide'))">
          <Keyboard class="h-4 w-4" /> 交互教程
        </button>
        <button class="dropdown-item w-full gap-2" @click="moreAct(() => uiStore.setPresentationMode(true))">
          <Maximize2 class="h-4 w-4" /> 演示模式
        </button>
      </div>
    </div>

    <button class="btn-secondary !py-1.5 gap-1.5" title="AI 生成画布草稿" @click="openAiGenerate()">
      <Sparkles class="h-4 w-4 text-primary-600" />
      <span class="hidden md:inline">AI</span>
    </button>

    <button class="btn-primary !py-1.5 gap-1.5" @click="uiStore.openModal('export')">
      <Download class="h-4 w-4" />
      <span class="hidden sm:inline">导出</span>
    </button>
  </header>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Download, History, Keyboard, Maximize2, Monitor, Moon, MoreHorizontal, Redo2, Sparkles, Sun, Undo2 } from 'lucide-vue-next'
import { useCanvasStore } from '@/stores'
import { useUIStore } from '@/stores/ui'
import CanvasSwitcher from '@/components/canvas/CanvasSwitcher.vue'
import ThemeToggle from './ThemeToggle.vue'
import { openAiGenerate } from '@/components/ai/aiState'

const router = useRouter()
const canvasStore = useCanvasStore()
const uiStore = useUIStore()

const moreOpen = ref(false)

const themeLabel = computed(() =>
  uiStore.theme === 'light' ? '浅色' : uiStore.theme === 'dark' ? '深色' : '跟随系统'
)
const themeIcon = computed(() =>
  uiStore.theme === 'light' ? Sun : uiStore.theme === 'dark' ? Moon : Monitor
)

function moreAct(fn: () => void): void {
  fn()
  moreOpen.value = false
}

function closeMore(event: MouseEvent): void {
  const target = event.target as HTMLElement
  if (!target.closest('[aria-label="更多操作"]') && !target.closest('.card.shadow-xl')) {
    moreOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', closeMore))
onUnmounted(() => document.removeEventListener('click', closeMore))

function toggleSnapshots(): void {
  if (uiStore.activeModal === 'snapshots') {
    uiStore.closeModal()
  } else {
    uiStore.openModal('snapshots')
  }
}
</script>
