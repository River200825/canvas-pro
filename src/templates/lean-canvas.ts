import type { CanvasTemplate, CanvasBlock } from '@/types'

const leanCanvasBlocks: CanvasBlock[] = [
  { id: 'problem', title: '问题', titleEn: 'Problem', order: 0, widthPercent: 33.33, color: '#fee2e2', hint: '目标客户最痛的 3 个问题是什么？现有方案为什么不够好', area: 'problems', collapsed: false },
  { id: 'solution', title: '解决方案', titleEn: 'Solution', order: 1, widthPercent: 33.33, color: '#dcfce7', hint: '针对每个痛点，你的产品给出的最简解决方式是什么', area: 'solution', collapsed: false },
  { id: 'key-metrics', title: '关键指标', titleEn: 'Key Metrics', order: 2, widthPercent: 33.34, color: '#fef3c7', hint: '用哪几个数字判断业务在变好？激活率、留存率、推荐系数', area: 'metrics', collapsed: false },
  { id: 'unique-value-proposition', title: '独特价值主张', titleEn: 'Unique Value Proposition', order: 3, widthPercent: 50, color: '#e0f2fe', hint: '一句让客户愿意转发的话：清晰、与众不同、令人信服', area: 'uvp', collapsed: false },
  { id: 'unfair-advantage', title: '不公平优势', titleEn: 'Unfair Advantage', order: 4, widthPercent: 50, color: '#fce7f3', hint: '对手无法轻易复制的东西：专利、独家数据、网络效应、社群', area: 'advantages', collapsed: false },
  { id: 'channels', title: '渠道通路', titleEn: 'Channels', order: 5, widthPercent: 33.33, color: '#fef3c7', hint: '客户如何知道你、购买你、被你交付？列出可规模化的获客路径', area: 'channel', collapsed: false },
  { id: 'customer-segments', title: '客户细分', titleEn: 'Customer Segments', order: 6, widthPercent: 33.33, color: '#e0f2fe', hint: '你的早期采用者是谁？越具体越好（人群 + 场景 + 痛点）', area: 'segments', collapsed: false },
  { id: 'cost-structure', title: '成本结构', titleEn: 'Cost Structure', order: 7, widthPercent: 50, color: '#fee2e2', hint: '固定成本（人力、服务器）与获客成本分别有哪些', area: 'costs', collapsed: false },
  { id: 'revenue-streams', title: '收入来源', titleEn: 'Revenue Streams', order: 8, widthPercent: 50, color: '#dcfce7', hint: '客户愿意为什么付钱？定价模式与毛利结构如何', area: 'revenues', collapsed: false },
]

export const leanCanvasTemplate: CanvasTemplate = {
  id: 'lean-canvas',
  name: '精益画布',
  nameEn: 'Lean Canvas',
  description: 'Ash Maurya 精益创业 9 模块画布',
  blocks: leanCanvasBlocks,
}