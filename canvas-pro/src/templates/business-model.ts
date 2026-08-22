import type { CanvasTemplate, CanvasBlock } from '@/types'

const businessModelBlocks: CanvasBlock[] = [
  { id: 'key-partners', title: '关键合作', titleEn: 'Key Partners', order: 0, widthPercent: 33.33, color: '#e0f2fe', area: 'partners', collapsed: false },
  { id: 'key-activities', title: '关键业务', titleEn: 'Key Activities', order: 1, widthPercent: 33.33, color: '#fef3c7', area: 'activities', collapsed: false },
  { id: 'key-resources', title: '核心资源', titleEn: 'Key Resources', order: 2, widthPercent: 33.34, color: '#fce7f3', area: 'resources', collapsed: false },
  { id: 'value-propositions', title: '价值主张', titleEn: 'Value Propositions', order: 3, widthPercent: 50, color: '#dcfce7', area: 'value', collapsed: false },
  { id: 'customer-relationships', title: '客户关系', titleEn: 'Customer Relationships', order: 4, widthPercent: 33.33, color: '#fef3c7', area: 'relations', collapsed: false },
  { id: 'channels', title: '渠道通路', titleEn: 'Channels', order: 5, widthPercent: 33.33, color: '#e0f2fe', area: 'channels', collapsed: false },
  { id: 'customer-segments', title: '客户细分', titleEn: 'Customer Segments', order: 6, widthPercent: 33.34, color: '#fce7f3', area: 'segments', collapsed: false },
  { id: 'cost-structure', title: '成本结构', titleEn: 'Cost Structure', order: 7, widthPercent: 50, color: '#fee2e2', area: 'costs', collapsed: false },
  { id: 'revenue-streams', title: '收入来源', titleEn: 'Revenue Streams', order: 8, widthPercent: 50, color: '#dcfce7', area: 'revenues', collapsed: false },
]

export const businessModelTemplate: CanvasTemplate = {
  id: 'business-model-canvas',
  name: '商业模式画布',
  nameEn: 'Business Model Canvas',
  description: 'Alexander Osterwalder 标准 9 大模块商业模式画布',
  blocks: businessModelBlocks,
}