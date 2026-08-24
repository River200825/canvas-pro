import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { exportMarkdown, exportJSON, exportPNG } from '../export'
import { sanitizeWinAnsi } from '../export-pdf'
import { getTemplateById } from '@/templates'
import type { CanvasInstance } from '@/types'
import type { StickyNote } from '@/types/note'

function makeCanvas(): CanvasInstance {
  const tpl = getTemplateById('business-model-canvas')
  const now = Date.now()
  const note = (id: string, blockId: string, title: string, content: string, order: number): StickyNote => ({
    id,
    blockId,
    title,
    content,
    color: 'yellow',
    order,
    x: 0,
    y: 0,
    width: 200,
    height: 150,
    zIndex: 1,
    locked: false,
    createdAt: now,
    updatedAt: now,
  })

  return {
    id: 'c1',
    templateId: tpl.id,
    name: '测试画布',
    mode: 'grid',
    blocks: tpl.blocks.map(b => ({ ...b, collapsed: false })),
    notes: [
      note('n1', 'key-partners', '伙伴A', '第一行\n第二行', 0),
      note('n2', 'key-partners', '', '无标题便利贴', 1),
      note('n3', 'value-propositions', '价值点', '独特卖点', 0),
    ],
    viewport: { x: 0, y: 0, scale: 1 },
    createdAt: now,
    updatedAt: now,
    snapshots: [],
  }
}

interface CapturedDownload {
  blob: Blob
  filename: string
}

const downloads: CapturedDownload[] = []

beforeEach(() => {
  downloads.length = 0
  vi.stubGlobal('URL', {
    createObjectURL: (blob: Blob) => {
      downloads.push({ blob, filename: '' })
      return `blob:mock-${downloads.length}`
    },
    revokeObjectURL: () => {},
  })
  // downloadBlob 在 click 前已设置 a.download，此时记录文件名
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
    const entry = downloads[downloads.length - 1]
    if (entry) entry.filename = this.download
  })
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('exportMarkdown', () => {
  it('生成含标题、模板元信息与分区块内容', async () => {
    const canvas = makeCanvas()
    const tpl = getTemplateById('business-model-canvas')
    exportMarkdown(canvas, tpl)

    expect(downloads).toHaveLength(1)
    const { filename } = downloads[0]
    const text = await downloads[0].blob.text()

    expect(filename).toContain('测试画布')
    expect(filename.endsWith('.md')).toBe(true)
    expect(text).toContain('# 测试画布')
    expect(text).toContain(tpl.name)
    expect(text).toContain('## 关键合作')
    expect(text).toContain('**伙伴A**')
    expect(text).toContain('第二行')
    expect(text).toContain('**价值点**')
    // 空区块不输出
    expect(text).not.toContain('## 成本结构')
  })

  it('无标题便利贴仅输出内容行', async () => {
    exportMarkdown(makeCanvas(), getTemplateById('business-model-canvas'))
    const text = await downloads[0].blob.text()
    const lines = text.split('\n')
    const idx = lines.findIndex(l => l === '  无标题便利贴')
    expect(idx).toBeGreaterThan(0)
    expect(lines[idx - 1]).toBe('')
  })
})

describe('exportJSON', () => {
  it('完整序列化画布', async () => {
    const canvas = makeCanvas()
    exportJSON(canvas)

    expect(downloads).toHaveLength(1)
    expect(downloads[0].filename.endsWith('.json')).toBe(true)
    const parsed = JSON.parse(await downloads[0].blob.text()) as CanvasInstance
    expect(parsed.id).toBe('c1')
    expect(parsed.notes).toHaveLength(3)
    expect(parsed.templateId).toBe('business-model-canvas')
  })
})

describe('exportPNG', () => {
  it('html-to-image 渲染失败时抛错', async () => {
    vi.doMock('html-to-image', () => ({
      toPng: vi.fn().mockRejectedValue(new Error('render failed')),
    }))
    const { exportPNG: mockedExportPNG } = await import('../export')
    const el = document.createElement('div')
    await expect(mockedExportPNG(el, 'x')).rejects.toThrow()
  })
})

describe('sanitizeWinAnsi（PDF 字体编码兜底）', () => {
  it('ASCII 与 Latin-1 保留', () => {
    expect(sanitizeWinAnsi('ABC abc 019 !?')).toBe('ABC abc 019 !?')
    expect(sanitizeWinAnsi('éüñ')).toBe('éüñ')
  })

  it('中文等非 WinAnsi 字符替换为 ?', () => {
    expect(sanitizeWinAnsi('商业模式')).toBe('????')
    expect(sanitizeWinAnsi('A中文B')).toBe('A??B')
  })

  it('控制字符替换为 ?', () => {
    expect(sanitizeWinAnsi('a\tb')).toBe('a?b')
  })
})
