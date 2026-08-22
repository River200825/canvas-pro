import { defineComponent, h, onMounted } from 'vue'
import { useCanvasStore } from '@/stores'

export default defineComponent({
  setup() {
    const canvasStore = useCanvasStore()

    onMounted(() => {
      canvasStore.init()
    })

    return () => h('div', { class: 'min-h-screen bg-canvas-bg' }, 'Test')
  }
})