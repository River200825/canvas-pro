import { ref, watch, shallowRef } from 'vue'
import { useToast } from './useToast'

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const isClient = typeof window !== 'undefined'
  const stored = shallowRef<T>(defaultValue)
  const loaded = ref(false)
  const toast = useToast()

  function load(): T {
    if (!isClient) return defaultValue
    try {
      const item = localStorage.getItem(key)
      if (item) {
        const parsed = JSON.parse(item)
        stored.value = parsed
        return parsed
      }
    } catch (e) {
      console.error('[useLocalStorage] Failed to load:', e)
    }
    return defaultValue
  }

  function save(value: T) {
    if (!isClient) return
    try {
      localStorage.setItem(key, JSON.stringify(value))
      stored.value = value
    } catch (e) {
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        console.error('[useLocalStorage] Storage quota exceeded')
        toast.errorThrottled('本地存储空间已满，最近的更改可能未被保存。请导出 JSON 备份后清理旧画布。')
      } else {
        console.error('[useLocalStorage] Failed to save:', e)
        toast.errorThrottled('保存失败，请检查浏览器存储设置。')
      }
    }
  }

  function remove() {
    if (!isClient) return
    localStorage.removeItem(key)
    stored.value = defaultValue
  }

  watch(
    () => stored.value,
    (newValue: T) => {
      save(newValue)
    },
    { deep: true }
  )

  return {
    stored,
    loaded,
    load,
    save,
    remove,
  }
}

export function useSessionStorage<T>(key: string, defaultValue: T) {
  const isClient = typeof window !== 'undefined'
  const stored = shallowRef<T>(defaultValue)

  function load(): T {
    if (!isClient) return defaultValue
    try {
      const item = sessionStorage.getItem(key)
      if (item) {
        const parsed = JSON.parse(item)
        stored.value = parsed
        return parsed
      }
    } catch (e) {
      console.error('[useSessionStorage] Failed to load:', e)
    }
    return defaultValue
  }

  function save(value: T) {
    if (!isClient) return
    try {
      sessionStorage.setItem(key, JSON.stringify(value))
      stored.value = value
    } catch (e) {
      console.error('[useSessionStorage] Failed to save:', e)
    }
  }

  return {
    stored,
    load,
    save,
  }
}