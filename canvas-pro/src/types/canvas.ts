import type { StickyNote } from './note'

export interface CanvasTemplate {
  id: string
  name: string
  nameEn: string
  description: string
  blocks: CanvasBlock[]
}

export interface CanvasBlock {
  id: string
  title: string
  titleEn: string
  order: number
  widthPercent: number
  /** 传统布局中的 grid-template-areas 区域名（如 BMC 的 partners/value/costs） */
  area?: string
  x?: number
  y?: number
  width?: number
  height?: number
  color?: string
  collapsed: boolean
}

export type CanvasMode = 'grid' | 'free'

export interface CanvasInstance {
  id: string
  templateId: string
  name: string
  mode: CanvasMode
  notes: StickyNote[]
  blocks: CanvasBlock[]
  viewport: ViewportState
  createdAt: number
  updatedAt: number
  snapshots: CanvasSnapshot[]
}

export interface CanvasSnapshot {
  id: string
  name: string
  notes: StickyNote[]
  blocks: CanvasBlock[]
  viewport: ViewportState
  createdAt: number
}

export interface ViewportState {
  x: number
  y: number
  scale: number
}

export interface CanvasState {
  currentCanvas: CanvasInstance | null
  canvases: CanvasInstance[]
  template: CanvasTemplate | null
}