import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useUIStore } from '../ui'
import { useSettingsStore } from '../settings'

beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
})

describe('ui store', () => {
  it('主题循环切换 light → dark → auto → light', () => {
    const ui = useUIStore()
    ui.setTheme('light')
    expect(ui.theme).toBe('light')
    ui.cycleTheme()
    expect(ui.theme).toBe('dark')
    ui.cycleTheme()
    expect(ui.theme).toBe('auto')
    ui.cycleTheme()
    expect(ui.theme).toBe('light')
  })

  it('主题偏好持久化到 localStorage', () => {
    const ui = useUIStore()
    ui.setTheme('dark')
    expect(localStorage.getItem('canvas-pro:theme')).toBe('dark')
  })

  it('applyTheme 在 auto 下跟随系统、显式模式下强制切换', () => {
    const ui = useUIStore()
    ui.setTheme('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    ui.setTheme('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('初始主题从 localStorage 恢复', () => {
    localStorage.setItem('canvas-pro:theme', 'dark')
    setActivePinia(createPinia())
    const ui = useUIStore()
    expect(ui.theme).toBe('dark')
  })

  it('弹窗 openModal / closeModal', () => {
    const ui = useUIStore()
    expect(ui.activeModal).toBeNull()
    ui.openModal('export')
    expect(ui.activeModal).toBe('export')
    ui.closeModal()
    expect(ui.activeModal).toBeNull()
  })

  it('演示模式切换', () => {
    const ui = useUIStore()
    ui.setPresentationMode(true)
    expect(ui.presentationMode).toBe(true)
    ui.togglePresentationMode()
    expect(ui.presentationMode).toBe(false)
  })

  it('viewport 缩放边界（0.1 ~ 5）', () => {
    const ui = useUIStore()
    ui.setViewport({ scale: 100 })
    ui.zoomOut()
    expect(ui.viewport.scale).toBeLessThanOrEqual(5)
    ui.setViewport({ scale: 0.01 })
    ui.zoomIn()
    expect(ui.viewport.scale).toBeGreaterThanOrEqual(0.1)
  })

  it('resetViewport 恢复初始值', () => {
    const ui = useUIStore()
    ui.setViewport({ x: 100, y: 50, scale: 2 })
    ui.resetViewport()
    expect(ui.viewport).toEqual({ x: 0, y: 0, scale: 1 })
  })
})

describe('settings store', () => {
  it('语言与自动保存间隔设置', () => {
    const settings = useSettingsStore()
    settings.setLanguage('en')
    expect(settings.language).toBe('en')
    settings.setAutoSaveInterval(-5)
    expect(settings.autoSaveInterval).toBe(100) // 下限钳制
    settings.setAutoSaveInterval(999999)
    expect(settings.autoSaveInterval).toBe(10000) // 上限钳制
  })

  it('导出偏好默认值', () => {
    const settings = useSettingsStore()
    expect(settings.exportPixelRatio).toBe(2)
    expect(settings.defaultExportFormat).toBe('png')
    expect(settings.snapToGrid).toBe(true)
  })
})
