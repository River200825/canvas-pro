export type NoteColorId =
  | 'yellow'
  | 'blue'
  | 'green'
  | 'pink'
  | 'orange'
  | 'purple'
  | 'gray'

export interface NoteColor {
  id: NoteColorId
  bg: string
  border: string
  darkBg: string
  darkBorder: string
}

export const NOTE_COLORS: readonly NoteColor[] = [
  { id: 'yellow', bg: '#fef08a', border: '#fde047', darkBg: '#713f12', darkBorder: '#fde047' },
  { id: 'blue', bg: '#bfdbfe', border: '#60a5fa', darkBg: '#1e3a5f', darkBorder: '#60a5fa' },
  { id: 'green', bg: '#bbf7d0', border: '#4ade80', darkBg: '#14532d', darkBorder: '#4ade80' },
  { id: 'pink', bg: '#fbcfe8', border: '#f472b6', darkBg: '#831843', darkBorder: '#f472b6' },
  { id: 'orange', bg: '#ffedd5', border: '#fb923c', darkBg: '#7c2d12', darkBorder: '#fb923c' },
  { id: 'purple', bg: '#e9d5ff', border: '#c084fc', darkBg: '#581c87', darkBorder: '#c084fc' },
  { id: 'gray', bg: '#f3f4f6', border: '#9ca3af', darkBg: '#374151', darkBorder: '#9ca3af' },
] as const

export function getNoteColor(id: NoteColorId): NoteColor {
  return NOTE_COLORS.find(c => c.id === id) ?? NOTE_COLORS[0]
}

export function getDefaultNoteColor(): NoteColorId {
  return 'yellow'
}

export function generateNoteId(): string {
  return `note_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export interface StickyNote {
  id: string
  blockId: string | null
  title: string
  content: string
  color: NoteColorId
  order: number
  x: number
  y: number
  width: number
  height: number
  zIndex: number
  locked: boolean
  createdAt: number
  updatedAt: number
}

export function createEmptyNote(
  blockId: string | null = null,
  x = 100,
  y = 100,
  color: NoteColorId = getDefaultNoteColor()
): StickyNote {
  const now = Date.now()
  return {
    id: generateNoteId(),
    blockId,
    title: '',
    content: '',
    color,
    order: Date.now(),
    x,
    y,
    width: 200,
    height: 150,
    zIndex: 1,
    locked: false,
    createdAt: now,
    updatedAt: now,
  }
}