import { h, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCanvasStore } from '@/stores'
import { useUIStore } from '@/stores/ui'
import { ChevronLeft, ChevronRight, CheckCircle, Keyboard } from 'lucide-vue-next'
import KeyboardShortcutsTable from '@/components/guide/KeyboardShortcutsTable.jsx'

const STEP_ICONS = ['🎉', '🖱️', '✏️', '🖐️', '🔍', '📤', '🎮', '✅']

export default {
  setup() {
    const router = useRouter()
    const canvasStore = useCanvasStore()
    const uiStore = useUIStore()

    const steps = [
      {
        id: 'welcome',
        title: '欢迎使用 CanvasPro',
        description: 'CanvasPro 是专业级个人商业画布工具，1:1 复刻 Canvanizer 体验。本教程将带你快速掌握核心操作。',
      },
      {
        id: 'create-note',
        title: '创建便利贴',
        description: '有三种方式创建便利贴：\n1. 双击画布任意空白处\n2. 双击区块内部空白处\n3. 点击区块右上角的 "+" 按钮\n\n新建的便利贴会自动聚焦标题输入框。',
      },
      {
        id: 'edit-note',
        title: '编辑便利贴',
        description: '单击便利贴的标题或内容区域即可进入编辑模式：\n- 支持富文本：加粗、斜体、下划线、列表\n- Enter 换行，Shift+Enter 快速提交\n- Esc 取消编辑，点击外部自动保存',
      },
      {
        id: 'drag-note',
        title: '拖拽移动便利贴',
        description: '按住便利贴左侧的色条进行拖拽：\n- 自由拖拽到画布任意位置\n- 拖拽跨越区块边界时，便利贴会自动归属新区块\n- 拖拽时显示对齐辅助线，松手自动吸附',
      },
      {
        id: 'viewport',
        title: '缩放与平移画布',
        description: '多种方式控制视野：\n- Ctrl + 滚轮 / 双指捏合：以鼠标为中心缩放\n- 空白处按住拖拽 / 空格 + 拖拽：平移画布\n- 双击画布空白处：重置视图 (100%)',
      },
      {
        id: 'export-share',
        title: '导出与分享',
        description: '工具栏提供完整导出功能：\n- PNG：1x/2x/3x 倍率\n- PDF：A4/A3 横纵向，文字可选中\n- Markdown / JSON：数据备份\n- 分享链接：只读预览 + 编辑副本',
      },
      {
        id: 'presentation',
        title: '演示模式与快捷键',
        description: '按 F 进入演示模式：隐藏 UI、←/→ 切换画布、Esc 退出。\n\n核心快捷键：\nN 新建 | Delete 删除 | Ctrl+S 快照\nCtrl+E 导出 | F 全屏 | Ctrl+0 重置视图',
      },
      {
        id: 'complete',
        title: '教程完成！',
        description: '你已掌握 CanvasPro 核心操作。点击"开始创作"进入编辑器开始你的第一张商业画布吧！',
      },
    ]

    const currentStep = ref(0)
    const showShortcuts = ref(false)

    function nextStep() {
      if (currentStep.value < steps.length - 1) {
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
      router.push('/canvas/new?template=business-model-canvas')
    }

    function toggleShortcuts() {
      showShortcuts.value = !showShortcuts.value
    }

    function handleKeydown(event) {
      if (event.key === 'ArrowRight' || event.key === ' ') nextStep()
      else if (event.key === 'ArrowLeft') prevStep()
      else if (event.key === 'Escape') skipGuide()
    }

    onMounted(function () {
      window.addEventListener('keydown', handleKeydown)
    })

    onUnmounted(function () {
      window.removeEventListener('keydown', handleKeydown)
    })

    return {
      currentStep,
      showShortcuts,
      steps,
      nextStep,
      prevStep,
      skipGuide,
      toggleShortcuts,
    }
  },
  render() {
    const self = this
    const total = this.steps.length
    const progressPercent = Math.round((this.currentStep / (total - 1)) * 100)

    // 进度条圆点
    const dots = this.steps.map(function (_, index) {
      const dotClass = 'w-2 h-2 rounded-full transition-all duration-300 ' +
        (index <= self.currentStep ? 'bg-primary-600' : 'bg-canvas-border')
      return h('div', { key: index, class: 'flex-1 flex justify-center' }, [
        h('div', { class: dotClass })
      ])
    })

    // 当前步骤内容
    const step = this.steps[this.currentStep]
    const icon = STEP_ICONS[this.currentStep] || '🎉'
    const isLast = this.currentStep === total - 1

    const iconBoxClass = 'inline-flex items-center justify-center w-16 h-16 rounded-2xl mx-auto mb-6 text-3xl ' +
      (isLast
        ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
        : 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400')

    // 主内容区
    const mainContent = h('div', { class: 'text-center' }, [
      h('div', { class: iconBoxClass }, icon),
      h('h2', { class: 'text-2xl md:text-3xl font-bold text-text mb-4' }, step.title),
      h('p', { class: 'text-text-muted max-w-2xl mx-auto whitespace-pre-line leading-relaxed' }, step.description),
    ])

    // 底部按钮
    const prevBtn = h('button', {
      onClick: this.prevStep,
      disabled: this.currentStep === 0,
      class: 'btn-secondary gap-2'
    }, [
      h(ChevronLeft, { class: 'w-4 h-4' }),
      '上一步'
    ])

    const stepCounter = h('div', { class: 'text-sm text-text-muted' },
      '步骤 ' + (this.currentStep + 1) + ' / ' + total)

    const nextBtnClass = isLast ? 'btn-primary gap-2' : 'btn-secondary gap-2'
    const nextBtnChildren = isLast
      ? [h(CheckCircle, { class: 'w-4 h-4' }), '开始创作']
      : ['下一步', h(ChevronRight, { class: 'w-4 h-4' })]

    const nextBtn = h('button', {
      onClick: this.nextStep,
      class: nextBtnClass
    }, nextBtnChildren)

    return h('div', { class: 'fixed inset-0 z-[100] flex flex-col bg-white dark:bg-gray-900' }, [
      // 顶栏
      h('header', { class: 'flex items-center justify-between px-4 py-3 border-b border-canvas-border shrink-0' }, [
        h('div', { class: 'flex items-center gap-3' }, [
          h('span', { class: 'text-lg font-semibold text-text' }, '交互教程'),
        ]),
        h('div', { class: 'flex items-center gap-2' }, [
          h('button', {
            onClick: this.toggleShortcuts,
            class: 'btn-ghost text-sm gap-1'
          }, [
            h(Keyboard, { class: 'w-4 h-4' }),
            ' 快捷键'
          ]),
          h('button', {
            onClick: this.skipGuide,
            class: 'btn-ghost text-sm'
          }, '跳过'),
        ]),
      ]),
      // 进度条
      h('div', { class: 'px-4 pt-3 shrink-0' }, [
        h('div', { class: 'h-1.5 bg-canvas-border rounded-full overflow-hidden relative' }, [
          h('div', {
            class: 'h-full bg-primary-600 transition-all duration-300 ease-out rounded-full',
            style: { width: progressPercent + '%' }
          }),
        ]),
        h('div', { class: 'flex mt-1' }, dots),
      ]),
      // 内容区
      h('main', { class: 'flex-1 overflow-y-auto p-4 md:p-8 flex items-center justify-center' }, [
        h('div', { class: 'max-w-3xl w-full animate-fade-in' }, mainContent),
      ]),
      // 底部导航
      h('footer', { class: 'flex items-center justify-between px-4 py-4 border-t border-canvas-border shrink-0' }, [
        prevBtn,
        stepCounter,
        nextBtn,
      ]),
      // 快捷键弹窗
      this.showShortcuts
        ? h(KeyboardShortcutsTable, { onClose: function () { self.showShortcuts = false } })
        : null,
    ])
  }
}