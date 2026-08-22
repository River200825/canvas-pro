import { h, ref, computed } from 'vue'
import BlockHeader from './BlockHeader.js'
import StickyNote from './StickyNote.js'

export default {
  components: {
    BlockHeader,
    StickyNote,
  },
  props: {
    block: { type: Object, required: true },
    notes: { type: Array, default: function () { return [] } },
    presentationMode: { type: Boolean, default: false },
  },
  emits: ['add-note', 'note-moved'],
  setup(props) {
    const isCollapsed = ref(false)
    const isDragOver = ref(false)

    const sortedNotes = computed(function () {
      return props.notes.slice().sort(function (a, b) {
        return a.order - b.order
      })
    })

    return {
      isCollapsed,
      isDragOver,
      sortedNotes,
    }
  },
  methods: {
    handleDragOver(event) {
      if (this.presentationMode) return
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'
      this.isDragOver = true
    },
    handleDragLeave(event) {
      // 仅当离开整个区块时才移除高亮
      if (!event.currentTarget.contains(event.relatedTarget)) {
        this.isDragOver = false
      }
    },
    handleDrop(event) {
      this.isDragOver = false
      if (this.presentationMode) return
      event.preventDefault()
      const noteId = event.dataTransfer.getData('text/note-id')
      const sourceBlock = event.dataTransfer.getData('text/source-block')
      if (noteId && noteId !== '') {
        this.$emit('note-moved', {
          noteId: noteId,
          targetBlockId: this.block.id,
          sourceBlockId: sourceBlock,
        })
      }
    },
    toggleCollapse() {
      this.isCollapsed = !this.isCollapsed
    },
    addNote() {
      this.$emit('add-note', this.block.id)
    },
  },
  render() {
    const self = this

    const blockClass = 'flex flex-col min-h-[220px] rounded-xl border border-canvas-border shadow-block overflow-hidden transition-all duration-150 ' +
      (this.isDragOver ? 'ring-2 ring-primary-500 ring-offset-1' : '')

    const blockStyle = {
      borderTopColor: this.block.color || '#e2e8f0',
      borderTopWidth: '3px',
    }

    // 便利贴列表
    const noteNodes = this.sortedNotes.map(function (note) {
      return h('StickyNote', {
        key: note.id,
        note: note,
        presentationMode: self.presentationMode,
      })
    })

    // 空状态提示
    let emptyNode = null
    if (this.sortedNotes.length === 0 && !this.presentationMode) {
      emptyNode = h('div', {
        class: 'flex items-center justify-center border-2 border-dashed border-canvas-border rounded-lg text-text-muted text-xs p-4 m-2 cursor-pointer hover:border-primary-400 hover:text-primary-500 transition-colors',
        onClick: this.addNote,
        role: 'button',
        tabindex: 0,
      }, '双击或点击创建便利贴')
    }

    return h('div', {
      class: blockClass,
      style: blockStyle,
      role: 'listitem',
      'aria-label': this.block.title,
      onDragover: this.handleDragOver,
      onDragleave: this.handleDragLeave,
      onDrop: this.handleDrop,
    }, [
      h(BlockHeader, {
        block: this.block,
        noteCount: this.notes.length,
        collapsed: this.isCollapsed,
        presentationMode: this.presentationMode,
        onToggleCollapse: this.toggleCollapse,
        onAddNote: this.addNote,
      }),
      this.isCollapsed
        ? null
        : h('div', {
            class: 'flex-1 overflow-y-auto p-2 space-y-2 max-h-[400px] custom-scrollbar',
            role: 'list',
          }, noteNodes.concat(emptyNode ? [emptyNode] : [])),
    ])
  }
}