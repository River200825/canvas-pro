import type { CanvasTemplate } from '@/types'

interface GridDefinition {
  columns: string
  rows: string
  areas: string
}

/**
 * 传统纸质画布的 grid-template-areas 布局。
 * 使用 10 列基准：顶部五列各占 2 列，底部成本/收入各占 5 列（对半）。
 */
const GRID_LAYOUTS: Record<string, GridDefinition> = {
  'business-model-canvas': {
    columns: 'repeat(10, minmax(0, 1fr))',
    rows: 'minmax(200px, auto) minmax(200px, auto) minmax(150px, auto)',
    areas: `
      "partners partners activities activities value value relations relations segments segments"
      "partners partners resources resources value value channels channels segments segments"
      "costs costs costs costs costs revenues revenues revenues revenues revenues"
    `,
  },
  'lean-canvas': {
    columns: 'repeat(10, minmax(0, 1fr))',
    rows: 'minmax(180px, auto) minmax(160px, auto) minmax(150px, auto)',
    areas: `
      "problems problems solution solution uvp uvp advantages advantages segments segments"
      "problems problems metrics metrics uvp uvp channel channel segments segments"
      "costs costs costs costs costs revenues revenues revenues revenues revenues"
    `,
  },
  swot: {
    columns: 'repeat(2, minmax(0, 1fr))',
    rows: 'minmax(260px, auto) minmax(260px, auto)',
    areas: `
      "strengths weaknesses"
      "opportunities threats"
    `,
  },
}

export function getGridDefinition(templateId: string): GridDefinition | null {
  return GRID_LAYOUTS[templateId] ?? null
}

export function getGridStyle(template: CanvasTemplate): Record<string, string> | null {
  const def = getGridDefinition(template.id)
  const hasAreas = template.blocks.some(b => b.area)
  if (!def || !hasAreas) return null

  return {
    display: 'grid',
    gap: '1rem',
    gridTemplateColumns: def.columns,
    gridTemplateRows: def.rows,
    gridTemplateAreas: def.areas,
    maxWidth: '1280px',
    margin: '0 auto',
  }
}
