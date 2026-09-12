<template>
  <div
    ref="noteRootRef"
    class="sticky-note relative group rounded-lg shadow-note hover:shadow-note-hover transition-all duration-150 p-2.5 pl-3.5 select-none"
    :class="{
      'opacity-60': note.locked,
      'ring-2 ring-primary-500 ring-offset-1': isSelected,
      'cursor-grab active:cursor-grabbing': canDrag,
      'z-20': noteDrag.active && noteDrag.id === note.id,
    }"
    :style="{
      backgroundColor: color.bg,
      borderColor: color.border,
      ...(noteDrag.active && noteDrag.id === note.id ? { transform: `translate3d(${dragDx}px, ${dragDy}px, 0) rotate(2deg)`, boxShadow: '0 20px 40px rgba(0,0,0,0.2)', opacity: '0.9' } : {}),
    }"
    :data-note-id="note.id"
    role="listitem"
    :aria-label="note.title || '无标题便利贴'"
    @pointerdown="handlePointerDown"
    @pointermove="handlePointerMove"
    @pointerup="handlePointerUp"
    @pointercancel="handlePointerCancel"
    @focusout="handleFocusOut"
    @click="handleClick"
    @contextmenu.prevent="handleContextMenu"
  >
    <div
      class="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg opacity-70"
      :style="{ backgroundColor: color.border }"
    />

    <!-- 选中/悬停操作条（C2）：选中时常驻可见 -->
    <div
      v-if="!presentationMode"
      class="absolute top-1 right-1 flex items-center gap-0.5 bg-white/90 dark:bg-gray-800/90 rounded-md shadow-sm border border-canvas-border/60 px-0.5 transition-opacity"
      :class="isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100'"
      @click.stop
      @pointerdown.stop
    >
      <button
        v-if="!isEditing"
        class="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-text-muted"
        aria-label="编辑便利贴"
        title="编辑"
        @click.stop="startEdit()"
      >
        <Pencil class="h-3.5 w-3.5" />
      </button>
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

    <div class="flex items-start gap-1 mt-4" :class="{ '!mt-0': presentationMode }">
      <input
        v-if="isEditing"
        ref="titleInputRef"
        v-model="editTitle"
        class="w-full text-sm font-semibold bg-transparent focus:outline-none text-text"
        placeholder="输入标题..."
        aria-label="便利贴标题"
        @keydown="handleTitleKeydown"
        @compositionstart="composing = true"
        @compositionend="composing = false"
      />
      <div
        v-else
        class="flex-1 min-w-0 font-semibold text-sm text-text truncate cursor-text"
        title="点击编辑标题"
        @click="startEdit()"
      >
        {{ note.title || '无标题' }}
      </div>
    </div>

    <textarea
      v-if="isEditing"
      ref="contentInputRef"
      v-model="editContent"
      class="w-full text-sm bg-transparent focus:outline-none resize-none text-text mt-1"
      placeholder="输入内容..."
      rows="3"
      aria-label="便利贴内容"
      @keydown="handleContentKeydown"
      @compositionstart="composing = true"
      @compositionend="composing = false"
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
      @pointerdown.stop
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
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { Copy, Lock, LockOpen, Palette, Pencil, Trash2 } from 'lucide-vue-next'
import { useCanvasStore } from '@/stores'
import { NOTE_COLORS, getNoteColor, type NoteColorId, type StickyNote as StickyNoteType } from '@/types/note'
import { activePointers, editRequest, noteDrag, openNoteContextMenu, resetNoteDrag } from './noteInteraction'

const props = defineProps<{
  note: StickyNoteType
  presentationMode?: boolean
}>()

const canvasStore = useCanvasStore()

const isEditing = ref(false)
const editTitle = ref('')
const editContent = ref('')
const showColorPicker = ref(false)
const composing = ref(false)
const noteRootRef = ref<HTMLElement | null>(null)
const titleInputRef = ref<HTMLInputElement | null>(null)
const contentInputRef = ref<HTMLTextAreaElement | null>(null)

/** Pointer 拖拽内部状态（D2） */
let dragPointerId: number | null = null
let dragStartX = 0
let dragStartY = 0
let dragLastX = 0
let dragLastY = 0
const dragDx = ref(0)
const dragDy = ref(0)

const color = computed(() => getNoteColor(props.note.color))

const isSelected = computed(() => canvasStore.selectedIds.includes(props.note.id))

const canDrag = computed(
  () => !props.presentationMode && !props.note.locked && !isEditing.value
)

function select(): void {
  if (props.presentationMode) return
  canvasStore.selectOnly(props.note.id)
}

function handleClick(event: MouseEvent): void {
  if (noteDrag.moved) {
    noteDrag.moved = false
    return
  }
  if (props.presentationMode) return

  // C4：修饰键多选
  if (event.ctrlKey || event.metaKey) {
    canvasStore.toggleSelect(props.note.id)
    return
  }
  if (event.shiftKey) {
    selectRangeTo(event)
    return
  }
  canvasStore.selectOnly(props.note.id)
}

/** Shift+点击：同区块内范围多选 */
function selectRangeTo(_event: MouseEvent): void {
  const canvas = canvasStore.currentCanvas
  if (!canvas) return
  const siblings = canvas.notes
    .filter(n => n.blockId === props.note.blockId)
    .sort((a, b) => a.order - b.order)
  const anchorId = canvasStore.selectedIds.find(id => siblings.some(s => s.id === id))
  const anchorIndex = anchorId ? siblings.findIndex(s => s.id === anchorId) : -1
  const targetIndex = siblings.findIndex(s => s.id === props.note.id)
  if (anchorIndex === -1 || targetIndex === -1) {
    canvasStore.selectOnly(props.note.id)
    return
  }
  const [from, to] = anchorIndex <= targetIndex ? [anchorIndex, targetIndex] : [targetIndex, anchorIndex]
  canvasStore.setSelection(siblings.slice(from, to + 1).map(s => s.id))
}

