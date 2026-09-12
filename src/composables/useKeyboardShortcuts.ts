import { onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCanvasStore } from '@/stores'
import { useUIStore } from '@/stores/ui'
import { useToast } from './useToast'

/** Ctrl+C 复制的便利贴快照，模块级共享 */
let clipboardNote: import('@/types/note').StickyNote | null = null

export function useKeyboardShortcuts() {
  const canvasStore = useCanvasStore()
  const uiStore = useUIStore()
  const route = useRoute()
  const toast = useToast()

  const isMac = navigator.platform.toUpperCase().includes('MAC')
  const modKey = isMac ? '⌘' : 'Ctrl'

  interface ShortcutDef {
    key: string
    ctrl?: boolean
    shift?: boolean
    /** 仅在编辑器路由内生效 */
    editorOnly?: boolean
    description: string
    action: () => void
  }

  function switchCanvasByStep(step: 1 | -1): void {
    const list = canvasStore.canvases
    if (list.length < 2 || !canvasStore.currentCanvasId) return
    const index = list.findIndex(c => c.id === canvasStore.currentCanvasId)
    const next = (index + step + list.length) % list.length
    canvasStore.switchCanvas(list[next].id)
  }

  function addQuickNote(): void {
    const canvas = canvasStore.currentCanvas
    if (!canvas) return
    const firstBlock = [...canvas.blocks].sort((a, b) => a.order - b.order)[0]
    const note = canvasStore.addNote(firstBlock?.id ?? null)
    canvasStore.selectNote(note.id)
  }

  function deleteSelected(): void {
    const ids = canvasStore.selectedIds.length
      ? [...canvasStore.selectedIds]
      : canvasStore.selectedNoteId
        ? [canvasStore.selectedNoteId]
        : []
    if (ids.length === 0) return

    if (ids.length === 1) {
      const note = canvasStore.getSelectedNote()
      if (!note || note.locked) return
      canvasStore.deleteNote(note.id)
      canvasStore.selectNote(null)
      return
    }
    canvasStore.deleteNotes(ids)
  }

  function copySelected(): void {
    const note = canvasStore.getSelectedNote()
    if (note) clipboardNote = { ...note }
  }

  function pasteClipboard(): void {
    if (!clipboardNote || !canvasStore.currentCanvas) return
    const note = canvasStore.addNote(clipboardNote.blockId, undefined, undefined, clipboardNote.color)
    canvasStore.updateNote(note.id, {
      title: clipboardNote.title,
      content: clipboardNote.content,
      width: clipboardNote.width,
      height: clipboardNote.height,
    })
  }

  function zoomCanvas(factor: number): void {
    const vp = canvasStore.currentCanvas?.viewport
    if (!vp) return
    canvasStore.setViewport({
      scale: Math.min(Math.max(vp.scale * factor, 0.25), 3),
    })
  }

  function resetZoom(): void {
    canvasStore.setViewport({ x: 0, y: 0, scale: 1 })
  }

  const shortcuts: ShortcutDef[] = [
    // —— 全局 ——
    { key: 'Escape', description: '关闭弹窗 / 退出演示 / 取消选择', action: () => {
        uiStore.closeModal()
        if (uiStore.presentationMode) uiStore.setPresentationMode(false)
        canvasStore.selectNote(null)
      } },
    { key: '?', shift: true, description: '显示快捷键帮助', action: () => uiStore.openModal('shortcuts') },
    // —— 编辑器内 ——
    { key: 'n', editorOnly: true, description: '新建便利贴', action: addQuickNote },
    { key: 'Delete', editorOnly: true, description: '删除选中便利贴', action: deleteSelected },
    { key: 'Backspace', editorOnly: true, description: '删除选中便利贴', action: deleteSelected },
    { key: 'c', ctrl: true, editorOnly: true, description: '复制选中便利贴', action: copySelected },
    { key: 'v', ctrl: true, editorOnly: true, description: '粘贴便利贴', action: pasteClipboard },
    { key: 's', ctrl: true, editorOnly: true, description: '创建快照', action: () => {
        canvasStore.createSnapshot()
        toast.success('快照已创建')
      } },
    { key: 's', ctrl: true, shift: true, editorOnly: true, description: '保存画布', action: () => {
        canvasStore.saveCanvas()
        toast.success('画布已保存')
      } },
    { key: 'z', ctrl: true, editorOnly: true, description: '撤销', action: () => canvasStore.undo() },
    { key: 'y', ctrl: true, editorOnly: true, description: '重做', action: () => canvasStore.redo() },
    { key: 'z', ctrl: true, shift: true, editorOnly: true, description: '重做', action: () => canvasStore.redo() },
    { key: 'e', ctrl: true, editorOnly: true, description: '打开导出对话框', action: () => uiStore.openModal('export') },
    { key: 'n', ctrl: true, shift: true, editorOnly: true, description: '新建画布', action: () => canvasStore.createCanvas() },
    { key: 'd', ctrl: true, shift: true, editorOnly: true, description: '复制当前画布', action: () => {
        const id = canvasStore.currentCanvasId
        if (id) canvasStore.duplicateCanvas(id)
      } },
    { key: 'f', editorOnly: true, description: '切换演示模式', action: () => uiStore.togglePresentationMode() },
    { key: '0', ctrl: true, editorOnly: true, description: '重置视图 (100%)', action: resetZoom },
    { key: '=', ctrl: true, editorOnly: true, description: '放大', action: () => zoomCanvas(1.2) },
    { key: '+', ctrl: true, editorOnly: true, description: '放大', action: () => zoomCanvas(1.2) },
    { key: '-', ctrl: true, editorOnly: true, description: '缩小', action: () => zoomCanvas(1 / 1.2) },
    { key: 'ArrowLeft', editorOnly: true, description: '演示模式：上一画布', action: () => {
        if (uiStore.presentationMode) switchCanvasByStep(-1)
      } },
    { key: 'ArrowRight', editorOnly: true, description: '演示模式：下一画布', action: () => {
        if (uiStore.presentationMode) switchCanvasByStep(1)
      } },
  ]

  function matches(event: KeyboardEvent, s: ShortcutDef): boolean {
    if (event.key.toLowerCase() !== s.key.toLowerCase()) return false
    if (s.ctrl && !(event.ctrlKey || event.metaKey)) return false
    if (!s.ctrl && s.key !== 'Delete' && s.key !== 'Backspace' && s.key !== 'ArrowLeft' && s.key !== 'ArrowRight' && (event.ctrlKey || event.metaKey)) return false
    if ((s.shift ?? false) !== event.shiftKey) return false
    return true
  }

  function isInputFocused(): boolean {
    const active = document.activeElement
    return (
      active instanceof HTMLInputElement ||
      active instanceof HTMLTextAreaElement ||
      (active as HTMLElement | null)?.isContentEditable === true
    )
  }

  function handleKeyDown(event: KeyboardEvent): void {
    if (isInputFocused() && event.key !== 'Escape') return
    for (const s of shortcuts) {
      if (s.editorOnly && !route.path.startsWith('/canvas')) continue
      if (matches(event, s)) {
        event.preventDefault()
        s.action()
        return
      }
    }
  }

  onMounted(() => window.addEventListener('keydown', handleKeyDown))
  onUnmounted(() => window.removeEventListener('keydown', handleKeyDown))

  return { shortcuts: shortcuts.map(({ key, ctrl, shift, description }) => ({ key, ctrl, shift, description })), modKey }
}
