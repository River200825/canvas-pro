import { ref, onMounted, onUnmounted } from 'vue'
import { useCanvasStore } from '@/stores'
import { useUIStore } from '@/stores/ui'

export function useKeyboardShortcuts() {
  const canvasStore = useCanvasStore()
  const uiStore = useUIStore()

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
  const modKey = isMac ? '⌘' : 'Ctrl'

  const shortcuts = [
    { key: 'n', meta: false, ctrl: false, shift: false, alt: false, description: '新建便利贴', action: () => { /* handled in editor */ } },
    { key: 'Delete', meta: false, ctrl: false, shift: false, alt: false, description: '删除选中', action: () => { /* handled in editor */ } },
    { key: 'Backspace', meta: false, ctrl: false, shift: false, alt: false, description: '删除选中', action: () => { /* handled in editor */ } },
    { key: 's', meta: true, ctrl: true, shift: false, alt: false, description: '创建快照', action: () => canvasStore.createSnapshot() },
    { key: 's', meta: true, ctrl: true, shift: true, alt: false, description: '保存画布', action: () => { /* handled in editor */ } },
    { key: 'e', meta: true, ctrl: true, shift: false, alt: false, description: '打开导出', action: () => uiStore.openModal('export') },
    { key: 'f', meta: false, ctrl: false, shift: false, alt: false, description: '全屏演示', action: () => uiStore.togglePresentationMode() },
    { key: '?', meta: false, ctrl: false, shift: true, alt: false, description: '快捷键帮助', action: () => uiStore.openModal('shortcuts') },
    { key: '/', meta: false, ctrl: false, shift: true, alt: false, description: '快捷键帮助', action: () => uiStore.openModal('shortcuts') },
    { key: 'Escape', meta: false, ctrl: false, shift: false, alt: false, description: '关闭弹窗/退出演示', action: () => { uiStore.closeModal(); if (uiStore.presentationMode) uiStore.setPresentationMode(false) } },
    { key: '0', meta: true, ctrl: true, shift: false, alt: false, description: '重置视图 (100%)', action: () => uiStore.resetViewport() },
    { key: '=', meta: true, ctrl: true, shift: false, alt: false, description: '放大', action: () => uiStore.zoomIn() },
    { key: '-', meta: true, ctrl: true, shift: false, alt: false, description: '缩小', action: () => uiStore.zoomOut() },
  ]

  function matchesShortcut(event: KeyboardEvent, shortcut: typeof shortcuts[0]): boolean {
    if (event.key.toLowerCase() !== shortcut.key.toLowerCase()) return false
    if (shortcut.meta && !event.metaKey && !event.ctrlKey) return false
    if (shortcut.ctrl && !event.ctrlKey && !event.metaKey) return false
    if (shortcut.shift !== event.shiftKey) return false
    if (shortcut.alt !== event.altKey) return false
    return true
  }

  function isInputFocused(): boolean {
    const active = document.activeElement
    return active instanceof HTMLInputElement ||
      active instanceof HTMLTextAreaElement ||
      (active as HTMLElement)?.isContentEditable === true
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (isInputFocused() && event.key !== 'Escape') return

    for (const shortcut of shortcuts) {
      if (matchesShortcut(event, shortcut)) {
        event.preventDefault()
        shortcut.action()
        break
      }
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })

  return { shortcuts, modKey }
}