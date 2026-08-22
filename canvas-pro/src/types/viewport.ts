export interface ViewportState {
  x: number
  y: number
  scale: number
}

export interface ViewportAction {
  type: 'pan' | 'zoom' | 'reset'
  payload?: {
    x?: number
    y?: number
    scale?: number
    centerX?: number
    centerY?: number
  }
}

export const DEFAULT_VIEWPORT: ViewportState = {
  x: 0,
  y: 0,
  scale: 1,
}

export const VIEWPORT_CONSTRAINTS = {
  minScale: 0.1,
  maxScale: 5,
  panBounds: {
    minX: -10000,
    maxX: 10000,
    minY: -10000,
    maxY: 10000,
  },
} as const