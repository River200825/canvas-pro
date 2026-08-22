import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CanvasInstance, CanvasTemplate, CanvasSnapshot, StickyNote, ViewportState, CanvasMode } from '@/types'
import { getTemplateById, templates } from '@/templates'
import { generateNoteId, createEmptyNote } from '@/types/note'
import { useLocalStorage } from '@/composables/useLocalStorage'

const STORAGE_KEY = 'canvas-pro:v1'
const MAX_SNAPSHOTS = 20

export const useCanvasStore = defineStore('canvas', () => {
  const { load, save } = useLocalStorage<CanvasInstance[]>(STORAGE_KEY, [])

  const canvases = ref<CanvasInstance[]>([])
  const currentCanvasId = ref<string | null>(null)
  const template = ref<CanvasTemplate>(templates[0])

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

  function init() {
    const stored = load()
    if (stored.length > 0 && isValidCanvasArray(stored)) {
      canvases.value = stored
      currentCanvasId.value = stored[0].id
    } else {
      if (stored.length > 0) {
        save([])
      }
      createCanvas()
    }
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
    persist()
    return canvas
  }

  function switchCanvas(id: string) {
    const canvas = canvases.value.find(c => c.id === id)
    if (canvas) {
      currentCanvasId.value = id
    }
  }

  function deleteCanvas(id: string) {
    const index = canvases.value.findIndex(c => c.id === id)
    if (index === -1) return

    canvases.value.splice(index, 1)

    if (currentCanvasId.value === id) {
      currentCanvasId.value = canvases.value[0]?.id ?? null
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
    const note = createEmptyNote(blockId, x, y, color)
    currentCanvas.value.notes.push(note)
    currentCanvas.value.updatedAt = Date.now()
    persist()
    return note
  }

  function updateNote(noteId: string, patches: Partial<StickyNote>) {
    if (!currentCanvas.value) return
    const note = currentCanvas.value.notes.find((n: StickyNote) => n.id === noteId)
    if (note) {
      Object.assign(note, patches, { updatedAt: Date.now() })
      currentCanvas.value.updatedAt = Date.now()
      persist()
    }
  }

  function deleteNote(noteId: string) {
    if (!currentCanvas.value) return
    const index = currentCanvas.value.notes.findIndex((n: StickyNote) => n.id === noteId)
    if (index !== -1) {
      currentCanvas.value.notes.splice(index, 1)
      currentCanvas.value.updatedAt = Date.now()
      persist()
    }
  }

  function moveNote(noteId: string, targetBlockId: string | null, newOrder: number) {
    if (!currentCanvas.value) return
    const note = currentCanvas.value.notes.find((n: StickyNote) => n.id === noteId)
    if (note) {
      note.blockId = targetBlockId
      note.order = newOrder
      note.updatedAt = Date.now()
      currentCanvas.value.updatedAt = Date.now()
      persist()
    }
  }

  function reorderNotes(blockId: string, activeId: string, overId: string) {
    if (!currentCanvas.value) return
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

    currentCanvas.value.notes = snapshot.notes.map((n: StickyNote) => ({ ...n, updatedAt: Date.now() }))
    currentCanvas.value.blocks = snapshot.blocks.map(b => ({ ...b }))
    currentCanvas.value.viewport = { ...snapshot.viewport }
    currentCanvas.value.updatedAt = Date.now()
    persist()
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
    const data = JSON.parse(json) as CanvasInstance
    const newCanvas: CanvasInstance = {
      ...data,
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
    persist()
    return newCanvas
  }

  function persist() {
    save(canvases.value)
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
    init,
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