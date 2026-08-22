<template>
  <div class="flex items-center gap-2 px-3 py-2 border-b border-canvas-border" :style="headerStyle">
    <button
      v-if="!presentationMode"
      class="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
      :aria-label="collapsed ? '展开' : '折叠'"
      @click.stop="$emit('toggleCollapse')"
    >
      <ChevronDown class="h-4 w-4 transition-transform duration-150" :class="{ 'rotate-180': collapsed }" />
    </button>

    <h3 class="font-semibold text-sm truncate flex-1" :style="titleStyle">{{ block.title }}</h3>

    <span class="px-2 py-0.5 text-xs font-medium rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300">
      {{ noteCount }}
    </span>

    <button
      v-if="!presentationMode"
      class="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-text-muted hover:text-primary-600"
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
import { ChevronDown, Plus } from 'lucide-vue-next'
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

const headerStyle = computed(() => ({
  backgroundColor: (props.block.color || '#e2e8f0') + '33',
}))

const titleStyle = computed(() => ({
  color: props.block.color || 'inherit',
}))
</script>
