import { h, computed } from 'vue'
import { CheckCircle, MousePointerClick, Edit, Move, Maximize2, Download, Share2, Palette, Keyboard, Sparkles, CheckCircle2 } from 'lucide-vue-next'
import PracticeArea from './PracticeArea.js'

export default {
  components: {
    PracticeArea,
  },
  setup() {
    const props = defineProps({
      step: {
        id: String,
        title: String,
        description: String,
        icon: String,
        canSkip: Boolean,
      },
      index: Number,
      isActive: Boolean,
      isCompleted: Boolean,
      total: Number,
    })

    const iconMap = {
      welcome: Sparkles,
      create: MousePointerClick,
      edit: Edit,
      drag: Move,
      viewport: Maximize2,
      export: Download,
      presentation: Keyboard,
      complete: CheckCircle2,
    }

    const Icon = computed(() => iconMap[props.step.icon] || Sparkles)

    const stepIcons = [
      { icon: MousePointerClick, label: '创建' },
      { icon: Edit, label: '编辑' },
      { icon: Move, label: '拖拽' },
      { icon: Maximize2, label: '视野' },
      { icon: Download, label: '导出' },
      { icon: Keyboard, label: '演示' },
    ]

    const stepIndicatorClass = (i) => {
      if (i < props.index) return 'bg-green-100 dark:bg-green-900 opacity-30 text-green-600 dark:text-green-400'
      if (i === props.index) return 'bg-primary-100 dark:bg-primary-900 opacity-30 text-primary-600 dark:text-primary-400 ring-2 ring-primary-500'
      return 'bg-gray-100 dark:bg-gray-800 text-gray-400'
    }

    const stepIconWrapperClass = (i) => 'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ' + stepIndicatorClass(i)

    return {
      stepIconWrapperClass,
    }
  },
  render() {
    if (!this.isActive && !this.isCompleted) {
      return null
    }

    const indicatorDivs = this.stepIcons.map((s, i) => h('div', { key: i, class: 'flex flex-col items-center gap-1' }, [
      h('div', { class: 'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ' + this.stepIconWrapperClass(i) }, [
        h('component', { is: s.icon, class: i < this.props.index ? 'w-5 h-5' : 'w-5 h-5' }),
      ]),
      h('span', { class: 'text-xs text-text-muted' }, s.label),
    ))

    const indicatorDivsWithSeparators = []
    this.stepIcons.forEach((s, i) => {
      indicatorDivs.push(h('div', { key: i, class: 'flex flex-col items-center gap-1' }, [
        h('div', { class: 'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ' + this.stepIconWrapperClass(i) }, [
          h('component', { is: s.icon, class: i < this.props.index ? 'w-5 h-5' : 'w-5 h-5' }),
        ]),
        h('span', { class: 'text-xs text-text-muted' }, s.label),
      ])
      if (i < this.stepIcons.length - 1) {
        indicatorDivs.push(h('div', { class: 'w-16 h-0.5 bg-canvas-border mx-1' }))
      }
    })

    if (!this.isActive && !this.isCompleted) {
      return null
    }

    return h('div', {
      class: 'animate-fade-in',
      class: { 'opacity-0 pointer-events-none': !this.isActive && !this.isCompleted },
    }, [
      h('div', { class: 'text-center mb-8' }, [
        h('div', {
          class: 'inline-flex items-center justify-center w-16 h-16 rounded-2xl mx-auto mb-6 transition-all duration-300',
          class: this.isCompleted ? 'bg-green-100 dark:bg-green-900 opacity-30 text-green-600 dark:text-green-400' :
                 this.isActive ? 'bg-primary-100 dark:bg-primary-900 opacity-30 text-primary-600 dark:text-primary-400' :
                 'bg-gray-100 dark:bg-gray-800 text-gray-400',
        }, [
          h('component', { is: this.Icon, class: 'w-8 h-8' }),
        ]),
        h('h2', { class: 'text-2xl md:text-3xl font-bold text-text mb-2' }, this.step.title),
        h('p', { class: 'text-text-muted max-w-2xl mx-auto whitespace-pre-line leading-relaxed' }, this.step.description),
      ]),
      h('div', { class: 'flex items-center justify-center gap-2 mb-8' }, [
        this.stepIcons.map((s, i) => h('div', { key: i, class: 'flex flex-col items-center gap-1' }, [
          h('div', { class: 'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ' + this.stepIconWrapperClass(i) }, [
            h('component', { is: s.icon, class: i < this.props.index ? 'w-5 h-5' : 'w-5 h-5' }),
          ]),
          h('span', { class: 'text-xs text-text-muted' }, s.label),
        ]),
        i < this.stepIcons.length - 1 ? h('div', { class: 'w-16 h-0.5 bg-canvas-border mx-1' }) : null,
      ]),
      h('div', { vIf: this.isActive, class: 'mt-8 p-4 rounded-xl border border-canvas-border bg-gray-50 dark:bg-gray-800 opacity-50' }, [
        h('h3', { class: 'font-medium text-text mb-3 flex items-center gap-2' }, [
          h(Sparkles, { class: 'w-5 h-5 text-primary-600' }),
          '动手练习',
        ]),
        h(PracticeArea, { 'step-id': this.step.id }),
      ]),
    ])
  },
}
