import { describe, expect, it } from 'vitest'
import { templates, getTemplate, getTemplateById, defaultTemplate } from '../index'
import { getGridDefinition, getGridStyle } from '../layout'

describe('模板定义完整性', () => {
  it('包含三个内置模板', () => {
    expect(templates.map(t => t.id)).toEqual([
      'business-model-canvas',
      'lean-canvas',
      'swot',
    ])
  })

  it.each(templates.map(t => [t.id, t] as const))('%s：区块 id 唯一且 order 连续', (_id, tpl) => {
    const ids = tpl.blocks.map(b => b.id)
    expect(new Set(ids).size).toBe(ids.length)

    const orders = tpl.blocks.map(b => b.order).sort((a, b) => a - b)
    orders.forEach((order, i) => expect(order).toBe(i))
  })

  it.each(templates.map(t => [t.id, t] as const))('%s：每个区块都有颜色与标题', (_id, tpl) => {
    for (const block of tpl.blocks) {
      expect(block.title).toBeTruthy()
      expect(block.titleEn).toBeTruthy()
      expect(block.color).toMatch(/^#[0-9a-fA-F]{6}$/)
      expect(block.widthPercent).toBeGreaterThan(0)
    }
  })

  it('getTemplate 未命中返回 undefined，getTemplateById 兜底默认模板', () => {
    expect(getTemplate('nope')).toBeUndefined()
    expect(getTemplateById('nope')).toBe(defaultTemplate)
    expect(getTemplateById('swot').id).toBe('swot')
  })
})

describe('传统布局定义（layout.ts）', () => {
  function parseAreas(def: { areas: string }): Set<string> {
    return new Set(
      def.areas
        .split(/\s+/)
        .map(t => t.replace(/"/g, ''))
        .filter(t => t.length > 0)
    )
  }

  it('三个模板均有布局定义', () => {
    for (const tpl of templates) {
      expect(getGridDefinition(tpl.id), tpl.id).not.toBeNull()
    }
  })

  it('布局行列 token 数一致（每行 10 列 / SWOT 2 列）', () => {
    const bmc = getGridDefinition('business-model-canvas')!
    const rows = bmc.areas.trim().split('\n').map(r => r.trim().split(/\s+/))
    expect(rows).toHaveLength(3)
    for (const row of rows) expect(row).toHaveLength(10)

    const swot = getGridDefinition('swot')!
    const swotRows = swot.areas.trim().split('\n').map(r => r.trim().split(/\s+/))
    expect(swotRows).toHaveLength(2)
    for (const row of swotRows) expect(row).toHaveLength(2)
  })

  it.each(templates.map(t => [t.id, t] as const))('%s：区块 area 与布局定义互相匹配', (id, tpl) => {
    const def = getGridDefinition(id)!
    const defAreas = parseAreas(def)
    for (const block of tpl.blocks) {
      expect(block.area, `${id}/${block.id}`).toBeTruthy()
      expect(defAreas.has(block.area!), `${id}/${block.area}`).toBe(true)
    }
    // 布局中每个区域都至少被一个区块使用
    const blockAreas = new Set(tpl.blocks.map(b => b.area))
    for (const area of defAreas) {
      expect(blockAreas.has(area), `布局区域 ${area} 无对应区块`).toBe(true)
    }
  })

  it('BMC 传统布局：成本/收入各占底半，五列顶部', () => {
    const bmc = getGridDefinition('business-model-canvas')!
    expect(bmc.areas).toContain('"costs costs costs costs costs revenues revenues revenues revenues revenues"')
    expect(bmc.areas).toContain('"partners partners activities activities value value relations relations segments segments"')
  })

  it('getGridStyle 返回完整 grid 样式', () => {
    const tpl = getTemplateById('business-model-canvas')
    const style = getGridStyle(tpl)!
    expect(style.display).toBe('grid')
    expect(style.gridTemplateColumns).toContain('repeat(10')
    expect(style.gridTemplateAreas).toContain('partners')
  })

  it('无 area 的模板返回 null（走通用网格）', () => {
    const tpl = { ...getTemplateById('swot'), blocks: getTemplateById('swot').blocks.map(b => ({ ...b, area: undefined })) }
    expect(getGridStyle(tpl as typeof tpl & { blocks: { area?: string }[] })).toBeNull()
  })
})
