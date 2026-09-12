import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CanvasInstance, CanvasTemplate, CanvasSnapshot, StickyNote, ViewportState, CanvasMode, CanvasBlock } from '@/types'
import { getTemplateById, templates } from '@/templates'
import { generateNoteId, createEmptyNote } from '@/types/note'
import { useLocalStorage } from '@/composables/useLocalStorage'

const STORAGE_KEY_PREFIX = 'canvas-pro:v1'
const MAX_SNAPSHOTS = 20
const MAX_UNDO_STEPS = 50

function getStorageKey(userEmail: string | null): string {
  return userEmail ? `${STORAGE_KEY_PREFIX}:${userEmail}` : STORAGE_KEY_PREFIX
}

/** localStorage 存储包装：带版本号，未来格式变更可迁移 */
interface StoredPayload {
  version: number
  canvases: CanvasInstance[]
}

function wrapPayload(canvases: CanvasInstance[]): StoredPayload {
  return { version: 1, canvases }
}

function unwrapPayload(parsed: unknown): CanvasInstance[] {
  // v1 包装格式
  if (parsed && typeof parsed === 'object' && Array.isArray((parsed as StoredPayload).canvases)) {
    return (parsed as StoredPayload).canvases
  }
  // 旧版裸数组格式（兼容迁移）
  if (Array.isArray(parsed)) return parsed
  return []
}

