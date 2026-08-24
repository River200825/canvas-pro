import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { exportPDF, sanitizeWinAnsi } from '../export-pdf'

interface FakePage {
  size: [number, number]
  images: { y: number; width: number; height: number }[]
  texts: { text: string; y: number }[]
}

const fakePdfState = {
  pages: [] as FakePage[],
}

// 在任何 spy 之前捕获原始 createElement，避免递归
const originalCreateElement = document.createElement.bind(document)
let sliceCounter = 0

vi.mock('pdf-lib', () => {
  function makePage(size: [number, number]) {
    const page: FakePage = { size, images: [], texts: [] }
    fakePdfState.pages.push(page)
    return {
      drawImage: (_img: unknown, opts: { y: number; width: number; height: number }) => {
        page.images.push({ y: opts.y, width: opts.width, height: opts.height })
      },
      drawText: (text: string, opts: { y: number }) => {
        page.texts.push({ text, y: opts.y })
      },
    }
  }

  return {
    PDFDocument: {
      create: vi.fn(async () => ({
        addPage: makePage,
        embedFont: vi.fn(async () => ({ widthOfTextAtSize: () => 50 })),
        embedPng: vi.fn(async (dataUrl: string) => ({
          width: 1000,
          height: dataUrl.includes('tall') ? 3000 : 800,
          __dataUrl: dataUrl,
        })),
        save: vi.fn(async () => new Uint8Array([37, 80, 68, 70])),
      })),
    },
    StandardFonts: { Helvetica: 'Helvetica', HelveticaBold: 'Helvetica-Bold' },
    rgb: (r: number, g: number, b: number) => ({ r, g, b }),
  }
})

vi.mock('html-to-image', () => ({
  toPng: vi.fn(async () => 'data:image/png;base64,mock'),
}))

/** happy-dom 不会因设置 src 触发加载，用假 Image 模拟 */
class FakeImage {
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  naturalWidth = 1000
  naturalHeight = 800
  #url = ''
  get src(): string {
    return this.#url
  }
  set src(value: string) {
    this.#url = value
    this.naturalHeight = value.includes('tall') ? 3000 : 800
    queueMicrotask(() => this.onload?.())
  }
}

beforeEach(() => {
  fakePdfState.pages = []
  sliceCounter = 0
  vi.stubGlobal('Image', FakeImage)
  vi.stubGlobal('URL', {
    createObjectURL: () => 'blob:mock',
    revokeObjectURL: () => {},
  })
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
  // happy-dom 无 2D 上下文，桩掉 canvas 用于分页切片
  vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
    if (tag === 'canvas') {
      return {
        width: 0,
        height: 0,
        getContext: () => ({ fillStyle: '', fillRect() {}, drawImage() {} }),
        toDataURL: () => `data:image/png;base64,slice-${++sliceCounter}`,
      } as unknown as HTMLCanvasElement
    }
    return originalCreateElement(tag)
  })
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

const el = () => document.createElement('div')

describe('exportPDF 编排', () => {
  it('内容不超过一页时生成单页 A4 纵向 PDF', async () => {
    const pages = await exportPDF(el(), '画布名', '商业模式画布', Date.now(), {
      paper: 'a4',
      orientation: 'portrait',
    })

    expect(pages).toBe(1)
    expect(fakePdfState.pages).toHaveLength(1)
    const page = fakePdfState.pages[0]
    expect(page.size).toEqual([595.28, 841.89]) // A4 portrait
    expect(page.images).toHaveLength(1)
    // 页眉两行（画布名 + 元信息）+ 页脚页码
    expect(page.texts).toHaveLength(3)
  })

  it('横向下纸张宽高互换', async () => {
    await exportPDF(el(), 'x', 'y', Date.now(), { paper: 'a4', orientation: 'landscape' })
    const [w, h] = fakePdfState.pages[0].size
    expect(w).toBeGreaterThan(h)
  })

  it('A3 纵向使用 A3 尺寸', async () => {
    await exportPDF(el(), 'x', 'y', Date.now(), { paper: 'a3', orientation: 'portrait' })
    expect(fakePdfState.pages[0].size).toEqual([841.89, 1190.55])
  })

  it('超高内容自动分页（多页切片）', async () => {
    // mock embedPng 高度 3000：fullDrawH = 3000 * (515.28/1000) ≈ 1546 > 首页可用高度 → 分页
    const { toPng } = await import('html-to-image')
    vi.mocked(toPng).mockResolvedValueOnce('data:image/png;base64,tall')

    const pages = await exportPDF(el(), '长画布', '模板', Date.now(), { paper: 'a4' })
    expect(pages).toBeGreaterThan(1)
    expect(fakePdfState.pages.length).toBe(pages)
    // 每页都有页脚页码
    for (const page of fakePdfState.pages) {
      expect(page.texts.at(-1)?.text).toMatch(/^\d+ \/ \d+$/)
    }
  })

  it('非 WinAnsi 页眉被清洗为 ?', async () => {
    await exportPDF(el(), '中文画布', '模板', Date.now(), {})
    const texts = fakePdfState.pages[0].texts.map(t => t.text)
    expect(texts[0]).toBe('????')
    expect(texts[1]).toContain('?')
  })

  it('渲染失败时向上抛错', async () => {
    const { toPng } = await import('html-to-image')
    vi.mocked(toPng).mockRejectedValueOnce(new Error('boom'))
    await expect(exportPDF(el(), 'x', 'y', Date.now())).rejects.toThrow('boom')
  })
})

describe('sanitizeWinAnsi', () => {
  it('Latin-1 保留、CJK 替换', () => {
    expect(sanitizeWinAnsi('Hello 世界 123')).toBe('Hello ?? 123')
  })
})
