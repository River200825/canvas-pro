import type { CanvasTemplate, CanvasBlock } from '@/types'

const swotBlocks: CanvasBlock[] = [
  { id: 'strengths', title: '优势', titleEn: 'Strengths', order: 0, widthPercent: 50, color: '#dcfce7', area: 'strengths', collapsed: false },
  { id: 'weaknesses', title: '劣势', titleEn: 'Weaknesses', order: 1, widthPercent: 50, color: '#fee2e2', area: 'weaknesses', collapsed: false },
  { id: 'opportunities', title: '机会', titleEn: 'Opportunities', order: 2, widthPercent: 50, color: '#e0f2fe', area: 'opportunities', collapsed: false },
  { id: 'threats', title: '威胁', titleEn: 'Threats', order: 3, widthPercent: 50, color: '#fef3c7', area: 'threats', collapsed: false },
]

export const swotTemplate: CanvasTemplate = {
  id: 'swot',
  name: 'SWOT 分析',
  nameEn: 'SWOT Analysis',
  description: '优势、劣势、机会、威胁四象限分析',
  blocks: swotBlocks,
}