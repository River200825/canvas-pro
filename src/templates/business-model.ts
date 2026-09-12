import type { CanvasTemplate, CanvasBlock } from '@/types'

const businessModelBlocks: CanvasBlock[] = [
  { id: 'key-partners', title: '关键合作', titleEn: 'Key Partners', order: 0, widthPercent: 33.33, color: '#e0f2fe', hint: '谁是我们的重要伙伴？供应商、渠道、战略联盟都算。例如 Uber 依赖司机群体与地图服务商', area: 'partners', collapsed: false },
  { id: 'key-activities', title: '关键业务', titleEn: 'Key Activities', order: 1, widthPercent: 33.33, color: '#fef3c7', hint: '为了提供价值，我们必须做的最重要的事。例如：平台研发、动态定价算法', area: 'activities', collapsed: false },
  { id: 'key-resources', title: '核心资源', titleEn: 'Key Resources', order: 2, widthPercent: 33.34, color: '#fce7f3', hint: '支撑模式运转的关键资产：实体、知识、人力、资金。例如：双边网络、品牌、数据', area: 'resources', collapsed: false },
  { id: 'value-propositions', title: '价值主张', titleEn: 'Value Propositions', order: 3, widthPercent: 50, color: '#dcfce7', hint: '我们向客户传递什么价值？解决什么痛点？一句话说清「客户为什么选你」', area: 'value', collapsed: false },
  { id: 'customer-relationships', title: '客户关系', titleEn: 'Customer Relationships', order: 4, widthPercent: 33.33, color: '#fef3c7', hint: '每类客户期待什么关系？自助服务、专属客服、社群还是共创', area: 'relations', collapsed: false },
  { id: 'channels', title: '渠道通路', titleEn: 'Channels', order: 5, widthPercent: 33.33, color: '#e0f2fe', hint: '通过什么方式触达并服务客户？App、官网、门店、口碑传播', area: 'channels', collapsed: false },
  { id: 'customer-segments', title: '客户细分', titleEn: 'Customer Segments', order: 6, widthPercent: 33.34, color: '#fce7f3', hint: '我们在为谁创造价值？谁是最重要的客户。可按人群、地域、场景划分', area: 'segments', collapsed: false },
  { id: 'cost-structure', title: '成本结构', titleEn: 'Cost Structure', order: 7, widthPercent: 50, color: '#fee2e2', hint: '运营这个模式要付出什么？列出主要的固定成本与可变成本', area: 'costs', collapsed: false },
  { id: 'revenue-streams', title: '收入来源', titleEn: 'Revenue Streams', order: 8, widthPercent: 50, color: '#dcfce7', hint: '客户为什么付费、怎么付费？订阅、抽成、买断还是广告', area: 'revenues', collapsed: false },
]

export const businessModelTemplate: CanvasTemplate = {
  id: 'business-model-canvas',
  name: '商业模式画布',
  nameEn: 'Business Model Canvas',
  description: 'Alexander Osterwalder 标准 9 大模块商业模式画布',
  blocks: businessModelBlocks,
}