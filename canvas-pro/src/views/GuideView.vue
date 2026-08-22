<script lang="ts>
import { h, ref, computed, onMounted, onUnmounted, defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useCanvasStore } from '@/stores'
import { useUIStore } from '@/stores/ui'
import { ChevronLeft, ChevronRight, X, CheckCircle, MousePointerClick, Move, Maximize2, Download, Share2, Palette, Keyboard } from 'lucide-vue-next'
import GuideStep from '@/components/guide/GuideStep.vue'
import KeyboardShortcutsTable from '@/components/guide/KeyboardShortcutsTable.vue'

export default defineComponent({
  components: {
    GuideStep,
    KeyboardShortcutsTable,
  },
  setup() {
    const router = useRouter()
    const canvasStore = useCanvasStore()
    const uiStore = useUIStore()

    const currentStep = ref(0)
    const showShortcuts = ref(false)

    const steps = [
      {
        id: 'welcome',
        title: '欢迎使用 CanvasPro',
        description: 'CanvasPro 是专业级个人商业画布工具，1:1 复刻 Canvanizer 体验。本教程将带你快速掌握核心操作。',
        icon: 'welcome',
        canSkip: true,
      },
      {
        id: 'create-note',
        title: '创建便利贴',
        description: '有三种方式创建便利贴：\n1. 双击画布任意空白处\n2. 双击区块内部空白处\n3. 点击区块右上角的 "+" 按钮\n\n新建的便利贴会自动聚焦标题输入框。',
        icon: 'create',
        canSkip: true,
      },
      {
        id: 'edit-note',
        title: '编辑便利贴',
        description: '单击便利贴的标题或内容区域即可进入编辑模式：\n- 支持富文本：加粗、斜体、下划线、列表\n- Enter 换行，Shift+Enter 快速提交\n- Esc 取消编辑，点击外部自动保存\n- 工具栏会在编辑时浮现',
        icon: 'edit',
        canSkip: true,
      },
      {
        id: 'drag-note',
        title: '拖拽移动便利贴',
        description: '按住便利贴左侧的色条进行拖拽：\n- 自由拖拽到画布任意位置\n- 拖拽跨越区块边界时，便利贴会自动归属新区块\n- 拖拽时显示红色对齐辅助线，松手自动吸附\n- 右下角拖拽手柄可调整宽高',
        icon: 'drag',
        canSkip: true,
      },
      {
        id: 'viewport',
        title: '缩放与平移画布',
        description: '多种方式控制视野：\n- Ctrl + 滚轮 / 双指捏合：以鼠标/手指为中心缩放\n- 空白处按住拖拽 / 空格 + 拖拽：平移画布\n- 双击画布空白处：重置视图 (100%, 居中)\n- 工具栏缩放按钮：+/- / 重置',
        icon: 'viewport',
        canSkip: true,
      },
      {
        id: 'export-share',
        title: '导出与分享',
        description: '工具栏右侧提供完整导出功能：\n- PNG：1x/2x/3x 倍率，可选背景色\n- PDF：A4/A3 横纵向，文字可选中，矢量质量\n- Markdown：结构化文档，便于整合\n- JSON：完整数据备份，可跨设备导入\n- 分享链接：Base64 编码，打开即只读预览，含"编辑副本"按钮',
        icon: 'export',
        canSkip: true,
      },
      {
        id: 'presentation',
        title: '演示模式与快捷键',
        description: '按 F 或点击工具栏全屏按钮进入演示模式：\n- 隐藏所有 UI，仅留画布\n- ← / → 切换画布\n- Esc 退出\n\n核心快捷键：\nN 新建便利贴  |  Delete 删除  |  Ctrl+S 快照\nCtrl+E 导出  |  F 全屏  |  Ctrl+0 重置视图\n? 查看完整快捷键表',
        icon: 'presentation',
        canSkip: true,
      },
      {
        id: 'complete',
        title: '教程完成！',
        description: '你已掌握 CanvasPro 核心操作。现在可以：\n1. 点击"开始创作"跳转编辑器\n2. 点击"查看快捷键"查看完整映射表\n3. 点击"返回首页"查看案例库\n\n祝你创作愉快！',
        icon: 'complete',
        canSkip: false,
      },
    ]

    const completedSteps = ref<Set<number>>(new Set())
    const showShortcuts = ref(false)

    function nextStep() {
      if (currentStep.value < steps.length - 1) {
        completedSteps.value.add(currentStep.value)
        currentStep.value++
      } else {
        completeGuide()
      }
    }

    function prevStep() {
      if (currentStep.value > 0) {
        currentStep.value--
      }
    }

    function skipGuide() {
      completeGuide()
    }

    function completeGuide() {
      localStorage.setItem('guideShown', 'true')
      uiStore.showGuide = false
      router.push('/canvas/new?template=business-model-canvas')
    }

    function toggleShortcuts() {
      showShortcuts.value = !showShortcuts.value
    }

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === 'ArrowRight' || event.key === ' ') nextStep()
      else if (event.key === 'ArrowLeft') prevStep()
      else if (event.key === 'Escape') skipGuide()
    }

    onMounted(() => {
      window.addEventListener('keydown', handleKeydown)
    })

    onUnmounted(() => {
      window.removeEventListener('keydown', handleKeydown)
    })

    return {
      currentStep,
      showShortcuts,
      steps,
      completedSteps,
      nextStep,
      prevStep,
      skipGuide,
      completeGuide,
      toggleShortcuts,
    }
  },
  render() {
    return h('div', { class: 'fixed inset-0 z-[100] flex flex-col bg-white dark:bg-gray-900' }, [
      h('header', { class: 'flex items-center justify-between px-4 py-3 border-b border-canvas-border bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shrink-0' }, [
        h('div', { class: 'flex items-center gap-3' }, [
          h('svg', { class: 'w-8 h-8 text-primary-600', viewBox: '0 0 32 32', fill: 'none' }, [
            h('rect', { width: '32', height: '32', rx: '6', fill: '#0ea5e9' }),
            h('path', { d: 'M8 10h16M8 16h12M8 22h8', stroke: 'white', strokeWidth: '2.5', strokeLinecap: 'round' }),
            h('rect', { x: '8', y: '10', width: '4', height: '4', rx: '1', fill: 'white', opacity: '0.3' }),
            h('rect', { x: '8', y: '16', width: '4', height: '4', rx: '1', fill: 'white', opacity: '0.3' }),
          ]),
          h('span', { class: 'text-lg font-semibold text-text' }, '交互教程'),
        ]),
        h('div', { class: 'flex items-center gap-2' }, [
          h('button', { onClick: () => this.toggleShortcuts(), class: 'btn-ghost text-sm gap-1' }, [
            h(Keyboard, { class: 'w-4 h-4' }),
            ' 快捷键'
          ]),
          h('button', { onClick: () => this.skipGuide(), class: 'btn-ghost text-sm' }, '跳过'),
        ]),
      ]),
      h('div', { class: 'h-1 bg-canvas-border shrink-0 relative overflow-hidden' }, [
        h('div', { class: 'h-full bg-primary-600 transition-all duration-300 ease-out', style: { width: `${((this.currentStep) / (this.steps.length - 1)) * 100}%` } }),
        h('div', { class: 'absolute top-0 left-0 right-0 bottom-0 flex' }, [
          this.steps.map((_, index) => h('div', { key: index, class: 'flex-1 relative' }, [
            h('div', { class: 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full transition-all duration-300', class: index <= this.currentStep ? 'bg-primary-600' : 'bg-canvas-border', class: index < this.currentStep ? 'ring-2 ring-primary-600 ring-offset-2 ring-offset-white dark:ring-offset-gray-900' : '' }),
          ])),
        ]),
      ]),
      h('main', { class: 'flex-1 overflow-y-auto p-4 md:p-8' }, [
        h('div', { class: 'max-w-3xl mx-auto' }, [
          this.steps.map((step, index) => h(GuideStep, {
            key: step.id,
            step,
            index,
            isActive: index === this.currentStep,
            isCompleted: this.completedSteps.has(index),
            total: this.steps.length,
          })),
        ]),
      ]),
      h('footer', { class: 'flex items-center justify-between px-4 py-4 border-t border-canvas-border bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shrink-0' }, [
        h('button', { onClick: () => this.prevStep(), class: 'btn-secondary gap-2', disabled: this.currentStep === 0 }, [
          h(ChevronLeft, { class: 'w-4 h-4' }),
          '上一步',
        ]),
        h('div', { class: 'flex items-center gap-2 text-sm text-text-muted' }, '步骤 ' + (this.currentStep + 1) + ' / ' + this.steps.length),
        h('button', { onClick: () => this.nextStep(), class: this.currentStep === this.steps.length - 1 ? 'btn-primary' : 'btn-secondary', class: 'gap-2' }, [
          this.currentStep === this.steps.length - 1 ? '开始创作' : '下一步',
          h(ChevronRight, { vIf: this.currentStep < this.steps.length - 1, class: 'w-4 w-4' }),
          h(CheckCircle, { vElse: true, class: 'w-4 w-4' }),
        ]),
      ]),
      h('div', { vIf: this.showShortcuts, class: 'fixed inset-0 z-50 flex items-center justify-center bg-black opacity-50 backdrop-blur-sm animate-fade-in' }, [
        h(KeyboardShortcutsTable, { onClose: () => this.showShortcuts = false }),
      ]),
    ])
  }
}
</script>