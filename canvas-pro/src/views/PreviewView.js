import { h, ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCanvasStore } from '@/stores'
import { Edit, Maximize2, AlertCircle } from 'lucide-vue-next'
import { getTemplateById } from '@/templates'

export default {
  setup() {
    const route = useRoute()
    const router = useRouter()
    const canvasStore = useCanvasStore()
    const isFullscreen = ref(false)

    const canvasData = ref(null)

    onMounted(function () {
      // 从 route.query 获取 data（hash 路由模式下 vue-router 自动解析 ?data=xxx）
      var raw = route.query.data
      if (!raw) {
        // 兜底：手动从 hash 提取
        var match = window.location.hash.match(/\?data=([^&]+)/)
        if (match) raw = match[1]
      }
      if (!raw) return

      try {
        // 编码顺序: JSON.stringify → encodeURIComponent → btoa
        // 解码顺序: atob → decodeURIComponent → JSON.parse
        var json = decodeURIComponent(atob(raw))
        var parsed = JSON.parse(json)
        if (parsed && parsed.id && Array.isArray(parsed.notes)) {
          canvasData.value = parsed
        }
      } catch (e) {
        console.error('Failed to parse shared canvas:', e)
      }
    })

    function openEditor() {
      if (!canvasData.value) return
      try {
        var canvas = canvasStore.importCanvas(JSON.stringify(canvasData.value))
        router.push('/canvas/' + canvas.id)
      } catch (e) {
        alert('导入失败，数据格式不正确')
      }
    }

    function toggleFullscreen() {
      isFullscreen.value = !isFullscreen.value
    }

    return {
      canvasData,
      isFullscreen,
      openEditor,
      toggleFullscreen,
    }
  },
  render() {
    var self = this
    var canvas = this.canvasData

    // 无效链接提示
    if (!canvas) {
      return h('div', { class: 'min-h-screen bg-canvas-bg flex items-center justify-center' }, [
        h('div', { class: 'text-center' }, [
          h(AlertCircle, { class: 'h-12 w-12 mx-auto text-text-muted mb-4' }),
          h('p', { class: 'text-text-muted text-lg mb-2' }, '无效的分享链接'),
          h('p', { class: 'text-sm text-text-muted mb-6' }, '请检查链接是否完整，或从首页创建新画布'),
          h('button', {
            onClick: function () { self.$router.push('/') },
            class: 'btn-primary'
          }, '返回首页'),
        ]),
      ])
    }

    // 解析模板
    var template = getTemplateById(canvas.templateId)
    var blocks = template.blocks.slice().sort(function (a, b) { return a.order - b.order })

    // 按区块分组便利贴
    var notesByBlock = {}
    canvas.notes.forEach(function (note) {
      var key = note.blockId || '_free'
      if (!notesByBlock[key]) notesByBlock[key] = []
      notesByBlock[key].push(note)
    })
    Object.keys(notesByBlock).forEach(function (key) {
      notesByBlock[key].sort(function (a, b) { return a.order - b.order })
    })

    // 渲染只读区块
    var blockNodes = blocks.map(function (block) {
      var notes = notesByBlock[block.id] || []
      var headerStyle = { backgroundColor: (block.color || '#e2e8f0') + '33' }

      var noteNodes = notes.map(function (note) {
        var colorMap = {
          yellow: '#fef08a', blue: '#bfdbfe', green: '#bbf7d0',
          pink: '#fbcfe8', orange: '#ffedd5', purple: '#e9d5ff', gray: '#f3f4f6',
        }
        var bg = colorMap[note.color] || colorMap.yellow
        return h('div', {
          key: note.id,
          class: 'rounded-lg shadow-sm p-2.5 pl-3.5 relative overflow-hidden',
          style: { backgroundColor: bg },
        }, [
          h('div', {
            class: 'absolute left-0 top-0 bottom-0 w-1 rounded-l-lg opacity-60'
          }),
          note.title
            ? h('div', { class: 'font-semibold text-sm text-gray-800 truncate' }, note.title)
            : null,
          note.content
            ? h('div', { class: 'text-xs text-gray-700 whitespace-pre-wrap break-words mt-1' }, note.content)
            : null,
          !note.title && !note.content
            ? h('div', { class: 'text-xs text-gray-400 italic' }, '空便利贴')
            : null,
        ])
      })

      if (notes.length === 0) {
        noteNodes.push(h('div', { class: 'text-xs text-gray-400 italic p-3 text-center' }, '暂无内容'))
      }

      return h('div', {
        key: block.id,
        class: 'flex flex-col min-h-[180px] rounded-xl border border-canvas-border shadow-block overflow-hidden',
        style: { borderTopColor: block.color || '#e2e8f0', borderTopWidth: '3px' },
      }, [
        h('div', { class: 'flex items-center gap-2 px-3 py-2 border-b border-canvas-border', style: headerStyle }, [
          h('h3', { class: 'font-semibold text-sm flex-1 truncate', style: { color: block.color || 'inherit' } }, block.title),
          h('span', { class: 'px-2 py-0.5 text-xs font-medium rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' }, String(notes.length)),
        ]),
        h('div', { class: 'flex-1 p-2 space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar' }, noteNodes),
      ])
    })

    var containerClass = 'h-screen w-screen overflow-hidden bg-canvas-bg flex flex-col'
    if (self.isFullscreen) {
      // fullscreen: hide header
    }

    return h('div', { class: containerClass }, [
      // 顶栏（全屏时隐藏）
      self.isFullscreen ? null : h('header', {
        class: 'bg-white dark:bg-gray-900 border-b border-canvas-border px-4 py-2.5 flex items-center gap-3 shrink-0',
        'data-export-ignore': true,
      }, [
        h('span', { class: 'text-base font-bold text-text' }, 'CanvasPro'),
        h('span', { class: 'text-sm text-text-muted truncate flex-1' }, canvas.name),
        h('span', {
          class: 'px-2 py-0.5 text-xs font-medium rounded bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 shrink-0'
        }, '只读'),
        h('button', {
          onClick: self.toggleFullscreen,
          class: 'btn-icon text-text-muted hover:text-text',
          'aria-label': '全屏预览',
          title: '全屏预览',
        }, [h(Maximize2, { class: 'h-5 w-5' })]),
        h('button', {
          onClick: self.openEditor,
          class: 'btn-primary !py-1.5 gap-1.5 shrink-0',
        }, [h(Edit, { class: 'w-4 h-4' }), '编辑副本']),
      ]),

      // 全屏时显示退出按钮
      self.isFullscreen ? h('button', {
        onClick: self.toggleFullscreen,
        class: 'fixed top-3 right-3 z-50 btn-secondary !py-1.5 text-sm',
        'aria-label': '退出全屏',
      }, '退出全屏') : null,

      // 画布内容（只读网格）
      h('main', {
        class: 'flex-1 overflow-auto p-6 custom-scrollbar',
        'data-canvas-area': true,
      }, [
        h('div', {
          class: 'grid gap-4',
          style: {
            gridTemplateColumns: 'repeat(3, minmax(240px, 1fr))',
            maxWidth: '1200px',
            margin: '0 auto',
          },
        }, blockNodes),
      ]),
    ])
  }
}