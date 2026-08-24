import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter, type Router } from 'vue-router'
import { useKeyboardShortcuts } from '../useKeyboardShortcuts'
import { useCanvasStore } from '@/stores'
import { useUIStore } from '@/stores/ui'

const TestComponent = {
  template: '<div />',
  setup() {
    const { shortcuts, modKey } = useKeyboardShortcuts()
    return { shortcuts, modKey }
  },
}

let router: Router
let wrapper: ReturnType<typeof mount> | null = null

async function setup(routePath = '/canvas/c1') {
  setActivePinia(createPinia())
  router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'Home', component: { template: '<div/>' } },
      { path: '/canvas/:id', name: 'CanvasEditor', component: { template: '<div/>' } },
    ],
  })
  await router.push(routePath)
  await router.isReady()

  const canvasStore = useCanvasStore()
  canvasStore.init()
  wrapper = mount(TestComponent, { global: { plugins: [router] } })
  return { wrapper, canvasStore, ui: useUIStore() }
}

function keydown(key: string, options: Partial<KeyboardEventInit> = {}): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...options })
  window.dispatchEvent(event)
  return event
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  wrapper?.unmount()
  wrapper = null
  document.body.innerHTML = ''
  const active = document.activeElement as HTMLElement | null
  if (active && active !== document.body) active.blur?.()
  document.body.focus?.()
})

describe('useKeyboardShortcuts', () => {
  it('N 在编辑器内于第一个区块创建便利贴并选中', async () => {
    const { canvasStore } = await setup()
    keydown('n')
    const canvas = canvasStore.currentCanvas!
    expect(canvas.notes).toHaveLength(1)
    expect(canvas.notes[0].blockId).toBe(
      [...canvas.blocks].sort((a, b) => a.order - b.order)[0].id
    )
    expect(canvasStore.selectedNoteId).toBe(canvas.notes[0].id)
  })

  it('N 在非编辑器路由不生效', async () => {
    const { canvasStore } = await setup('/')
    keydown('n')
    // 首页路由下 init 已创建画布但不应有便利贴
    expect(canvasStore.currentCanvas?.notes ?? []).toHaveLength(0)
  })

  it('Delete 删除选中便利贴', async () => {
    const { canvasStore } = await setup()
    const note = canvasStore.addNote(null)
    canvasStore.selectNote(note.id)
    keydown('Delete')
    expect(canvasStore.currentCanvas!.notes).toHaveLength(0)
    expect(canvasStore.selectedNoteId).toBeNull()
  })

  it('Ctrl+C / Ctrl+V 复制粘贴便利贴', async () => {
    const { canvasStore } = await setup()
    const note = canvasStore.addNote(null)
    canvasStore.updateNote(note.id, { title: '源', content: '内容', color: 'blue' })
    canvasStore.selectNote(note.id)

    keydown('c', { ctrlKey: true })
    keydown('v', { ctrlKey: true })

    const notes = canvasStore.currentCanvas!.notes
    expect(notes).toHaveLength(2)
    const copy = notes.find(n => n.id !== note.id)!
    expect(copy.title).toBe('源')
    expect(copy.color).toBe('blue')
    // 粘贴不改变选中，可连续粘贴
    keydown('v', { ctrlKey: true })
    expect(canvasStore.currentCanvas!.notes).toHaveLength(3)
  })

  it('Ctrl+S 创建快照', async () => {
    const { canvasStore } = await setup()
    keydown('s', { ctrlKey: true })
    expect(canvasStore.currentCanvas!.snapshots).toHaveLength(1)
  })

  it('Ctrl+E 打开导出弹窗', async () => {
    const { ui } = await setup()
    keydown('e', { ctrlKey: true })
    expect(ui.activeModal).toBe('export')
  })

  it('Ctrl+Shift+N 新建画布', async () => {
    const { canvasStore } = await setup()
    const before = canvasStore.canvases.length
    keydown('n', { ctrlKey: true, shiftKey: true })
    expect(canvasStore.canvases.length).toBe(before + 1)
  })

  it('Ctrl+Shift+D 复制当前画布', async () => {
    const { canvasStore } = await setup()
    const before = canvasStore.canvases.length
    keydown('d', { ctrlKey: true, shiftKey: true })
    expect(canvasStore.canvases.length).toBe(before + 1)
  })

  it('Ctrl+0 重置画布视口', async () => {
    const { canvasStore } = await setup()
    canvasStore.setViewport({ x: 100, y: 50, scale: 2 })
    keydown('0', { ctrlKey: true })
    expect(canvasStore.currentCanvas!.viewport).toEqual({ x: 0, y: 0, scale: 1 })
  })

  it('Ctrl+- 缩小画布', async () => {
    const { canvasStore } = await setup()
    const before = canvasStore.currentCanvas!.viewport.scale
    keydown('-', { ctrlKey: true })
    expect(canvasStore.currentCanvas!.viewport.scale).toBeLessThan(before)
  })

  it('F 切换演示模式', async () => {
    const { ui } = await setup()
    keydown('f')
    expect(ui.presentationMode).toBe(true)
    keydown('f')
    expect(ui.presentationMode).toBe(false)
  })

  it('演示模式下 ←/→ 切换画布，非演示模式不切换', async () => {
    const { canvasStore } = await setup()
    const first = canvasStore.canvases[0]
    const second = canvasStore.createCanvas('第二张')
    canvasStore.switchCanvas(first.id)

    keydown('ArrowRight') // 非演示模式：不切换
    expect(canvasStore.currentCanvasId).toBe(first.id)

    useUIStore().setPresentationMode(true)
    keydown('ArrowRight')
    expect(canvasStore.currentCanvasId).toBe(second.id)
    keydown('ArrowLeft')
    expect(canvasStore.currentCanvasId).toBe(first.id)
  })

  it('? 打开快捷键帮助（全局生效）', async () => {
    const { ui } = await setup('/')
    keydown('?', { shiftKey: true })
    expect(ui.activeModal).toBe('shortcuts')
  })

  it('Esc 关闭弹窗并退出演示模式', async () => {
    const { ui } = await setup()
    ui.openModal('export')
    ui.setPresentationMode(true)
    keydown('Escape')
    expect(ui.activeModal).toBeNull()
    expect(ui.presentationMode).toBe(false)
  })

  it('输入框聚焦时字母快捷键禁用（Esc 除外）', async () => {
    const { canvasStore } = await setup()
    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()
    expect(document.activeElement).toBe(input)

    try {
      const event = new KeyboardEvent('keydown', { key: 'n', bubbles: true, cancelable: true })
      window.dispatchEvent(event)

      expect(canvasStore.currentCanvas!.notes).toHaveLength(0)
      expect(event.defaultPrevented).toBe(false)
    } finally {
      input.blur()
      input.remove()
    }
    expect(document.activeElement).not.toBe(input)
  })

  it('快捷键触发后阻止默认行为', async () => {
    await setup()
    const event = keydown('f')
    expect(event.defaultPrevented).toBe(true)
  })

  it('返回快捷键表数据供帮助面板使用', async () => {
    const { wrapper: w } = await setup()
    const exposed = (w.vm.$ as unknown as { setupState: Record<string, unknown> }).setupState
    const shortcuts = exposed.shortcuts as { key: string; description: string }[]
    expect(Array.isArray(shortcuts)).toBe(true)
    expect(shortcuts.length).toBeGreaterThanOrEqual(15)
  })
})
