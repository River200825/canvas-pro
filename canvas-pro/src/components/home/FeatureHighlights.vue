<template>
  <section class="px-4 pb-20">
    <div class="max-w-6xl mx-auto">
      <h2 class="text-2xl font-bold text-text mb-8 text-center">核心功能</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div v-for="feature in FEATURES" :key="feature.title" class="card p-5 text-center">
          <div class="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900 flex items-center justify-center mx-auto mb-4">
            <component :is="feature.icon" class="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 class="font-semibold text-text mb-1.5">{{ feature.title }}</h3>
          <p class="text-sm text-text-muted leading-relaxed">{{ feature.desc }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { History, MousePointerClick, LayoutTemplate, FileDown, type LucideIcon } from 'lucide-vue-next'

interface Feature {
  icon: LucideIcon
  title: string
  desc: string
}

const FEATURES: Feature[] = [
  {
    icon: MousePointerClick,
    title: '便利贴头脑风暴',
    desc: '双击创建、自由拖拽、跨区块移动、7 色标记与锁定保护',
  },
  {
    icon: History,
    title: '快照版本控制',
    desc: '自动与手动快照，最多保留 20 个，一键恢复任意历史状态',
  },
  {
    icon: FileDown,
    title: '多格式导出',
    desc: 'PNG 高清位图、PDF 自动分页文档、Markdown 结构化文本与 JSON 备份',
  },
  {
    icon: LayoutTemplate,
    title: '多模板与案例库',
    desc: '商业模型画布、精益画布、SWOT 三大模板，内置经典公司案例一键套用',
  },
]
</script>
