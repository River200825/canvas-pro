import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const language = ref<'zh' | 'en'>('zh')
  const autoSaveInterval = ref(500)
  const defaultExportFormat = ref<'png' | 'pdf' | 'markdown' | 'json'>('png')
  const exportPixelRatio = ref<1 | 2 | 3>(2)
  const showGridLines = ref(true)
  const snapToGrid = ref(true)
  const showAlignmentGuides = ref(true)

  function setLanguage(lang: 'zh' | 'en') {
    language.value = lang
  }

  function setAutoSaveInterval(ms: number) {
    autoSaveInterval.value = Math.max(100, Math.min(10000, ms))
  }

  return {
    language,
    autoSaveInterval,
    defaultExportFormat,
    exportPixelRatio,
    showGridLines,
    snapToGrid,
    showAlignmentGuides,
    setLanguage,
    setAutoSaveInterval,
  }
})