import { h } from 'vue'
import { ChevronDown, Plus } from 'lucide-vue-next'

export default {
  props: {
    block: { type: Object, required: true },
    noteCount: { type: Number, default: 0 },
    collapsed: { type: Boolean, default: false },
    presentationMode: { type: Boolean, default: false },
  },
  emits: ['toggle-collapse', 'add-note'],
  setup(props) {
    return {}
  },
  computed: {
    headerStyle() {
      const c = this.block.color || '#e2e8f0'
      return { backgroundColor: c + '33' }
    },
    titleStyle() {
      return { color: this.block.color || 'inherit' }
    },
  },
  render() {
    const children = []

    if (!this.presentationMode) {
      children.push(h('button', {
        onClick: () => this.$emit('toggle-collapse'),
        class: 'p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors',
        'aria-label': this.collapsed ? '展开' : '折叠',
      }, [
        h(ChevronDown, {
          class: this.collapsed ? 'h-4 w-4 rotate-180' : 'h-4 w-4'
        }),
      ]))
    }

    children.push(h('h3', {
      class: 'font-semibold text-sm truncate flex-1',
      style: this.titleStyle,
    }, this.block.title))

    children.push(h('span', {
      class: 'px-2 py-0.5 text-xs font-medium rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
    }, String(this.noteCount)))

    if (!this.presentationMode) {
      children.push(h('button', {
        onClick: () => this.$emit('add-note'),
        class: 'p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-text-muted hover:text-primary-600',
        'aria-label': '添加便利贴',
      }, [
        h(Plus, { class: 'h-4 w-4' }),
      ]))
    }

    return h('div', {
      class: 'flex items-center gap-2 px-3 py-2 border-b border-canvas-border',
      style: this.headerStyle,
    }, children)
  }
}