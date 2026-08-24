<template>
  <div
    ref="noteRootRef"
    class="sticky-note relative group rounded-lg shadow-note hover:shadow-note-hover transition-all duration-150 p-2.5 pl-3.5"
    :class="{ 'opacity-60': note.locked, 'ring-2 ring-primary-500 ring-offset-1': isSelected }"
    :style="{ backgroundColor: color.bg, borderColor: color.border }"
    :data-note-id="note.id"
    role="listitem"
    :aria-label="note.title || '无标题便利贴'"
    :draggable="!presentationMode && !note.locked"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @focusout="handleFocusOut"
    @click.stop="select"
  >
    <div
      class="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg opacity-70"
      :style="{ backgroundColor: color.border }"
    />

    <div
      v-if="!presentationMode && !note.locked"
      class="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
      aria-label="拖拽移动"
      title="拖拽移动到其他区块"
    >
      <GripVertical class="h-4 w-4 text-text-muted" />
    </div>

    <div class="flex items-start gap-1">
      <input
        v-if="isEditing"
        ref="titleInputRef"
        v-model="editTitle"
        class="w-full text-sm font-semibold bg-transparent focus:outline-none text-text"
        placeholder="标题..."
        aria-label="便利贴标题"
        @keydown="handleTitleKeydown"
      />
      <div
        v-else
        class="flex-1 min-w-0 font-semibold text-sm text-text truncate cursor-text"
        title="点击编辑标题"
        @click="startEdit()"
      >
        {{ note.title || '无标题' }}
      </div>

      <div
        v-if="!presentationMode"
        class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity shrink-0"
      >
        <button
          class="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-text-muted"
          aria-label="更改颜色"
          title="更改颜色"
          @click.stop="showColorPicker = !showColorPicker"
        >
          <Palette class="h-3.5 w-3.5" />
        </button>
        <button
          class="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-text-muted"
          :aria-label="note.locked ? '解锁' : '锁定'"
          :title="note.locked ? '解锁' : '锁定（禁止拖拽/编辑/删除）'"
          @click.stop="toggleLock"
        >
          <LockOpen v-if="note.locked" class="h-3.5 w-3.5" />
          <Lock v-else class="h-3.5 w-3.5" />
        </button>
        <template v-if="!note.locked">
          <button
            class="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-text-muted"
            aria-label="复制便利贴"
            title="复制"
            @click.stop="duplicateNote"
          >
            <Copy class="h-3.5 w-3.5" />
          </button>
          <button
            class="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-text-muted hover:text-red-500"
            aria-label="删除便利贴"
            title="删除"
            @click.stop="deleteNote"
          >
            <Trash2 class="h-3.5 w-3.5" />
          </button>
        </template>
      </div>
    </div>

    <textarea
      v-if="isEditing"
      ref="contentInputRef"
      v-model="editContent"
      class="w-full text-sm bg-transparent focus:outline-none resize-none text-text mt-1"
      placeholder="内容..."
      rows="3"
      aria-label="便利贴内容"
      @keydown="handleContentKeydown"
    />
    <div
      v-else
      class="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words mt-1 line-clamp-4 cursor-text min-h-[16px]"
      title="点击编辑内容"
      @click.stop="startEdit(true)"
    >
      {{ note.content || '\u00a0' }}
    </div>

    <div
      v-if="showColorPicker"
      class="absolute right-2 top-8 z-20 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-canvas-border p-2 flex gap-1"
      @click.stop
    >
      <button
        v-for="c in NOTE_COLORS"
        :key="c.id"
        class="w-6 h-6 rounded-lg border-2 transition-all hover:scale-110"
        :class="{ 'ring-2 ring-primary-500 ring-offset-1': c.id === note.color }"
        :style="{ backgroundColor: c.bg, borderColor: c.border }"
        :aria-label="c.id"
        :title="c.id"
        @click.stop="selectColor(c.id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { Copy, GripVertical, Lock, LockOpen, Palette, Trash2 } from 'lucide-vue-next'
import { useCanvasStore } from '@/stores'
import { NOTE_COLORS, getNoteColor, type NoteColorId, type StickyNote as StickyNoteType } from '@/types/note'

const props = defineProps<{
  note: StickyNoteType
  presentationMode?: boolean
}>()

const canvasStore = useCanvasStore()

const isEditing = ref(false)
const editTitle = ref('')
const editContent = ref('')
const showColorPicker = ref(false)
const noteRootRef = ref<HTMLElement | null>(null)
const titleInputRef = ref<HTMLInputElement | null>(null)
const contentInputRef = ref<HTMLTextAreaElement | null>(null)

const color = computed(() => getNoteColor(props.note.color))

const isSelected = computed(() => canvasStore.selectedNoteId === props.note.id)

function select(): void {
  if (props.presentationMode) return
  canvasStore.selectNote(props.note.id)
}

function startEdit(focusContent = false): void {
  if (props.presentationMode || props.note.locked) return
  isEditing.value = true
  editTitle.value = props.note.title
  editContent.value = props.note.content
  void nextTick(() => {
    if (focusContent) {
      contentInputRef.value?.focus()
    } else {
      titleInputRef.value?.focus()
    }
  })
}

// 焦点离开整张便利贴时才保存；标题→内容切换不中断编辑
function handleFocusOut(event: FocusEvent): void {
  if (!isEditing.value) return
  const next = event.relatedTarget as Node | null
  if (next && noteRootRef.value?.contains(next)) return
  saveEdit()
}

function saveEdit(): void {
  if (!isEditing.value) return
  canvasStore.updateNote(props.note.id, {
    title: editTitle.value.trim(),
    content: editContent.value.trim(),
  })
  isEditing.value = false
}

function cancelEdit(): void {
  isEditing.value = false
}

function handleTitleKeydown(event: KeyboardEvent): void {
  if (event.key === 'Enter') {
    event.preventDefault()
    titleInputRef.value?.blur()
  } else if (event.key === 'Escape') {
    cancelEdit()
  }
}

function handleContentKeydown(event: KeyboardEvent): void {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    saveEdit()
  } else if (event.key === 'Escape') {
    cancelEdit()
  }
}

function deleteNote(): void {
  if (props.note.locked) return
  if (canvasStore.selectedNoteId === props.note.id) canvasStore.selectNote(null)
  canvasStore.deleteNote(props.note.id)
}

function duplicateNote(): void {
  canvasStore.duplicateNote(props.note.id)
}

function toggleLock(): void {
  canvasStore.updateNote(props.note.id, { locked: !props.note.locked })
  if (props.note.locked) showColorPicker.value = false
}

function selectColor(colorId: NoteColorId): void {
  canvasStore.updateNote(props.note.id, { color: colorId })
  showColorPicker.value = false
}

function handleDragStart(event: DragEvent): void {
  if (props.presentationMode || props.note.locked) {
    event.preventDefault()
    return
  }
  event.dataTransfer?.setData('text/note-id', props.note.id)
  event.dataTransfer?.setData('text/source-block', props.note.blockId ?? '')
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}

function handleDragEnd(_event: DragEvent): void {
  /* opacity handled via CSS */
}
</script>

<style scoped>
.sticky-note {
  border: 1px solid transparent;
}
</style>
