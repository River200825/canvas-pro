<template>
  <div
    class="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
    @click.self="$emit('close')"
  >
    <div
      class="relative w-full max-w-3xl max-h-[90vh] mx-4 card animate-scale-in overflow-hidden flex flex-col"
      role="dialog"
      aria-label="快捷键帮助"
      @click.stop
    >
      <div class="flex items-center justify-between p-4 border-b border-canvas-border">
        <div class="flex items-center gap-2">
          <Keyboard class="h-5 w-5 text-primary-500" />
          <h2 class="text-lg font-semibold text-text">快捷键帮助</h2>
          <span class="px-2 py-0.5 text-xs font-medium rounded bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300">
            {{ modKeyLabel }} = {{ isMac ? '⌘ Command' : 'Ctrl 键' }}
          </span>
        </div>
        <button class="btn-icon text-text-muted hover:text-text" aria-label="关闭快捷键帮助" @click="$emit('close')">
          <X class="h-5 w-5" />
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        <div v-for="group in shortcuts" :key="group.category" class="space-y-3">
          <h3 class="text-sm font-medium text-text-muted uppercase tracking-wider">{{ group.category }}</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div
              v-for="item in group.items"
              :key="item.key"
              class="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
            >
              <kbd class="font-mono text-xs px-2 py-1 rounded whitespace-nowrap bg-white dark:bg-gray-700 border border-canvas-border">
                {{ item.key }}
              </kbd>
              <span class="text-sm text-text">{{ item.desc }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="pt-4 pb-2 px-4 border-t border-canvas-border text-center">
        <p class="text-sm text-text-muted">提示：在输入框或编辑状态下，字母快捷键会被禁用</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Keyboard, X } from 'lucide-vue-next'

defineEmits<{
  (e: 'close'): void
}>()

const isMac = navigator.platform.toUpperCase().includes('MAC')
const modKey = isMac ? '⌘' : 'Ctrl'
const modKeyLabel = isMac ? 'Command' : 'Ctrl'
void modKey

interface ShortcutItem {
  key: string
  desc: string
}

const shortcuts = ref<{ category: string; items: ShortcutItem[] }[]>([
  {
    category: '画布操作',
    items: [
      { key: `${modKey}+Shift+N`, desc: '新建画布' },
      { key: `${modKey}+Shift+D`, desc: '复制当前画布' },
      { key: 'F', desc: '切换演示模式' },
      { key: 'Esc', desc: '退出演示 / 关闭弹窗' },
      { key: `${modKey}+0`, desc: '重置视图 (100%)' },
      { key: `${modKey}+=`, desc: '放大' },
      { key: `${modKey}+-`, desc: '缩小' },
      { key: `${modKey}+滚轮`, desc: '以鼠标为中心缩放' },
      { key: '空白拖拽', desc: '平移画布' },
      { key: '双击空白', desc: '重置视图' },
    ],
  },
  {
    category: '便利贴操作',
    items: [
      { key: 'N', desc: '创建便利贴（规划中）' },
      { key: 'Delete / Backspace', desc: '删除选中便利贴（规划中）' },
      { key: `${modKey}+C / ${modKey}+V`, desc: '复制 / 粘贴便利贴（规划中）' },
      { key: `${modKey}+S`, desc: '创建快照' },
      { key: `${modKey}+Shift+S`, desc: '保存画布' },
    ],
  },
  {
    category: '导出与其他',
    items: [
      { key: `${modKey}+E`, desc: '打开导出对话框' },
      { key: '? / Shift+/', desc: '显示快捷键帮助' },
      { key: '← / →', desc: '演示模式下切换画布' },
    ],
  },
])
</script>
