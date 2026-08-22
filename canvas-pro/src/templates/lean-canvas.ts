import type { CanvasTemplate, CanvasBlock } from '@/types'

const leanCanvasBlocks: CanvasBlock[] = [
  { id: 'problem', title: '问题', titleEn: 'Problem', order: 0, widthPercent: 33.33, color: '#fee2e2', collapsed: false },
  { id: 'solution', title: '解决方案', titleEn: 'Solution', order: 1, widthPercent: 33.33, color: '#dcfce7', collapsed: false },
  { id: 'key-metrics', title: '关键指标', titleEn: 'Key Metrics', order: 2, widthPercent: 33.34, color: '#fef3c7', collapsed: false },
  { id: 'unique-value-proposition', title: '独特价值主张', titleEn: 'Unique Value Proposition', order: 3, widthPercent: 50, color: '#e0f2fe', collapsed: false },
  { id: 'unfair-advantage', title: '不公平优势', titleEn: 'Unfair Advantage', order: 4, widthPercent: 50, color: '#fce7f3', collapsed: false },
  { id: 'channels', title: '渠道通路', titleEn: 'Channels', order: 5, widthPercent: 33.33, color: '#fef3c7', collapsed: false },
  { id: 'customer-segments', title: '客户细分', titleEn: 'Customer Segments', order: 6, widthPercent: 33.33, color: '#e0f2fe', collapsed: false },
  { id: 'cost-structure', title: '成本结构', titleEn: 'Cost Structure', order: 7, widthPercent: 50, color: '#fee2e2', collapsed: false },
  { id: 'revenue-streams', title: '收入来源', titleEn: 'Revenue Streams', order: 8, widthPercent: 50, color: '#dcfce7', collapsed: false },
]

export const leanCanvasTemplate: CanvasTemplate = {
  id: 'lean-canvas',
  name: '精益画布',
  nameEn: 'Lean Canvas',
  description: 'Ash Maurya 精益创业 9 模块画布',
  blocks: leanCanvasBlocks,
}