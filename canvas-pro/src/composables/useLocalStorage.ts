import { ref, watch, shallowRef } from 'vue'

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const isClient = typeof window !== 'undefined'
  const stored = shallowRef<T>(defaultValue)
  const loaded = ref(false)

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
      } else {
        console.error('[useLocalStorage] Failed to save:', e)
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