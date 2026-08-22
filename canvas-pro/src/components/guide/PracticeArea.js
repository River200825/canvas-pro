import { h, ref, computed } from 'vue'
import { useCanvasStore } from '@/stores'
import { useUIStore } from '@/stores/ui'
import { MousePointerClick, Edit, Move, Maximize2, Download, Share2, Palette, Keyboard, Sparkles, CheckCircle } from 'lucide-vue-next'

export default {
  props: {
    stepId: String,
  },
  setup() {
    const canvasStore = useCanvasStore()
    const uiStore = useUIStore()

    const practiceCompleted = ref(false)

    const practiceContent = computed(() => {
      switch (props.stepId) {
        case 'create-note':
          return {
            title: '尝试创建便利贴',
            instruction: '双击下方画布区域的空白处，或点击区块右上角的 "+" 按钮',
            action: 'create',
            canvasMode: true,
          }
        case 'edit-note':
          return {
            title: '尝试编辑便利贴',
            instruction: '点击下方便利贴的标题或内容区域进行编辑，按 Esc 取消，点击外部保存',
            action: 'edit',
            canvasMode: true,
          }
        case 'drag-note':
          return {
            title: '尝试拖拽便利贴',
            instruction: '按住下方便利贴左侧的色条拖拽移动，尝试跨区块拖拽',
            action: 'drag',
            canvasMode: true,
          }
        case 'viewport':
          return {
            title: '尝试缩放和平移',
            instruction: '按住 Ctrl + 滚轮缩放，空白处拖拽平移，双击空白处重置',
            action: 'viewport',
            canvasMode: true,
          }
        case 'export-share':
          return {
            title: '了解导出功能',
            instruction: '点击工具栏右侧的"导出"按钮查看支持的格式（无需实际导出）',
            action: 'export',
            canvasMode: false,
          }
        case 'presentation':
          return {
            title: '尝试演示模式',
            instruction: '按 F 键或点击工具栏全屏按钮进入演示模式，按 Esc 退出',
            action: 'presentation',
            canvasMode: false,
          }
        default:
          return null
      }
    })

    function handlePracticeAction() {
      practiceCompleted.value = true
    }
  },
  render() {
    if (!this.practiceContent) {
      return null
    }

    return h('div', { class: 'space-y-4' }, [
      h('div', { class: 'flex items-start gap-3 p-3 rounded-lg border border-canvas-border bg-white dark:bg-gray-800' }, [
        h('div', { class: 'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-primary-100 dark:bg-primary-900 opacity-30' }, [
          h(Sparkles, { class: 'w-5 h-5 text-primary-600' }),
        ]),
        h('div', { class: 'flex-1' }, [
          h('p', { class: 'font-medium text-text' }, this.practiceContent.title),
          h('p', { class: 'text-sm text-text-muted mt-1 whitespace-pre-line' }, this.practiceContent.instruction),
        ]),
      ]),

      h('div', { vIf: this.practiceContent.canvasMode, class: 'relative' }, [
        h('div', { class: 'aspect-video bg-canvas-bg rounded-xl border border-canvas-border overflow-hidden relative' }, [
          h('div', { class: 'absolute inset-0 flex items-center justify-center pointer-events-none' }, [
            h('div', { class: 'text-center p-4' }, [
              h('p', { class: 'text-text-muted mb-2' }, '练习区域（实际操作请在编辑器中进行）'),
              h('p', { class: 'text-xs text-text-muted' }, '此处为演示，实际操作请完成教程后在编辑器中体验'),
            ]),
          ]),
        ]),
      ]),

      h('div', { vElse: true, class: 'text-center py-4' }, [
        h('p', { class: 'text-text-muted mb-3' }, '该步骤无需在练习区操作，请在完成教程后进入编辑器体验'),
      ]),

      h('button', {
        onClick: this.handlePracticeAction,
        disabled: this.practiceCompleted,
        class: 'btn-primary w-full',
      }, [
        h(CheckCircle, { vIf: this.practiceCompleted, class: 'w-4 h-4 mr-2' }),
        this.practiceCompleted ? '已完成练习' : '我已理解，继续下一步',
      ]),
    ]),
  },
}
</script>