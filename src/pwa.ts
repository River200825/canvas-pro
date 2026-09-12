import { ref } from 'vue'

/** Service Worker 检测到新版本时置真（A6：由用户确认后再刷新） */
export const needRefresh = ref(false)

type UpdateFn = (reloadPage?: boolean) => Promise<void>
let updateFn: UpdateFn | null = null

export function bindUpdateSw(fn: UpdateFn): void {
  updateFn = fn
}

export function confirmUpdate(): void {
  if (updateFn) void updateFn(true)
  else window.location.reload()
}
