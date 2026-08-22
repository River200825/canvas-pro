<template>
  <div
    class="flex flex-col min-h-[220px] rounded-xl border border-canvas-border shadow-block overflow-hidden transition-all duration-150"
    :class="{ 'ring-2 ring-primary-500 ring-offset-1': isDragOver }"
    :style="{ borderTopColor: block.color || '#e2e8f0', borderTopWidth: '3px' }"
    role="listitem"
    :aria-label="block.title"
    @dragover.prevent="handleDragOver"
    @dragleave="handleDragLeave"
    @drop.prevent="handleDrop"
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
        class="flex items-center justify-center border-2 border-dashed border-canvas-border rounded-lg text-text-muted text-xs p-4 m-2 cursor-pointer hover:border-primary-400 hover:text-primary-500 transition-colors"
        role="button"
        tabindex="0"
        title="添加便利贴"
        @click="$emit('addNote', block.id)"
        @keydown.enter="$emit('addNote', block.id)"
      >
        双击或点击创建便利贴
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import BlockHeader from './BlockHeader.vue'
import StickyNote from './StickyNote.vue'
import type { CanvasBlock } from '@/types'
import type { StickyNote as StickyNoteType } from '@/types/note'

export interface NoteMovedPayload {
  noteId: string
  targetBlockId: string
  sourceBlockId: string
}

const props = defineProps<{
  block: CanvasBlock
  notes: StickyNoteType[]
  presentationMode: boolean
}>()

const emit = defineEmits<{
  (e: 'addNote', blockId: string): void
  (e: 'noteMoved', payload: NoteMovedPayload): void
}>()

const isCollapsed = ref(false)
const isDragOver = ref(false)

const sortedNotes = computed(() =>
  props.notes.slice().sort((a, b) => a.order - b.order)
)

function handleDragOver(event: DragEvent): void {
  if (props.presentationMode) return
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
  isDragOver.value = true
}

function handleDragLeave(event: DragEvent): void {
  const current = event.currentTarget as HTMLElement
  if (!current.contains(event.relatedTarget as Node)) {
    isDragOver.value = false
  }
}

function handleDrop(event: DragEvent): void {
  isDragOver.value = false
  if (props.presentationMode) return
  const noteId = event.dataTransfer?.getData('text/note-id')
  if (noteId) {
    emit('noteMoved', {
      noteId,
      targetBlockId: props.block.id,
      sourceBlockId: event.dataTransfer?.getData('text/source-block') ?? '',
    })
  }
}
</script>
