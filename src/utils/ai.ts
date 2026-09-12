import type { CanvasTemplate } from '@/types'
import type { ExampleContent, NoteSeed } from '@/data/examples'
import type { AiSettings } from '@/stores/settings'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/** 从模型回复中提取首个 JSON 对象（容忍 markdown 代码块与前后缀文本） */
export function extractJson(text: string): unknown {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end <= start) throw new Error('NO_JSON')
  return JSON.parse(text.slice(start, end + 1))
}

/** 解析生成的画布草稿：过滤非法 blockId 与空便签，限制数量 */
export function parseGeneratedCanvas(text: string, template: CanvasTemplate): ExampleContent {
  const data = extractJson(text) as {
    blocks?: { blockId?: string; notes?: NoteSeed[] }[]
  }
  const valid = new Set(template.blocks.map(b => b.id))
  const out: ExampleContent = {}

  for (const block of data.blocks ?? []) {
    if (!block?.blockId || !valid.has(block.blockId) || !Array.isArray(block.notes)) continue
    const seeds: NoteSeed[] = (block.notes as Record<string, unknown>[])
      .filter(n => n && (n.t || n.title || n.c || n.content))
      .map(n => ({
        t: String(n.t ?? n.title ?? '').slice(0, 30),
        c: String(n.c ?? n.content ?? '').slice(0, 120),
      }))
    if (seeds.length > 0) out[block.blockId] = seeds.slice(0, 4)
  }

  if (Object.keys(out).length === 0) throw new Error('EMPTY_RESULT')
  return out
}

async function describeHttpError(res: Response): Promise<string> {
  if (res.status === 401 || res.status === 403) return 'API Key 无效或无权限，请检查 AI 设置'
  if (res.status === 404) return '接口地址或模型不存在，请检查 AI 设置'
  if (res.status === 429) return '请求过于频繁或额度不足'
  try {
    const body = (await res.json()) as { error?: { message?: string } }
    if (body.error?.message) return `请求失败：${body.error.message}`
  } catch {
    /* ignore */
  }
  return `请求失败（HTTP ${res.status}）`
}

/** 流式对话：逐段回调增量文本，返回完整回复 */
export async function streamChat(opts: {
  settings: AiSettings
  messages: ChatMessage[]
  signal?: AbortSignal
  temperature?: number
  onDelta?: (delta: string) => void
}): Promise<string> {
  const { baseUrl, apiKey, model } = opts.settings
  if (!apiKey.trim()) throw new Error('尚未配置 API Key，请先打开 AI 设置')
  if (!/^https?:\/\//.test(baseUrl)) throw new Error('接口地址格式不正确，请检查 AI 设置')

  const res = await fetch(`${baseUrl.replace(/\/+$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey.trim()}`,
    },
    body: JSON.stringify({
      model,
      messages: opts.messages,
      stream: true,
      temperature: opts.temperature ?? 0.7,
    }),
    signal: opts.signal,
  })

  if (!res.ok) throw new Error(await describeHttpError(res))
  if (!res.body) throw new Error('响应为空')

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let full = ''

  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data:')) continue
      const payload = trimmed.slice(5).trim()
      if (payload === '[DONE]') continue
      try {
        const json = JSON.parse(payload) as {
          choices?: { delta?: { content?: string } }[]
        }
        const delta = json.choices?.[0]?.delta?.content
        if (typeof delta === 'string' && delta) {
          full += delta
          opts.onDelta?.(delta)
        }
      } catch {
        /* 忽略心跳/注释等非 JSON 行 */
      }
    }
  }

  if (!full.trim()) throw new Error('模型返回为空，请稍后重试')
  return full
}

/** G1：生成画布草稿 */
export function buildGenerateMessages(idea: string, template: CanvasTemplate): ChatMessage[] {
  const blockList = template.blocks
    .slice()
    .sort((a, b) => a.order - b.order)
    .map(b => `- ${b.id}（${b.title}${b.hint ? `：${b.hint}` : ''}）`)
    .join('\n')

  return [
    {
      role: 'system',
      content:
        '你是商业模式画布与精益创业专家。根据用户的创业想法，为画布的每个区块生成具体、可信、相互呼应的内容。' +
        '要求：简体中文；便签 title 不超过 12 个字，content 不超过 40 个字；每个区块 1-3 条；' +
        '内容必须针对用户的想法定制，禁止空话套话。只输出 JSON，不要任何解释。',
    },
    {
      role: 'user',
      content:
        `我的创业想法：${idea}\n\n画布模板：${template.name}（${template.nameEn}）\n区块列表：\n${blockList}\n\n` +
        `请严格按以下 JSON 格式输出（blockId 必须使用上面给定的 id）：\n` +
        `{"blocks":[{"blockId":"区块id","notes":[{"title":"短标题","content":"一句话说明"}]}]}`,
    },
  ]
}

export async function generateCanvasDraft(opts: {
  settings: AiSettings
  idea: string
  template: CanvasTemplate
  signal?: AbortSignal
  onDelta?: (delta: string) => void
}): Promise<ExampleContent> {
  const text = await streamChat({
    settings: opts.settings,
    messages: buildGenerateMessages(opts.idea, opts.template),
    signal: opts.signal,
    temperature: 0.8,
    onDelta: opts.onDelta,
  })
  return parseGeneratedCanvas(text, opts.template)
}

export const COACH_PRESETS = [
  '润色表达，更清晰专业',
  '更具体、可量化',
  '挑战这个假设，指出风险',
  '精简成一句话',
] as const

/** G1：AI 教练——改写单张便签内容 */
export async function improveNoteContent(opts: {
  settings: AiSettings
  blockTitle: string
  content: string
  instruction: string
  signal?: AbortSignal
}): Promise<string> {
  const text = await streamChat({
    settings: opts.settings,
    temperature: 0.6,
    signal: opts.signal,
    messages: [
      {
        role: 'system',
        content:
          '你是商业模式画布教练。根据用户指令改写便签内容：保持简体中文、不超过 60 字、只输出改写后的内容本身，不要引号、不要解释。',
      },
      {
        role: 'user',
        content: `画布区块：${opts.blockTitle}\n便签内容：${opts.content}\n改写指令：${opts.instruction}`,
      },
    ],
  })
  return text.trim().replace(/^["「『]|["」』]$/g, '')
}

/** 测试连接：GET /models */
export async function testAiConnection(settings: AiSettings): Promise<string> {
  const res = await fetch(`${settings.baseUrl.replace(/\/+$/, '')}/models`, {
    headers: { Authorization: `Bearer ${settings.apiKey.trim()}` },
  })
  if (!res.ok) throw new Error(await describeHttpError(res))
  const data = (await res.json()) as { data?: { id?: string }[] }
  const count = data.data?.length
  return count ? `连接成功，可用模型 ${count} 个` : '连接成功'
}