export const useCanvasStore = defineStore('canvas', () => {
  let currentUserEmail: string | null = null
  let storage = useLocalStorage<StoredPayload>(getStorageKey(null), wrapPayload([]))

  const canvases = ref<CanvasInstance[]>([])
  const currentCanvasId = ref<string | null>(null)
  const template = ref<CanvasTemplate>(templates[0])
  const selectedNoteId = ref<string | null>(null)

  /** 新建便利贴待自动进入编辑态（B3） */
  const pendingEditNoteId = ref<string | null>(null)

  /** 多选（C4）：有序数组，末位为主选 */
  const selectedIds = ref<string[]>([])

  /** 撤销/重做栈：仅存当前画布的 notes/blocks 深拷贝，不持久化 */
  interface UndoEntry {
    notes: StickyNote[]
    blocks: CanvasBlock[]
  }
  const undoStack = ref<UndoEntry[]>([])
  const redoStack = ref<UndoEntry[]>([])

  const canUndo = computed(() => undoStack.value.length > 0)
  const canRedo = computed(() => redoStack.value.length > 0)

  function cloneCurrent(): UndoEntry | null {
    const canvas = currentCanvas.value
    if (!canvas) return null
    return {
      notes: JSON.parse(JSON.stringify(canvas.notes)) as StickyNote[],
      blocks: JSON.parse(JSON.stringify(canvas.blocks)) as CanvasBlock[],
    }
  }

  /** 在任何 notes/blocks 变更前调用 */
  function pushUndo(): void {
    const entry = cloneCurrent()
    if (!entry) return
    undoStack.value.push(entry)
    if (undoStack.value.length > MAX_UNDO_STEPS) undoStack.value.shift()
    redoStack.value = []
  }

  function clearHistory(): void {
    undoStack.value = []
    redoStack.value = []
  }

  function undo(): void {
    const canvas = currentCanvas.value
    const entry = undoStack.value.pop()
    if (!canvas || !entry) return
    const current = cloneCurrent()
    if (current) redoStack.value.push(current)
    canvas.notes = entry.notes
    canvas.blocks = entry.blocks
    canvas.updatedAt = Date.now()
    if (canvas.notes.length === 0) selectedNoteId.value = null
    persist()
  }

  function redo(): void {
    const canvas = currentCanvas.value
    const entry = redoStack.value.pop()
    if (!canvas || !entry) return
    const current = cloneCurrent()
    if (current) undoStack.value.push(current)
    canvas.notes = entry.notes
    canvas.blocks = entry.blocks
    canvas.updatedAt = Date.now()
    persist()
  }

  function selectNote(id: string | null) {
    selectedNoteId.value = id
    selectedIds.value = id ? [id] : []
  }

  function selectOnly(id: string): void {
    selectedNoteId.value = id
    selectedIds.value = [id]
  }

  function toggleSelect(id: string): void {
    const index = selectedIds.value.indexOf(id)
    if (index === -1) {
      selectedIds.value = [...selectedIds.value, id]
    } else {
      selectedIds.value = selectedIds.value.filter(v => v !== id)
    }
    selectedNoteId.value = selectedIds.value.at(-1) ?? null
  }

  function setSelection(ids: string[]): void {
    selectedIds.value = [...ids]
    selectedNoteId.value = ids.at(-1) ?? null
  }

  function getSelectedNote(): StickyNote | null {
    if (!currentCanvas.value) return null
    const id = selectedIds.value.at(-1) ?? selectedNoteId.value
    if (!id) return null
    return currentCanvas.value.notes.find(n => n.id === id) ?? null
  }

  /** 批量删除（C4）：整批一步撤销；锁定项自动跳过 */
  function deleteNotes(ids: string[]): void {
    if (!currentCanvas.value || ids.length === 0) return
    const set = new Set(ids)
    const deletable = currentCanvas.value.notes.filter(n => set.has(n.id) && !n.locked).map(n => n.id)
    if (deletable.length === 0) return
    pushUndo()
    const dset = new Set(deletable)
    currentCanvas.value.notes = currentCanvas.value.notes.filter(n => !dset.has(n.id))
    if (selectedNoteId.value && dset.has(selectedNoteId.value)) selectedNoteId.value = null
    selectedIds.value = selectedIds.value.filter(id => !dset.has(id))
    currentCanvas.value.updatedAt = Date.now()
    persist()
  }

  /** 批量复制（C4） */
  function duplicateNotes(ids: string[]): number {
    if (!currentCanvas.value || ids.length === 0) return 0
    pushUndo()
    const now = Date.now()
    const copies = currentCanvas.value.notes
      .filter(n => ids.includes(n.id))
      .map((n, i) => ({
        ...n,
        id: generateNoteId(),
        order: n.order + 0.5 + i * 0.001,
        createdAt: now,
        updatedAt: now,
      }))
    currentCanvas.value.notes.push(...copies)
    currentCanvas.value.updatedAt = now
    persist()
    return copies.length
  }

  /** 批量改色（C4） */
  function colorNotes(ids: string[], color: StickyNote['color']): void {
    if (!currentCanvas.value || ids.length === 0) return
    pushUndo()
    const set = new Set(ids)
    for (const note of currentCanvas.value.notes) {
      if (set.has(note.id)) note.color = color
    }
    currentCanvas.value.updatedAt = Date.now()
    persist()
  }

  /** 批量移动到区块（C4） */
  function moveNotesToBlock(ids: string[], targetBlockId: string | null): void {
    if (!currentCanvas.value || ids.length === 0) return
    pushUndo()
    const set = new Set(ids)
    let order = nextOrder(targetBlockId, ids)
    for (const note of currentCanvas.value.notes) {
      if (set.has(note.id)) {
        note.blockId = targetBlockId
        note.order = order++
        note.updatedAt = Date.now()
      }
    }
    currentCanvas.value.updatedAt = Date.now()
    persist()
  }

  function isValidCanvasArray(arr: any[]): boolean {
    if (!Array.isArray(arr)) return false
    return arr.every(item =>
      item &&
      typeof item.id === 'string' &&
      typeof item.templateId === 'string' &&
      typeof item.name === 'string' &&
      Array.isArray(item.notes) &&
      item.viewport &&
      typeof item.viewport.x === 'number' &&
      typeof item.viewport.y === 'number' &&
      typeof item.viewport.scale === 'number'
    )
  }

  function init(userEmail?: string | null) {
    currentUserEmail = userEmail ?? null
    storage = useLocalStorage<StoredPayload>(getStorageKey(currentUserEmail), wrapPayload([]))
    const stored = unwrapPayload(storage.load())
    if (stored.length > 0 && isValidCanvasArray(stored)) {
      canvases.value = stored
      currentCanvasId.value = stored[0].id
    } else {
      if (stored.length > 0) {
        storage.save(wrapPayload([]))
      }
      createCanvas()
    }
    clearHistory()
  }

  function switchUser(userEmail: string | null) {
    if (currentUserEmail === userEmail) return
    currentUserEmail = userEmail
    storage = useLocalStorage<StoredPayload>(getStorageKey(userEmail), wrapPayload([]))
    const stored = unwrapPayload(storage.load())
    if (stored.length > 0 && isValidCanvasArray(stored)) {
      canvases.value = stored
      currentCanvasId.value = stored[0].id
    } else {
      canvases.value = []
      createCanvas()
    }
    clearHistory()
    selectedNoteId.value = null
    selectedIds.value = []
  }

  function logout() {
    persist()
    currentUserEmail = null
    canvases.value = []
    currentCanvasId.value = null
    selectedNoteId.value = null
    selectedIds.value = []
    clearHistory()
  }

  const currentCanvas = computed<CanvasInstance | null>(() => {
    if (!currentCanvasId.value) return null
    return canvases.value.find(c => c.id === currentCanvasId.value) ?? null
  })

  const currentTemplate = computed(() => {
    if (!currentCanvas.value) return template.value
    return getTemplateById(currentCanvas.value.templateId)
  })

  function createCanvas(name?: string, templateId?: string, mode: CanvasMode = 'grid'): CanvasInstance {
    const id = `canvas_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    const tpl = templateId ? getTemplateById(templateId) : template.value
    const now = Date.now()

    const blocks = tpl.blocks.map(b => ({
      ...b,
      collapsed: false,
    }))

    const canvas: CanvasInstance = {
      id,
      templateId: tpl.id,
      name: name ?? `画布 ${canvases.value.length + 1}`,
      mode,
      notes: [],
      blocks,
      viewport: { x: 0, y: 0, scale: 1 },
      createdAt: now,
      updatedAt: now,
      snapshots: [],
    }

    canvases.value.push(canvas)
    currentCanvasId.value = id
    clearHistory()
    persist()
    return canvas
  }

  function switchCanvas(id: string) {
    const canvas = canvases.value.find(c => c.id === id)
    if (canvas) {
      currentCanvasId.value = id
      clearHistory()
      selectedNoteId.value = null
    }
  }

  function deleteCanvas(id: string) {
    const index = canvases.value.findIndex(c => c.id === id)
    if (index === -1) return

    canvases.value.splice(index, 1)

    if (currentCanvasId.value === id) {
      currentCanvasId.value = canvases.value[0]?.id ?? null
      clearHistory()
      if (!currentCanvasId.value) {
        createCanvas()
      }
    }
    persist()
  }

  function renameCanvas(id: string, name: string) {
    const canvas = canvases.value.find(c => c.id === id)
    if (canvas) {
      canvas.name = name
      canvas.updatedAt = Date.now()
      persist()
    }
  }

  function duplicateCanvas(id: string): CanvasInstance {
    const source = canvases.value.find(c => c.id === id)
    if (!source) throw new Error('Canvas not found')

    const newCanvas: CanvasInstance = {
      ...source,
      id: `canvas_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      name: `${source.name} (副本)`,
      notes: source.notes.map((n: StickyNote) => ({ ...n, id: generateNoteId(), createdAt: Date.now(), updatedAt: Date.now() })),
      blocks: source.blocks.map(b => ({ ...b })),
      snapshots: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    canvases.value.push(newCanvas)
    currentCanvasId.value = newCanvas.id
    clearHistory()
    persist()
    return newCanvas
  }

  function updateCanvas(patches: Partial<CanvasInstance>) {
    if (!currentCanvas.value) return
    Object.assign(currentCanvas.value, patches, { updatedAt: Date.now() })
    persist()
  }

  function setViewport(viewport: Partial<ViewportState>) {
    if (!currentCanvas.value) return
    currentCanvas.value.viewport = { ...currentCanvas.value.viewport, ...viewport }
  }

  function addNote(blockId: string | null, x?: number, y?: number, color?: StickyNote['color']): StickyNote {
    if (!currentCanvas.value) throw new Error('No active canvas')
    pushUndo()
    const note = createEmptyNote(blockId, x, y, color)
    currentCanvas.value.notes.push(note)
    currentCanvas.value.updatedAt = Date.now()
    pendingEditNoteId.value = note.id
    persist()
    return note
  }

  function updateNote(noteId: string, patches: Partial<StickyNote>) {
    if (!currentCanvas.value) return
    pushUndo()
    const note = currentCanvas.value.notes.find((n: StickyNote) => n.id === noteId)
    if (note) {
      Object.assign(note, patches, { updatedAt: Date.now() })
      currentCanvas.value.updatedAt = Date.now()
      persist()
    }
  }

  function deleteNote(noteId: string) {
    if (!currentCanvas.value) return
    pushUndo()
    const index = currentCanvas.value.notes.findIndex((n: StickyNote) => n.id === noteId)
    if (index !== -1) {
      if (selectedNoteId.value === noteId) selectedNoteId.value = null
      currentCanvas.value.notes.splice(index, 1)
      currentCanvas.value.updatedAt = Date.now()
      persist()
    }
  }

  /** 目标区块的追加位置：现有最大 order + 1（order 混用时间戳，不能用数量） */
  function nextOrder(blockId: string | null, excludeIds: string[] = []): number {
    if (!currentCanvas.value) return 0
    const exclude = new Set(excludeIds)
    const orders = currentCanvas.value.notes
      .filter(n => n.blockId === blockId && !exclude.has(n.id))
      .map(n => n.order)
    return orders.length ? Math.max(...orders) + 1 : 0
  }

  function moveNote(noteId: string, targetBlockId: string | null): void {
    if (!currentCanvas.value) return
    pushUndo()
    const note = currentCanvas.value.notes.find((n: StickyNote) => n.id === noteId)
    if (note) {
      note.blockId = targetBlockId
      note.order = nextOrder(targetBlockId, [noteId])
      note.updatedAt = Date.now()
      currentCanvas.value.updatedAt = Date.now()
      persist()
    }
  }

  function reorderNotes(blockId: string, activeId: string, overId: string) {
    if (!currentCanvas.value) return
    pushUndo()
    const blockNotes = currentCanvas.value.notes
      .filter((n: StickyNote) => n.blockId === blockId)
      .sort((a: StickyNote, b: StickyNote) => a.order - b.order)

    const activeIndex = blockNotes.findIndex((n: StickyNote) => n.id === activeId)
    const overIndex = blockNotes.findIndex((n: StickyNote) => n.id === overId)
    if (activeIndex === -1 || overIndex === -1) return

    const [removed] = blockNotes.splice(activeIndex, 1)
    blockNotes.splice(overIndex, 0, removed)

    blockNotes.forEach((note: StickyNote, index: number) => {
      note.order = index
      note.updatedAt = Date.now()
    })
    currentCanvas.value.updatedAt = Date.now()
    persist()
  }

  function duplicateNote(noteId: string) {
    if (!currentCanvas.value) return
    pushUndo()
    const source = currentCanvas.value.notes.find((n: StickyNote) => n.id === noteId)
    if (!source) return

    const newNote: StickyNote = {
      ...source,
      id: generateNoteId(),
      title: source.title,
      content: source.content,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      order: source.order + 0.5,
    }
    currentCanvas.value.notes.push(newNote)
    currentCanvas.value.updatedAt = Date.now()
    persist()
    return newNote
  }

  function createSnapshot(name?: string) {
    if (!currentCanvas.value) return
    const snapshot: CanvasSnapshot = {
      id: `snapshot_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      name: name ?? `快照 ${currentCanvas.value.snapshots.length + 1}`,
      notes: currentCanvas.value.notes.map((n: StickyNote) => ({ ...n })),
      blocks: currentCanvas.value.blocks.map(b => ({ ...b })),
      viewport: { ...currentCanvas.value.viewport },
      createdAt: Date.now(),
    }
    currentCanvas.value.snapshots.unshift(snapshot)
    if (currentCanvas.value.snapshots.length > MAX_SNAPSHOTS) {
      currentCanvas.value.snapshots.pop()
    }
    persist()
    return snapshot
  }

  function restoreSnapshot(snapshotId: string) {
    if (!currentCanvas.value) return
    const snapshot = currentCanvas.value.snapshots.find(s => s.id === snapshotId)
    if (!snapshot) return

    // 恢复前：内存撤销栈 + 持久化备份快照，双保险
    pushUndo()
    const now = new Date()
    const hh = String(now.getHours()).padStart(2, '0')
    const mm = String(now.getMinutes()).padStart(2, '0')
    createSnapshot(`恢复前 ${hh}:${mm}`)

    currentCanvas.value.notes = snapshot.notes.map((n: StickyNote) => ({ ...n, updatedAt: Date.now() }))
    currentCanvas.value.blocks = snapshot.blocks.map(b => ({ ...b }))
    currentCanvas.value.viewport = { ...snapshot.viewport }
    currentCanvas.value.updatedAt = Date.now()
    selectedNoteId.value = null
    persist()
  }

  /** 批量填充示例内容（B4）：整批只算一步撤销 */
  function fillExample(seedsByBlock: Record<string, { t?: string; c?: string }[]>): number {
    if (!currentCanvas.value) return 0
    pushUndo()
    const palette: StickyNote['color'][] = ['yellow', 'blue', 'green', 'pink', 'orange']
    let order = 0
    let count = 0
    for (const [blockId, seeds] of Object.entries(seedsByBlock)) {
      for (const seed of seeds) {
        const note = createEmptyNote(blockId)
        note.title = seed.t ?? ''
        note.content = seed.c ?? ''
        note.order = order++
        note.color = palette[count % palette.length]
        currentCanvas.value.notes.push(note)
        count++
      }
    }
    currentCanvas.value.updatedAt = Date.now()
    persist()
    return count
  }

  function deleteSnapshot(snapshotId: string) {
    if (!currentCanvas.value) return
    const index = currentCanvas.value.snapshots.findIndex(s => s.id === snapshotId)
    if (index !== -1) {
      currentCanvas.value.snapshots.splice(index, 1)
      persist()
    }
  }

  function exportCanvas(): string {
    if (!currentCanvas.value) return '{}'
    return JSON.stringify(currentCanvas.value, null, 2)
  }

  function importCanvas(json: string): CanvasInstance {
    const data = JSON.parse(json) as Partial<CanvasInstance>
    if (!data || !Array.isArray(data.notes) || !Array.isArray(data.blocks)) {
      throw new Error('INVALID_CANVAS_JSON')
    }
    pushUndo()
    const newCanvas: CanvasInstance = {
      ...(data as CanvasInstance),
      id: `canvas_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      name: `${data.name} (导入)`,
      notes: data.notes.map((n: StickyNote) => ({ ...n, id: generateNoteId(), createdAt: Date.now(), updatedAt: Date.now() })),
      blocks: data.blocks.map(b => ({ ...b })),
      snapshots: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    canvases.value.push(newCanvas)
    currentCanvasId.value = newCanvas.id
    clearHistory()
    persist()
    return newCanvas
  }

  function persist() {
    storage.save(wrapPayload(canvases.value))
  }

  /** Ctrl+Shift+S 显式保存 */
  function saveCanvas() {
    persist()
  }

  function setTemplate(tpl: CanvasTemplate) {
    template.value = tpl
  }

  return {
    canvases,
    currentCanvasId,
    template,
    currentCanvas,
    currentTemplate,
    selectedNoteId,
    selectedIds,
    pendingEditNoteId,
    canUndo,
    canRedo,
    init,
    switchUser,
    logout,
    selectNote,
    selectOnly,
    toggleSelect,
    setSelection,
    getSelectedNote,
    deleteNotes,
    duplicateNotes,
    colorNotes,
    moveNotesToBlock,
    saveCanvas,
    pushUndo,
    undo,
    redo,
    fillExample,
    createCanvas,
    switchCanvas,
    deleteCanvas,
    renameCanvas,
    duplicateCanvas,
    updateCanvas,
    setViewport,
    addNote,
    updateNote,
    deleteNote,
    moveNote,
    reorderNotes,
    duplicateNote,
    createSnapshot,
    restoreSnapshot,
    deleteSnapshot,
    exportCanvas,
    importCanvas,
    setTemplate,
  }
})