import type { CanvasTemplate, CanvasBlock } from '@/types'

const swotBlocks: CanvasBlock[] = [
  { id: 'strengths', title: '优势', titleEn: 'Strengths', order: 0, widthPercent: 50, color: '#dcfce7', hint: '内部积极因素：你比对对手做得好的地方。团队、技术、成本、品牌', area: 'strengths', collapsed: false },
  { id: 'weaknesses', title: '劣势', titleEn: 'Weaknesses', order: 1, widthPercent: 50, color: '#fee2e2', hint: '内部消极因素：坦诚列出短板，才能制定改进策略', area: 'weaknesses', collapsed: false },
  { id: 'opportunities', title: '机会', titleEn: 'Opportunities', order: 2, widthPercent: 50, color: '#e0f2fe', hint: '外部积极趋势：市场变化、政策、技术浪潮中可乘的势', area: 'opportunities', collapsed: false },
  { id: 'threats', title: '威胁', titleEn: 'Threats', order: 3, widthPercent: 50, color: '#fef3c7', hint: '外部风险：竞争对手、替代品、政策变化可能带来的冲击', area: 'threats', collapsed: false },
]

export const swotTemplate: CanvasTemplate = {
  id: 'swot',
  name: 'SWOT 分析',
  nameEn: 'SWOT Analysis',
  description: '优势、劣势、机会、威胁四象限分析',
  blocks: swotBlocks,
}