import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastItem {
  id: number
  type: ToastType
  message: string
}

const toasts = ref<ToastItem[]>([])
let nextId = 1
let lastErrorAt = 0

function show(type: ToastType, message: string, duration = 3000): number {
  const id = nextId++
  toasts.value.push({ id, type, message })
  setTimeout(() => dismiss(id), duration)
  return id
}

function dismiss(id: number): void {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index !== -1) toasts.value.splice(index, 1)
}

export function useToast() {
  return {
    toasts,
    dismiss,
    success: (message: string) => show('success', message),
    error: (message: string) => show('error', message, 5000),
    info: (message: string) => show('info', message),
    /** 错误提示节流（如存储失败，避免连续弹） */
    errorThrottled: (message: string, intervalMs = 30_000) => {
      const now = Date.now()
      if (now - lastErrorAt < intervalMs) return
      lastErrorAt = now
      show('error', message, 5000)
    },
  }
}
