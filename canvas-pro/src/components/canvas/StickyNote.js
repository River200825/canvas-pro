import { h, ref, computed, nextTick } from 'vue'
import { Trash2, Copy, GripVertical, Palette, Check } from 'lucide-vue-next'
import { useCanvasStore } from '@/stores'
import { NOTE_COLORS, getNoteColor } from '@/types/note'

export default {
  props: {
    note: { type: Object, required: true },
    presentationMode: { type: Boolean, default: false },
  },
  setup(props) {
    const canvasStore = useCanvasStore()

    const isEditing = ref(false)
    const editTitle = ref('')
    const editContent = ref('')
    const showColorPicker = ref(false)
    const noteRef = ref(null)
    const titleInputRef = ref(null)

    const noteColor = computed(function () {
      return getNoteColor(props.note.color)
    })

    function startEdit() {
      if (props.presentationMode) return
      isEditing.value = true
      editTitle.value = props.note.title
      editContent.value = props.note.content
      nextTick(function () {
        if (titleInputRef.value) {
          titleInputRef.value.focus()
        }
      })
    }

    function saveEdit() {
      canvasStore.updateNote(props.note.id, {
        title: editTitle.value.trim(),
        content: editContent.value.trim(),
      })
      isEditing.value = false
    }

    function cancelEdit() {
      isEditing.value = false
    }

    function handleTitleKeydown(event) {
      if (event.key === 'Enter') {
        event.preventDefault()
        saveEdit()
      } else if (event.key === 'Escape') {
        cancelEdit()
      }
    }

    function handleContentKeydown(event) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        saveEdit()
      } else if (event.key === 'Escape') {
        cancelEdit()
      }
    }

    function deleteNote() {
      canvasStore.deleteNote(props.note.id)
    }

    function duplicateNote() {
      canvasStore.duplicateNote(props.note.id)
    }

    function selectColor(colorId) {
      canvasStore.updateNote(props.note.id, { color: colorId })
      showColorPicker.value = false
    }

    function handleDragStart(event) {
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/note-id', props.note.id)
      event.dataTransfer.setData('text/source-block', props.note.blockId || '')
      event.target.style.opacity = '0.4'
    }

    function handleDragEnd(event) {
      event.target.style.opacity = ''
    }

    return {
      isEditing,
      editTitle,
      editContent,
      showColorPicker,
      noteRef,
      titleInputRef,
      noteColor,
      startEdit,
      saveEdit,
      cancelEdit,
      handleTitleKeydown,
      handleContentKeydown,
      deleteNote,
      duplicateNote,
      selectColor,
      handleDragStart,
      handleDragEnd,
    }
  },
  render() {
    const self = this
    const color = this.noteColor

    // 颜色选择器
    let colorPickerNode = null
    if (this.showColorPicker) {
      const swatches = NOTE_COLORS.map(function (c) {
        const selected = c.id === self.note.color
        const swatchClass = 'w-6 h-6 rounded-lg border-2 transition-all hover:scale-110' +
          (selected ? ' ring-2 ring-primary-500 ring-offset-1' : '')
        return h('button', {
          key: c.id,
          class: swatchClass,
          style: { backgroundColor: c.bg, borderColor: c.border },
          onClick: function (e) {
            e.stopPropagation()
            self.selectColor(c.id)
          },
          'aria-label': c.id,
        })
      })
      colorPickerNode = h('div', {
        class: 'absolute right-2 top-8 z-20 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-canvas-border p-2 flex gap-1',
        onClick: function (e) { e.stopPropagation() }
      }, swatches)
    }

    // 操作按钮组（悬停显示）
    let actionsNode = null
    if (!this.presentationMode) {
      actionsNode = h('div', { class: 'flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0' }, [
        h('button', {
          onClick: function () { self.showColorPicker = !self.showColorPicker },
          class: 'p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-text-muted',
          'aria-label': '更改颜色',
        }, [h(Palette, { class: 'h-3.5 w-3.5' })]),
        h('button', {
          onClick: self.duplicateNote,
          class: 'p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-text-muted',
          'aria-label': '复制',
        }, [h(Copy, { class: 'h-3.5 w-3.5' })]),
        h('button', {
          onClick: self.deleteNote,
          class: 'p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-text-muted hover:text-red-500',
          'aria-label': '删除',
        }, [h(Trash2, { class: 'h-3.5 w-3.5' })]),
      ])
    }

    // 标题区
    let titleNode
    if (this.isEditing) {
      titleNode = h('input', {
        ref: 'titleInputRef',
        value: this.editTitle,
        onInput: function (e) { self.editTitle = e.target.value },
        onKeydown: self.handleTitleKeydown,
        onBlur: self.saveEdit,
        class: 'w-full text-sm font-semibold bg-transparent focus:outline-none text-text',
        placeholder: '标题...',
        'aria-label': '便利贴标题',
      })
    } else {
      titleNode = h('div', {
        class: 'flex-1 min-w-0 font-semibold text-sm text-text truncate cursor-text',
        onClick: self.startEdit,
      }, this.note.title || '无标题')
    }

    // 内容区
    let contentNode
    if (this.isEditing) {
      contentNode = h('textarea', {
        value: this.editContent,
        onInput: function (e) { self.editContent = e.target.value },
        onKeydown: self.handleContentKeydown,
        class: 'w-full text-sm bg-transparent focus:outline-none resize-none text-text mt-1',
        placeholder: '内容...',
        rows: 3,
        'aria-label': '便利贴内容',
      })
    } else {
      contentNode = h('div', {
        class: 'text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words mt-1 line-clamp-4 cursor-text',
        onClick: self.startEdit,
      }, this.note.content || '')
    }

    // 拖拽手柄
    let dragHandle = null
    if (!this.presentationMode) {
      dragHandle = h('div', {
        class: 'absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing',
        draggable: true,
        onDragstart: self.handleDragStart,
        onDragend: self.handleDragEnd,
        'aria-label': '拖拽移动',
        title: '拖拽移动到其他区块',
      }, [
        h(GripVertical, { class: 'h-4 w-4 text-text-muted' }),
      ])
    }

    return h('div', {
      ref: 'noteRef',
      draggable: !this.presentationMode,
      onDragstart: this.handleDragStart,
      onDragend: this.handleDragEnd,
      class: 'sticky-note relative group rounded-lg shadow-note hover:shadow-note-hover transition-all duration-150 p-2.5 pl-3.5',
      style: {
        backgroundColor: color.bg,
        borderColor: color.border,
      },
      'data-note-id': this.note.id,
      role: 'listitem',
      'aria-label': this.note.title || '无标题便利贴',
    }, [
      // 左侧色条
      h('div', {
        class: 'absolute left-0 top-0 bottom-0 w-1 rounded-l-lg',
        style: { backgroundColor: color.border },
      }),
      dragHandle,
      h('div', { class: 'flex items-start gap-1' }, [
        titleNode,
        actionsNode,
      ]),
      contentNode,
      colorPickerNode,
    ])
  }
}