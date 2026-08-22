import { h } from 'vue'
import { X, Keyboard } from 'lucide-vue-next'

export default {
  emits: ['close'],
  setup() {
    const emit = defineEmits(['close'])

    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
    const modKey = isMac ? '⌘' : 'Ctrl'
    const modKeyLabel = isMac ? 'Command' : 'Ctrl'

    const shortcuts = [
      { category: '画布操作', items: [
        { key: modKey + '+Shift+N', desc: '新建画布' },
        { key: modKey + '+Shift+D', desc: '复制当前画布' },
        { key: 'F', desc: '切换演示模式' },
        { key: 'Esc', desc: '退出演示 / 关闭弹窗' },
        { key: modKey + '+0', desc: '重置视图 (100%)' },
        { key: modKey + '+=', desc: '放大' },
        { key: modKey + '+-', desc: '缩小' },
        { key: modKey + '+滚轮', desc: '缩放画布' },
        { key: '空格+拖拽', desc: '平移画布' },
        { key: '双击空白', desc: '重置视图' },
      ]},
      { category: '便利贴操作', items: [
        { key: 'N', desc: '创建便利贴' },
        { key: 'Enter', desc: '编辑选中便利贴' },
        { key: 'Delete / Backspace', desc: '删除选中便利贴' },
        { key: '↑ / ↓', desc: '移动便利贴位置' },
        { key: modKey + '+C', desc: '复制便利贴' },
        { key: modKey + '+V', desc: '粘贴便利贴' },
        { key: modKey + '+S', desc: '创建快照' },
        { key: modKey + '+Shift+S', desc: '保存画布' },
      ]},
      { category: '编辑格式', items: [
        { key: modKey + '+B', desc: '加粗' },
        { key: modKey + '+I', desc: '斜体' },
        { key: modKey + '+U', desc: '下划线' },
        { key: modKey + '+Shift+7', desc: '有序列表' },
        { key: modKey + '+Shift+8', desc: '无序列表' },
        { key: modKey + '+K', desc: '插入链接' },
      ]},
      { category: '导出与其他', items: [
        { key: modKey + '+E', desc: '打开导出对话框' },
        { key: modKey + '+Shift+E', desc: '快速导出 PNG' },
        { key: '? / Shift+/', desc: '显示快捷键帮助' },
        { key: '← / →', desc: '演示模式下切换画布' },
      ]},
    ]

    function close() {
      emit('close')
    }

    function getKeyDisplay(key) {
      return key.replace(/Ctrl|⌘|Command/g, modKey)
    }

    return {
      isMac,
      modKey,
      modKeyLabel,
      shortcuts,
      close,
      getKeyDisplay,
    }
  },
  render() {
    const shortcutGroups = this.shortcuts.map(function (group) {
      const items = group.items.map(function (item) {
        return h('div', { key: item.key, class: 'flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800' }, [
          h('kbd', {
            class: 'font-mono text-xs px-2 py-1 rounded whitespace-nowrap bg-white dark:bg-gray-700 border border-canvas-border'
          }, this.getKeyDisplay(item.key)),
          h('span', { class: 'text-sm text-text' }, item.desc)
        ])
      }.bind(this))

      return h('div', { key: group.category, class: 'space-y-3' }, [
        h('h3', { class: 'text-sm font-medium text-text-muted uppercase tracking-wider' }, group.category),
        h('div', { class: 'grid grid-cols-1 sm:grid-cols-2 gap-2' }, items)
      ])
    }.bind(this))

    return h('div', {
      class: 'fixed inset-0 z-[200] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in',
      onClick: this.close
    }, [
      h('div', {
        class: 'relative w-full max-w-3xl max-h-[90vh] mx-4 card animate-scale-in overflow-hidden flex flex-col',
        onClick: function (e) { e.stopPropagation() }
      }, [
        h('div', { class: 'flex items-center justify-between p-4 border-b border-canvas-border' }, [
          h('div', { class: 'flex items-center gap-2' }, [
            h(Keyboard, { class: 'h-5 w-5 text-primary-500' }),
            h('h2', { class: 'text-lg font-semibold text-text' }, '快捷键帮助'),
            h('span', {
              class: 'px-2 py-0.5 text-xs font-medium rounded bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
            }, this.modKeyLabel + ' = ' + (this.isMac ? '⌘ Command' : 'Ctrl 键'))
          ]),
          h('button', {
            onClick: this.close,
            class: 'btn-icon text-text-muted hover:text-text',
            'aria-label': '关闭'
          }, [
            h(X, { class: 'h-5 w-5' })
          ])
        ]),
        h('div', { class: 'flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar' }, shortcutGroups),
        h('div', { class: 'pt-4 pb-2 px-4 border-t border-canvas-border text-center' }, [
          h('p', { class: 'text-sm text-text-muted' }, '提示：在输入框或编辑状态下，字母快捷键会被禁用')
        ])
      ])
    ])
  }
}