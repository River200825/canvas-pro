import { h, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Plus, Copy, Trash2, ChevronDown, FilePlus,
  Image as ImageIcon, FileText, Braces, Share2, Keyboard, Maximize2,
} from 'lucide-vue-next'
import { useCanvasStore } from '@/stores'
import { exportJSON, exportMarkdown, exportPNG, createShareLink } from '@/utils/export'

export default {
  setup() {
    const router = useRouter()
    const canvasStore = useCanvasStore()

    const showCanvasMenu = ref(false)
    const showExportMenu = ref(false)
    const rootRef = ref(null)

    function closeMenus(e) {
      if (rootRef.value && !rootRef.value.contains(e.target)) {
        showCanvasMenu.value = false
        showExportMenu.value = false
      }
    }

    onMounted(function () { document.addEventListener('click', closeMenus) })
    onUnmounted(function () { document.removeEventListener('click', closeMenus) })

    function newCanvas() {
      canvasStore.createCanvas()
      showCanvasMenu.value = false
    }

    function duplicateCurrent() {
      if (canvasStore.currentCanvas) {
        canvasStore.duplicateCanvas(canvasStore.currentCanvas.id)
      }
      showCanvasMenu.value = false
    }

    function deleteCurrent() {
      if (canvasStore.currentCanvas && canvasStore.canvases.length > 1) {
        canvasStore.deleteCanvas(canvasStore.currentCanvas.id)
      }
      showCanvasMenu.value = false
    }

    function switchTo(id) {
      canvasStore.switchCanvas(id)
      showCanvasMenu.value = false
    }

    async function doExportPNG() {
      const el = document.querySelector('[data-canvas-area]')
      if (el && canvasStore.currentCanvas) {
        await exportPNG(el, canvasStore.currentCanvas.name)
      }
      showExportMenu.value = false
    }

    function doExportMD() {
      if (canvasStore.currentCanvas) {
        exportMarkdown(canvasStore.currentCanvas, canvasStore.currentTemplate)
      }
      showExportMenu.value = false
    }

    function doExportJSON() {
      if (canvasStore.currentCanvas) {
        exportJSON(canvasStore.currentCanvas)
      }
      showExportMenu.value = false
    }

    async function doShare() {
      if (canvasStore.currentCanvas) {
        const link = createShareLink(canvasStore.currentCanvas)
        try {
          await navigator.clipboard.writeText(link)
          alert('分享链接已复制到剪贴板')
        } catch (e) {
          prompt('复制以下分享链接：', link)
        }
      }
      showExportMenu.value = false
    }

    return {
      canvasStore, router,
      showCanvasMenu, showExportMenu, rootRef,
      newCanvas, duplicateCurrent, deleteCurrent, switchTo,
      doExportPNG, doExportMD, doExportJSON, doShare,
    }
  },
  render() {
    const self = this
    const store = this.canvasStore
    const current = store.currentCanvas

    // 画布切换菜单项
    const canvasItems = store.canvases.map(function (c) {
      const isActive = current && c.id === current.id
      return h('button', {
        key: c.id,
        onClick: function () { self.switchTo(c.id) },
        class: 'w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ' +
          (isActive
            ? 'bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 font-medium'
            : 'text-text hover:bg-gray-100 dark:hover:bg-gray-800')
      }, c.name)
    })

    // 画布下拉
    const canvasMenu = this.showCanvasMenu
      ? h('div', {
          class: 'absolute left-0 top-full mt-1 min-w-[220px] max-h-64 overflow-y-auto card shadow-xl p-1 z-50 custom-scrollbar'
        }, [
          h('button', {
            onClick: self.newCanvas,
            class: 'w-full flex items-center gap-2 px-3 py-2 text-sm text-text hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg'
          }, [h(FilePlus, { class: 'h-4 w-4' }), '新建画布']),
          h('hr', { class: 'my-1 border-canvas-border' }),
        ].concat(canvasItems))
      : null

    // 导出下拉
    const exportMenu = this.showExportMenu
      ? h('div', {
          class: 'absolute right-0 top-full mt-1 min-w-[180px] card shadow-xl p-1 z-50'
        }, [
          h('button', { onClick: self.doExportPNG, class: 'dropdown-item w-full gap-2' },
            [h(ImageIcon, { class: 'h-4 w-4' }), '导出 PNG']),
          h('button', { onClick: self.doExportMD, class: 'dropdown-item w-full gap-2' },
            [h(FileText, { class: 'h-4 w-4' }), '导出 Markdown']),
          h('button', { onClick: self.doExportJSON, class: 'dropdown-item w-full gap-2' },
            [h(Braces, { class: 'h-4 w-4' }), '导出 JSON']),
          h('hr', { class: 'my-1 border-canvas-border' }),
          h('button', { onClick: self.doShare, class: 'dropdown-item w-full gap-2' },
            [h(Share2, { class: 'h-4 w-4' }), '复制分享链接']),
        ])
      : null

    return h('header', {
      ref: 'rootRef',
      class: 'fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-b border-canvas-border px-4 py-2.5 flex items-center gap-3',
      'data-export-ignore': true,
    }, [
      // Logo + 返回首页
      h('button', {
        onClick: function () { self.router.push('/') },
        class: 'flex items-center gap-2 shrink-0'
      }, [
        h('span', { class: 'text-base font-bold text-text' }, 'CanvasPro'),
      ]),

      // 画布切换器
      h('div', { class: 'relative' }, [
        h('button', {
          onClick: function () {
            self.showCanvasMenu = !self.showCanvasMenu
            self.showExportMenu = false
          },
          class: 'btn-secondary !py-1.5 flex items-center gap-2 min-w-[160px] max-w-[280px]'
        }, [
          h('span', { class: 'truncate flex-1 text-left' }, current ? current.name : '无画布'),
          h(ChevronDown, { class: 'h-4 w-4 shrink-0' }),
        ]),
        canvasMenu,
      ]),

      // 模板名（只读展示）
      h('span', { class: 'hidden md:inline text-sm text-text-muted truncate' },
        store.currentTemplate ? store.currentTemplate.name : ''),

      h('div', { class: 'flex-1' }),

      // 快捷键帮助
      h('button', {
        onClick: function () { self.router.push('/guide') },
        class: 'btn-icon text-text-muted hover:text-text',
        title: '交互教程',
      }, [h(Keyboard, { class: 'h-5 w-5' })]),

      // 导出菜单
      h('div', { class: 'relative' }, [
        h('button', {
          onClick: function () {
            self.showExportMenu = !self.showExportMenu
            self.showCanvasMenu = false
          },
          class: 'btn-primary !py-1.5 flex items-center gap-1.5'
        }, [
          h(Share2, { class: 'h-4 w-4' }),
          h('span', { class: 'hidden sm:inline' }, '导出'),
        ]),
        exportMenu,
      ]),
    ])
  }
}