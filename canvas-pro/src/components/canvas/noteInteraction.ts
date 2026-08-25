import { reactive } from 'vue'
import type { StickyNote } from '@/types/note'

/** 活跃指针表：容器捏合缩放（D1）与便利贴拖拽（D2）共用 */
export const activePointers = new Map<number, { x: number; y: number }>()

export const pinchState = reactive({ active: false })

/** 便利贴拖拽状态（Pointer Events，桌面/触屏通用） */
export const noteDrag = reactive({
  id: null as string | null,
  overBlockId: null as string | null,
  active: false,
  /** 本次按下后是否发生拖拽，用于抑制拖拽结束后的 click */
  moved: false,
})

export function resetNoteDrag(): void {
  noteDrag.id = null
  noteDrag.overBlockId = null
  noteDrag.active = false
  noteDrag.moved = false
}

/** 便利贴右键菜单状态（C3） */
export const noteContextMenu = reactive({
  open: false,
  x: 0,
  y: 0,
  note: null as StickyNote | null,
})

export function openNoteContextMenu(note: StickyNote, x: number, y: number): void {
  noteContextMenu.note = note
  noteContextMenu.x = x
  noteContextMenu.y = y
  noteContextMenu.open = true
}

export function closeNoteContextMenu(): void {
  noteContextMenu.open = false
}

/** 编辑请求（C3 右键菜单 → 便利贴进入编辑态） */
export const editRequest = reactive({ id: null as string | null, seq: 0 })

export function requestEdit(id: string): void {
  editRequest.id = id
  editRequest.seq++
}
