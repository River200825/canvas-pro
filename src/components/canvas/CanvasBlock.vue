<template>
  <div
    class="flex flex-col min-h-[220px] rounded-xl border border-canvas-border shadow-block overflow-hidden transition-all duration-150"
    :class="{ 'ring-2 ring-primary-500 ring-offset-1': isDragOver }"
    :style="{ borderTopColor: block.color || '#e2e8f0', borderTopWidth: '3px', ...(block.area ? { gridArea: block.area } : {}) }"
    :data-block-id="block.id"
    role="listitem"
    :aria-label="block.title"
  >
    <BlockHeader
      :block="block"
      :note-count="notes.length"
      :collapsed="isCollapsed"
      :presentation-mode="presentationMode"
      @toggle-collapse="isCollapsed = !isCollapsed"
      @add-note="$emit('addNote', block.id)"
    />

    <div
      v-if="!isCollapsed"
      class="flex-1 overflow-y-auto p-2 space-y-2 max-h-[400px] custom-scrollbar"
      role="list"
    >
      <StickyNote
        v-for="note in sortedNotes"
        :key="note.id"
        :note="note"
        :presentation-mode="presentationMode"
      />

      <div
        v-if="sortedNotes.length === 0 && !presentationMode"
        class="flex items-center justify-center border-2 border-dashed border-canvas-border rounded-lg text-text-muted text-xs p-4 m-2 transition-colors"
        title="双击此处创建便利贴"
      >
        双击此处创建便利贴
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import BlockHeader from './BlockHeader.vue'
import StickyNote from './StickyNote.vue'
import { noteDrag } from './noteInteraction'
import type { CanvasBlock } from '@/types'
import type { StickyNote as StickyNoteType } from '@/types/note'

const props = defineProps<{
  block: CanvasBlock
  notes: StickyNoteType[]
  presentationMode: boolean
}>()

defineEmits<{
  (e: 'addNote', blockId: string): void
}>()

const isCollapsed = ref(false)

/** 拖拽悬停高亮（D2：由 noteDrag 全局状态驱动） */
const isDragOver = computed(() => noteDrag.active && noteDrag.overBlockId === props.block.id)

const sortedNotes = computed(() =>
  props.notes.slice().sort((a, b) => a.order - b.order)
)
</script>
