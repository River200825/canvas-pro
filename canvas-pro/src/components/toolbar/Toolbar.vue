<template>
  <header
    v-if="!uiStore.presentationMode"
    class="fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-b border-canvas-border px-4 py-2.5 flex items-center gap-3"
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

    <button class="btn-primary !py-1.5 gap-1.5" @click="uiStore.openModal('export')">
      <Download class="h-4 w-4" />
      <span class="hidden sm:inline">导出</span>
    </button>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Download, History, Keyboard, Maximize2, Redo2, Undo2 } from 'lucide-vue-next'
import { useCanvasStore } from '@/stores'
import { useUIStore } from '@/stores/ui'
import CanvasSwitcher from '@/components/canvas/CanvasSwitcher.vue'
import ThemeToggle from './ThemeToggle.vue'

const router = useRouter()
const canvasStore = useCanvasStore()
const uiStore = useUIStore()

function toggleSnapshots(): void {
  if (uiStore.activeModal === 'snapshots') {
    uiStore.closeModal()
  } else {
    uiStore.openModal('snapshots')
  }
}
</script>
