import type { CanvasInstance, CanvasTemplate } from '@/types'

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function timestamp(): string {
  const d = new Date()
  return d.getFullYear() +
    String(d.getMonth() + 1).padStart(2, '0') +
    String(d.getDate()).padStart(2, '0') + '_' +
    String(d.getHours()).padStart(2, '0') +
    String(d.getMinutes()).padStart(2, '0')
}

export function exportJSON(canvas: CanvasInstance): void {
  const json = JSON.stringify(canvas, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  downloadBlob(blob, canvas.name + '_' + timestamp() + '.json')
}

export function exportMarkdown(canvas: CanvasInstance, template: CanvasTemplate): void {
  const lines: string[] = []
  lines.push('# ' + canvas.name)
  lines.push('')
  lines.push('> 模板：' + template.name + ' | 导出时间：' + new Date().toLocaleString())
  lines.push('')

  const blocks = template.blocks.slice().sort(function (a, b) { return a.order - b.order })
  const notesByBlock = new Map<string, typeof canvas.notes>()
  canvas.notes.forEach(function (note) {
    const key = note.blockId || '_free'
    if (!notesByBlock.has(key)) notesByBlock.set(key, [])
    notesByBlock.get(key)!.push(note)
  })

  blocks.forEach(function (block) {
    const notes = (notesByBlock.get(block.id) || []).sort(function (a, b) { return a.order - b.order })
    if (notes.length === 0) return
    lines.push('## ' + block.title)
    lines.push('')
    notes.forEach(function (note) {
      if (note.title) {
        lines.push('- **' + note.title + '**')
      }
      if (note.content) {
        note.content.split('\n').forEach(function (line) {
          lines.push('  ' + line)
        })
      }
      lines.push('')
    })
  })

  const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' })
  downloadBlob(blob, canvas.name + '_' + timestamp() + '.md')
}

export async function exportPNG(
  element: HTMLElement,
  canvasName: string,
  pixelRatio?: number,
  backgroundColor?: string | null
): Promise<void> {
  const { toPng } = await import('html-to-image')
  const dataUrl = await toPng(element, {
    pixelRatio: pixelRatio || 2,
    ...(backgroundColor === null ? {} : { backgroundColor: backgroundColor || '#f8fafc' }),
    filter: function (node) {
      if (node instanceof HTMLElement && node.hasAttribute('data-export-ignore')) {
        return false
      }
      return true
    },
  })
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = canvasName + '_' + timestamp() + '.png'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

export function createShareLink(canvas: CanvasInstance): string {
  const json = JSON.stringify(canvas)
  const encoded = btoa(encodeURIComponent(json))
  return window.location.origin + window.location.pathname + '#/preview/' + canvas.id + '?data=' + encoded
}