function handleContextMenu(event: MouseEvent): void {
  if (props.presentationMode) return
  if (!canvasStore.selectedIds.includes(props.note.id)) {
    canvasStore.selectOnly(props.note.id)
  }
  openNoteContextMenu(props.note, event.clientX, event.clientY)
}

function startEdit(focusContent = false): void {
  if (props.presentationMode || props.note.locked) return
  noteDrag.moved = false
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
  if (composing.value) return
  const next = event.relatedTarget as Node | null
  if (next && noteRootRef.value?.contains(next)) return
  if (!next) {
    const snapshot = { editing: isEditing.value }
    setTimeout(() => {
      if (!snapshot.editing) return
      if (document.activeElement && noteRootRef.value?.contains(document.activeElement)) return
      saveEdit()
    }, 0)
    return
  }
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

// A4：中文输入法组合期间，Enter/Esc 属于选词操作，不触发提交/取消
function isComposingEvent(event: KeyboardEvent): boolean {
  return composing.value || event.isComposing
}

function handleTitleKeydown(event: KeyboardEvent): void {
  if (isComposingEvent(event)) return
  if (event.key === 'Enter') {
    event.preventDefault()
    titleInputRef.value?.blur()
  } else if (event.key === 'Escape') {
    cancelEdit()
  }
}

function handleContentKeydown(event: KeyboardEvent): void {
  if (isComposingEvent(event)) return
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    saveEdit()
  } else if (event.key === 'Escape') {
    cancelEdit()
  }
}

function deleteNote(): void {
  if (props.note.locked) return
  // 多选状态下删除全部选中项
  if (canvasStore.selectedIds.length > 1 && isSelected.value) {
    canvasStore.deleteNotes([...canvasStore.selectedIds])
    return
  }
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

// ============ Pointer 拖拽（D2，桌面/触屏通用） ============

function isInteractiveTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null
  return !!el?.closest?.('button, input, textarea, [contenteditable], .color-picker')
}

function handlePointerDown(event: PointerEvent): void {
  noteDrag.moved = false
  activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY })

  if (!canDrag.value) return
  if (event.button !== 0 && event.pointerType === 'mouse') return
  if (isInteractiveTarget(event.target)) return

  dragPointerId = event.pointerId
  dragStartX = dragLastX = event.clientX
  dragStartY = dragLastY = event.clientY
  noteRootRef.value?.setPointerCapture(event.pointerId)
}

function handlePointerMove(event: PointerEvent): void {
  if (activePointers.has(event.pointerId)) {
    activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
  }
  if (dragPointerId !== event.pointerId) return

  // 第二根手指按下 → 让位给捏合缩放（D1）
  if (activePointers.size >= 2) {
    cancelDrag()
    return
  }

  const dx = event.clientX - dragStartX
  const dy = event.clientY - dragStartY

  if (!noteDrag.active) {
    if (Math.hypot(dx, dy) < 6) return
    if (props.note.locked || props.presentationMode) return
    noteDrag.active = true
    noteDrag.id = props.note.id
    noteDrag.moved = true
    document.body.classList.add('select-none')
  }

  event.preventDefault()
  dragDx.value = event.clientX - dragStartX
  dragDy.value = event.clientY - dragStartY
  void dragLastX
  void dragLastY
  dragLastX = event.clientX
  dragLastY = event.clientY

  // 高亮拖拽悬停的区块
  const el = document.elementFromPoint(event.clientX, event.clientY)
  const blockEl = el?.closest('[data-block-id]') as HTMLElement | null
  noteDrag.overBlockId = blockEl?.dataset.blockId ?? null
}

function handlePointerUp(event: PointerEvent): void {
  activePointers.delete(event.pointerId)
  if (dragPointerId !== event.pointerId) return
  dragPointerId = null
  noteRootRef.value?.releasePointerCapture?.(event.pointerId)
  document.body.classList.remove('select-none')

  if (noteDrag.active && noteDrag.id === props.note.id) {
    const targetBlockId = noteDrag.overBlockId
    if (targetBlockId && targetBlockId !== (props.note.blockId ?? '')) {
      canvasStore.moveNote(props.note.id, targetBlockId)
    }
    resetNoteDrag()
  }

  dragDx.value = 0
  dragDy.value = 0
}

function handlePointerCancel(event: PointerEvent): void {
  activePointers.delete(event.pointerId)
  if (dragPointerId === event.pointerId) {
    dragPointerId = null
    cancelDrag()
  }
}

function cancelDrag(): void {
  dragPointerId = null
  dragDx.value = 0
  dragDy.value = 0
  document.body.classList.remove('select-none')
  resetNoteDrag()
}

// B3：由 + 按钮 / 虚线区 / N 键新建的便利贴自动进入编辑态
onMounted(() => {
  if (canvasStore.pendingEditNoteId === props.note.id) {
    canvasStore.pendingEditNoteId = null
    if (!props.presentationMode && !props.note.locked) {
      startEdit()
    }
  }
})

// C3：右键菜单「编辑」请求
watch(
  () => editRequest.seq,
  () => {
    if (editRequest.id === props.note.id) {
      editRequest.id = null
      startEdit()
    }
  }
)
</script>

<style scoped>
.sticky-note {
  border: 1px solid transparent;
  touch-action: pan-y;
}

.sticky-note:has(input:focus),
.sticky-note:has(textarea:focus) {
  touch-action: auto;
  user-select: text;
}
</style>
