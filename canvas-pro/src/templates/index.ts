import type { CanvasTemplate } from '@/types'
import { businessModelTemplate } from './business-model'
import { leanCanvasTemplate } from './lean-canvas'
import { swotTemplate } from './swot'

export const templates: CanvasTemplate[] = [
  businessModelTemplate,
  leanCanvasTemplate,
  swotTemplate,
]

export const defaultTemplate = businessModelTemplate

export function getTemplate(id: string): CanvasTemplate | undefined {
  return templates.find(t => t.id === id)
}

export function getTemplateById(id: string): CanvasTemplate {
  return getTemplate(id) ?? defaultTemplate
}