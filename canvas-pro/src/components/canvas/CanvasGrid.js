import { h, ref, computed, onMounted, onUnmounted } from 'vue'
import CanvasBlock from './CanvasBlock.js'
import { useCanvasStore } from '@/stores'

export default {
  components: {
    CanvasBlock,
  },
  setup() {
    const canvasStore = useCanvasStore()

    const containerRef = ref(null)
    const isPanning = ref(false)
    const panStart = ref({ x: 0, y: 0 })
    const viewportStart = ref({ x: 0, y: 0 })

    const blocks = computed(function () {
      const t = canvasStore.currentTemplate
      if (!t || !t.blocks) return []
      return t.blocks.slice().sort(function (a, b) {
        return a.order - b.order
      })
    })

    const notesByBlock = computed(function () {
      const map = new Map()
      const canvas = canvasStore.currentCanvas
      if (canvas) {
        canvas.notes.forEach(function (note) {
          if (!map.has(note.blockId)) map.set(note.blockId, [])
          map.get(note.blockId).push(note)
        })
        map.forEach(function (notes) {
          notes.sort(function (a, b) { return a.order - b.order })
        })
      }
      return map
    })

    function handleWheel(event) {
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault()
        const canvas = canvasStore.currentCanvas
        if (!canvas) return

        const vp = canvas.viewport
        const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1
        const newScale = Math.min(Math.max(vp.scale * zoomFactor, 0.25), 3)
        canvasStore.setViewport({ scale: newScale })
      }
    }

    function handlePointerDown(event) {
      if (event.button !== 0) return
      // 不拦截便利贴、按钮、输入框上的按下事件
      if (event.target.closest('.sticky-note, button, input, textarea, [contenteditable]')) return

      isPanning.value = true
      panStart.value = { x: event.clientX, y: event.clientY }
      const canvas = canvasStore.currentCanvas
      viewportStart.value = canvas
        ? { x: canvas.viewport.x, y: canvas.viewport.y }
        : { x: 0, y: 0 }
    }

    function handlePointerMove(event) {
      if (!isPanning.value) return
      const dx = event.clientX - panStart.value.x
      const dy = event.clientY - panStart.value.y
      canvasStore.setViewport({
        x: viewportStart.value.x + dx,
        y: viewportStart.value.y + dy,
      })
    }

    function handlePointerUp() {
      isPanning.value = false
    }

    function handleDoubleClick(event) {
      if (event.target.closest('.sticky-note, .canvas-block-inner')) return
      canvasStore.setViewport({ x: 0, y: 0, scale: 1 })
    }

    onMounted(function () {
      const el = containerRef.value
      if (el) {
        el.addEventListener('wheel', handleWheel, { passive: false })
      }
    })

    onUnmounted(function () {
      const el = containerRef.value
      if (el) {
        el.removeEventListener('wheel', handleWheel)
      }
    })

    function addNote(blockId) {
      canvasStore.addNote(blockId)
    }

    function handleNoteMoved(payload) {
      const canvas = canvasStore.currentCanvas
      if (!canvas) return
      const note = canvas.notes.find(function (n) { return n.id === payload.noteId })
      if (!note) return
      if (note.blockId === payload.targetBlockId) return

      const targetNotes = canvas.notes.filter(function (n) {
        return n.blockId === payload.targetBlockId
      })
      canvasStore.moveNote(payload.noteId, payload.targetBlockId, targetNotes.length)
    }

    return {
      containerRef,
      isPanning,
      blocks,
      notesByBlock,
      handlePointerDown,
      handlePointerMove,
      handlePointerUp,
      handleDoubleClick,
      addNote,
      handleNoteMoved,
    }
  },
  render() {
    const self = this
    const canvasStore = useCanvasStore()
    const canvas = canvasStore.currentCanvas
    const vp = canvas ? canvas.viewport : { x: 0, y: 0, scale: 1 }

    const containerClass = 'relative h-full w-full overflow-hidden bg-canvas-bg ' +
      (this.isPanning ? 'cursor-grabbing' : 'cursor-default')

    const blockNodes = this.blocks.map(function (block) {
      return h('CanvasBlock', {
        key: block.id,
        block: block,
        notes: self.notesByBlock.get(block.id) || [],
        presentationMode: false,
        onAddNote: self.addNote,
        onNoteMoved: self.handleNoteMoved,
      })
    })

    return h('div', {
      ref: 'containerRef',
      class: containerClass,
      onPointerdown: this.handlePointerDown,
      onPointermove: this.handlePointerMove,
      onPointerup: this.handlePointerUp,
      onPointerleave: this.handlePointerUp,
      onDblclick: this.handleDoubleClick,
    }, [
      h('div', {
        class: 'absolute top-0 left-0 p-6',
        style: {
          transform: 'translate(' + vp.x + 'px, ' + vp.y + 'px) scale(' + vp.scale + ')',
          transformOrigin: '0 0',
          width: '100%',
        },
      }, [
        h('div', {
          class: 'grid gap-4',
          style: {
            gridTemplateColumns: 'repeat(3, minmax(240px, 1fr))',
            maxWidth: '1200px',
            margin: '0 auto',
          },
          role: 'list',
          'aria-label': '画布区块',
        }, blockNodes),
      ]),
    ])
  }
}