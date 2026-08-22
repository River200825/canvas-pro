import { h, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCanvasStore } from '@/stores'
import CanvasGrid from '@/components/canvas/CanvasGrid.js'
import Toolbar from '@/components/toolbar/Toolbar.js'

export default {
  components: {
    CanvasGrid,
    Toolbar,
  },
  setup() {
    const route = useRoute()
    const canvasStore = useCanvasStore()

    onMounted(function () {
      const templateId = route.query.template
      const id = route.params.id
      if (!canvasStore.currentCanvas || canvasStore.currentCanvasId !== id) {
        if (id === 'new') {
          canvasStore.createCanvas(undefined, templateId)
        } else {
          canvasStore.switchCanvas(id)
        }
      }
    })

    return {}
  },
  render() {
    return h('div', { class: 'h-screen w-screen overflow-hidden bg-canvas-bg' }, [
      h(Toolbar),
      h('div', {
        class: 'absolute inset-0 top-[52px]',
        'data-canvas-area': true,
      }, [
        h(CanvasGrid),
      ]),
    ])
  },
}