<template>
  <div class="flex items-center gap-2 px-3 py-2 border-b border-canvas-border" :style="headerStyle">
    <button
      v-if="!presentationMode"
      class="p-1 rounded transition-colors text-slate-600/80 hover:bg-black/10"
      :aria-label="collapsed ? '展开' : '折叠'"
      @click.stop="$emit('toggleCollapse')"
    >
      <ChevronDown class="h-4 w-4 transition-transform duration-150" :class="{ 'rotate-180': collapsed }" />
    </button>

    <h3 class="font-semibold text-sm truncate flex-1" :style="titleStyle">{{ block.title }}</h3>

    <span
      v-if="block.hint"
      class="shrink-0 p-0.5 rounded-full text-slate-600/70 hover:text-slate-900 transition-colors cursor-help"
      :title="block.hint"
      aria-label="区块说明"
    >
      <Info class="h-3.5 w-3.5" />
    </span>

    <span class="px-2 py-0.5 text-xs font-medium rounded-full bg-white/70 text-slate-700">
      {{ noteCount }}
    </span>

    <button
      v-if="!presentationMode"
      class="p-1.5 rounded transition-colors text-slate-600/80 hover:bg-black/10 hover:text-primary-700"
      aria-label="添加便利贴"
      title="添加便利贴"
      @click.stop="$emit('addNote')"
    >
      <Plus class="h-4 w-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ChevronDown, Info, Plus } from 'lucide-vue-next'
import type { CanvasBlock } from '@/types'

const props = defineProps<{
  block: CanvasBlock
  noteCount: number
  collapsed: boolean
  presentationMode: boolean
}>()

defineEmits<{
  (e: 'toggleCollapse'): void
  (e: 'addNote'): void
}>()

/** 表头使用区块全色 + 深色文字，保证可读性（浅色 pastel 底 + 深字 = 经典画布风格） */
const headerStyle = computed(() => ({
  backgroundColor: props.block.color || '#e2e8f0',
}))

const titleStyle = computed(() => ({
  color: '#1e293b',
}))
</script>
