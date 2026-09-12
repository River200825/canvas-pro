import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

export type PaperSize = 'a4' | 'a3'
export type Orientation = 'portrait' | 'landscape'

export interface PdfExportOptions {
  paper?: PaperSize
  orientation?: Orientation
}

const PAGE_SIZES: Record<PaperSize, { width: number; height: number }> = {
  a4: { width: 595.28, height: 841.89 },
  a3: { width: 841.89, height: 1190.55 },
}

const MARGIN_X = 40
const MARGIN_TOP_FIRST = 64
const MARGIN_TOP = 36
const MARGIN_BOTTOM = 36

/** 将超出 WinAnsi 编码范围的字符替换为 ?（pdf-lib 标准字体限制） */
export function sanitizeWinAnsi(text: string): string {
  return text
    .split('')
    .map(ch => {
      const code = ch.charCodeAt(0)
      if (code >= 32 && code <= 255) return ch
      return '?'
    })
    .join('')
}

function formatDate(ts: number): string {
  const d = new Date(ts)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

async function sliceDataUrl(
  dataUrl: string,
  sliceHeightPx: number,
  totalHeightPx: number,
  widthPx: number
): Promise<string[]> {
  const img = new Image()
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = () => reject(new Error('Failed to load rendered canvas image'))
    img.src = dataUrl
  })

  const slices: string[] = []
  let y = 0
  while (y < totalHeightPx) {
    const h = Math.min(sliceHeightPx, totalHeightPx - y)
    const canvas = document.createElement('canvas')
    canvas.width = widthPx
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D context unavailable')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, widthPx, h)
    ctx.drawImage(img, 0, y, widthPx, h, 0, 0, widthPx, h)
    slices.push(canvas.toDataURL('image/png'))
    y += h
  }
  return slices
}

export async function exportPDF(
  element: HTMLElement,
  canvasName: string,
  templateName: string,
  updatedAt: number,
  options: PdfExportOptions = {}
): Promise<number> {
  const paper = options.paper ?? 'a4'
  const orientation = options.orientation ?? 'portrait'

  const { toPng } = await import('html-to-image')
  const dataUrl = await toPng(element, {
    pixelRatio: 2,
    backgroundColor: '#ffffff',
    filter(node: Node) {
      if (node instanceof HTMLElement && node.hasAttribute('data-export-ignore')) {
        return false
      }
      return true
    },
  })

  let base = PAGE_SIZES[paper]
  if (orientation === 'landscape') {
    base = { width: base.height, height: base.width }
  }

  const pdf = await PDFDocument.create()
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const fontRegular = await pdf.embedFont(StandardFonts.Helvetica)

  const probe = new Image()
  await new Promise<void>((resolve, reject) => {
    probe.onload = () => resolve()
    probe.onerror = () => reject(new Error('Failed to load rendered canvas image'))
    probe.src = dataUrl
  })
  const imgWpx = probe.naturalWidth
  const imgHpx = probe.naturalHeight

  const usableW = base.width - MARGIN_X * 2
  const scale = usableW / imgWpx

  const usableHFirst = base.height - MARGIN_TOP_FIRST - MARGIN_BOTTOM
  const usableHRest = base.height - MARGIN_TOP - MARGIN_BOTTOM
  const fullDrawH = imgHpx * scale
  const sliceCapacityPx = Math.floor(usableHRest / scale)

  let slices: string[]
  if (fullDrawH <= usableHFirst) {
    slices = [dataUrl]
  } else {
    slices = await sliceDataUrl(dataUrl, sliceCapacityPx, imgHpx, imgWpx)
  }

  for (const [index, slice] of slices.entries()) {
    const isFirst = index === 0
    const marginTop = isFirst ? MARGIN_TOP_FIRST : MARGIN_TOP
    const usableH = base.height - marginTop - MARGIN_BOTTOM

    const page = pdf.addPage([base.width, base.height])

    if (isFirst) {
      page.drawText(sanitizeWinAnsi(canvasName), {
        x: MARGIN_X,
        y: base.height - 34,
        size: 14,
        font: fontBold,
        color: rgb(0.08, 0.12, 0.2),
      })
      const meta = sanitizeWinAnsi(`${templateName} | ${formatDate(updatedAt)} | CanvasPro`)
      page.drawText(meta, {
        x: MARGIN_X,
        y: base.height - 50,
        size: 9,
        font: fontRegular,
        color: rgb(0.45, 0.5, 0.58),
      })
    }

    const embedded = await pdf.embedPng(slice)
    const drawW = embedded.width * scale
    const drawH = embedded.height * scale

    page.drawImage(embedded, {
      x: MARGIN_X,
      y: base.height - marginTop - Math.min(drawH, usableH),
      width: drawW,
      height: Math.min(drawH, usableH),
    })

    const footer = `${index + 1} / ${slices.length}`
    const footerWidth = fontRegular.widthOfTextAtSize(footer, 9)
    page.drawText(footer, {
      x: (base.width - footerWidth) / 2,
      y: MARGIN_BOTTOM / 2 + 4,
      size: 9,
      font: fontRegular,
      color: rgb(0.55, 0.6, 0.66),
    })
  }

  const bytes = await pdf.save()
  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${canvasName}_${formatDate(Date.now()).replace(/[-: ]/g, '')}.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  return slices.length
}
