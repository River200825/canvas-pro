import { defineStore } from 'pinia'
import { ref } from 'vue'

const AI_KEY = 'canvas-pro:ai'

export interface AiSettings {
  baseUrl: string
  apiKey: string
  model: string
}

function loadAiSettings(): AiSettings {
  const fallback: AiSettings = {
    baseUrl: 'https://api.openai.com/v1',
    apiKey: '',
    model: 'gpt-4o-mini',
  }
  try {
    const raw = localStorage.getItem(AI_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as Partial<AiSettings>
    return {
      baseUrl: parsed.baseUrl?.trim() || fallback.baseUrl,
      apiKey: parsed.apiKey ?? '',
      model: parsed.model?.trim() || fallback.model,
    }
  } catch {
    return fallback
  }
}

export const useSettingsStore = defineStore('settings', () => {
  const language = ref<'zh' | 'en'>('zh')
  const autoSaveInterval = ref(500)
  const defaultExportFormat = ref<'png' | 'pdf' | 'markdown' | 'json'>('png')
  const exportPixelRatio = ref<1 | 2 | 3>(2)
  const showGridLines = ref(true)
  const snapToGrid = ref(true)
  const showAlignmentGuides = ref(true)

  /** G1：AI 服务配置（仅保存在本地浏览器，请求由用户浏览器直连其选择的服务商） */
  const ai = ref<AiSettings>(loadAiSettings())

  function setAiSettings(patch: Partial<AiSettings>): void {
    ai.value = {
      baseUrl: patch.baseUrl?.trim() || ai.value.baseUrl,
      apiKey: patch.apiKey ?? ai.value.apiKey,
      model: patch.model?.trim() || ai.value.model,
    }
    try {
      localStorage.setItem(AI_KEY, JSON.stringify(ai.value))
    } catch {
      /* ignore */
    }
  }

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
    ai,
    setAiSettings,
    setLanguage,
    setAutoSaveInterval,
  }
})