import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useUIStore = defineStore('ui', () => {
  const viewport = ref({ x: 0, y: 0, scale: 1 })
  const presentationMode = ref(false)
  const showGuide = ref(false)
  const theme = ref<'light' | 'dark' | 'auto'>('auto')
  const sidebarOpen = ref(false)
  const activeModal = ref<string | null>(null)

  function setViewport(v: { x?: number; y?: number; scale?: number }) {
    viewport.value = { ...viewport.value, ...v }
  }

  function resetViewport() {
    viewport.value = { x: 0, y: 0, scale: 1 }
  }

  function zoomIn() {
    viewport.value.scale = Math.min(viewport.value.scale * 1.2, 5)
  }

  function zoomOut() {
    viewport.value.scale = Math.max(viewport.value.scale / 1.2, 0.1)
  }

  function togglePresentationMode() {
    presentationMode.value = !presentationMode.value
  }

  function setPresentationMode(value: boolean) {
    presentationMode.value = value
  }

  function toggleGuide() {
    showGuide.value = !showGuide.value
  }

  function setTheme(t: 'light' | 'dark' | 'auto') {
    theme.value = t
    applyTheme()
  }

  function cycleTheme() {
    const order: ('light' | 'dark' | 'auto')[] = ['light', 'dark', 'auto']
    const currentIndex = order.indexOf(theme.value)
    theme.value = order[(currentIndex + 1) % 3]
    applyTheme()
  }

  function applyTheme() {
    const root = document.documentElement
    if (theme.value === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', prefersDark)
    } else {
      root.classList.toggle('dark', theme.value === 'dark')
    }
  }

  function openModal(name: string) {
    activeModal.value = name
  }

  function closeModal() {
    activeModal.value = null
  }

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  watch(() => theme.value, applyTheme, { immediate: true })

  return {
    viewport,
    presentationMode,
    showGuide,
    theme,
    sidebarOpen,
    activeModal,
    setViewport,
    resetViewport,
    zoomIn,
    zoomOut,
    togglePresentationMode,
    setPresentationMode,
    toggleGuide,
    setTheme,
    cycleTheme,
    openModal,
    closeModal,
    toggleSidebar,
  }
})