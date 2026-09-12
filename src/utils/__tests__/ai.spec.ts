import { describe, expect, it } from 'vitest'
import { extractJson, parseGeneratedCanvas } from '../ai'
import { getTemplateById } from '@/templates'

const tpl = getTemplateById('business-model-canvas')

describe('extractJson', () => {
  it('容忍 markdown 代码块与前后缀文本', () => {
    const text = '好的，以下是草稿：\n```json\n{"blocks":[]}\n```\n希望有帮助'
    expect(extractJson(text)).toEqual({ blocks: [] })
  })

  it('无 JSON 时抛错', () => {
    expect(() => extractJson('抱歉我无法完成')).toThrow('NO_JSON')
  })
})

describe('parseGeneratedCanvas', () => {
  it('解析合法草稿：过滤非法 blockId 与空便签', () => {
    const text = JSON.stringify({
      blocks: [
        { blockId: 'key-partners', notes: [{ title: '司机', content: '运力基础' }, { title: '', content: '' }] },
        { blockId: 'not-exist', notes: [{ title: 'x', content: 'y' }] },
        { blockId: 'value-propositions', notes: [{ title: '一键叫车', content: '随叫随到' }] },
      ],
    })
    const result = parseGeneratedCanvas(text, tpl)
    expect(Object.keys(result)).toEqual(['key-partners', 'value-propositions'])
    expect(result['key-partners']).toEqual([{ t: '司机', c: '运力基础' }])
  })

  it('兼容 title/content 字段名并截断超长文本', () => {
    const text = JSON.stringify({
      blocks: [{ blockId: 'channels', notes: [{ title: 'T'.repeat(50), content: 'C'.repeat(300) }] }],
    })
    const result = parseGeneratedCanvas(text, tpl)
    expect(result.channels![0].t).toHaveLength(30)
    expect(result.channels![0].c).toHaveLength(120)
  })

  it('每区块最多保留 4 条', () => {
    const notes = Array.from({ length: 6 }, (_, i) => ({ title: `n${i}`, content: 'x' }))
    const result = parseGeneratedCanvas(JSON.stringify({ blocks: [{ blockId: 'channels', notes }] }), tpl)
    expect(result.channels).toHaveLength(4)
  })

  it('全部无效时抛 EMPTY_RESULT', () => {
    const text = JSON.stringify({ blocks: [{ blockId: 'bad', notes: [{ title: 'x', content: 'y' }] }] })
    expect(() => parseGeneratedCanvas(text, tpl)).toThrow('EMPTY_RESULT')
  })
})
