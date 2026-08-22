<template>
  <div class="min-h-screen bg-canvas-bg">
    <header class="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-canvas-border" data-export-ignore>
      <div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <button class="btn-ghost text-sm gap-1.5" @click="router.push('/')">
          <ArrowLeft class="w-4 h-4" /> 返回首页
        </button>
        <span class="text-base font-bold text-text">案例库</span>
        <span class="w-20" />
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-4 py-10">
      <template v-if="example">
        <h1 class="text-3xl font-bold text-text mb-2">{{ example.name }}</h1>
        <p class="text-text-muted mb-8">{{ example.desc }}</p>

        <div class="card overflow-hidden mb-8">
          <div class="aspect-[16/9] bg-canvas-bg p-4 grid grid-cols-5 grid-rows-2 gap-2">
            <div
              v-for="block in previewBlocks"
              :key="block.id"
              class="rounded-lg border border-canvas-border bg-white dark:bg-gray-800 p-1.5 overflow-hidden"
              :style="{ borderTopColor: block.color || '#e2e8f0', borderTopWidth: '3px' }"
            >
              <span class="text-[10px] font-semibold text-gray-600 dark:text-gray-300 line-clamp-2 leading-tight">
                {{ block.title }}
              </span>
              <div class="mt-1 space-y-1">
                <div
                  v-for="j in 2"
                  :key="j"
                  class="h-3 rounded-sm"
                  :class="j === 1 ? 'w-full' : 'w-3/4'"
                  :style="{ backgroundColor: NOTE_BG[block.order % NOTE_BG.length] }"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="card p-6 flex flex-wrap items-center justify-between gap-4">
          <p class="text-sm text-text-muted">{{ example.tagline }}</p>
          <button class="btn-primary gap-2" @click="copyToEditor">
            <Copy class="w-4 h-4" /> 复制到编辑器
          </button>
        </div>
      </template>

      <template v-else>
        <h1 class="text-3xl font-bold text-text mb-2">经典商业案例</h1>
        <p class="text-text-muted mb-8">学习知名公司的商业模式画布，一键复制后修改为你自己的方案</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <button
            v-for="(item, id) in EXAMPLES"
            :key="id"
            class="card p-0 overflow-hidden text-left group hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
            @click="router.push(`/examples/${String(id)}`)"
          >
            <div
              class="h-28 flex items-end p-4"
              :style="{ background: `linear-gradient(135deg, ${item.gradient})` }"
            >
              <span class="text-white font-bold text-lg drop-shadow">{{ item.short }}</span>
            </div>
            <div class="p-4">
              <h3 class="font-semibold text-text group-hover:text-primary-600 transition-colors">{{ item.name }}</h3>
              <p class="text-sm text-text-muted mt-1">{{ item.desc }}</p>
            </div>
          </button>
        </div>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Copy } from 'lucide-vue-next'
import { useCanvasStore } from '@/stores'
import { getTemplateById } from '@/templates'

interface ExampleInfo {
  name: string
  short: string
  desc: string
  tagline: string
  gradient: string
}

const EXAMPLES: Record<string, ExampleInfo> = {
  uber: {
    name: 'Uber 商业模式',
    short: 'Uber',
    desc: '经典双边市场平台模式',
    tagline: '连接司机与乘客的按需出行平台，核心在于网络效应与动态定价。',
    gradient: '#000000, #333333',
  },
  airbnb: {
    name: 'Airbnb 商业模式',
    short: 'Airbnb',
    desc: '共享经济住宿平台',
    tagline: '让房主闲置房源变现的共享经济典范，关键资源是社区信任体系。',
    gradient: '#ff5a5f, #00a699',
  },
  dropbox: {
    name: 'Dropbox 商业模式',
    short: 'Dropbox',
    desc: 'Freemium SaaS 模式',
    tagline: '免费增值获客、推荐机制裂变、订阅制变现的经典 SaaS 路径。',
    gradient: '#0061ff, #00c2ff',
  },
}

const NOTE_BG = ['#fef08a', '#bfdbfe', '#bbf7d0', '#fbcfe8', '#ffedd5', '#e9d5ff', '#f3f4f6', '#fed7aa', '#d9f99d']

const route = useRoute()
const router = useRouter()
const canvasStore = useCanvasStore()

const example = computed<ExampleInfo | null>(
  () => EXAMPLES[String(route.params.id)] ?? null
)

const previewBlocks = computed(() => {
  const template = getTemplateById('business-model-canvas')
  return template.blocks.slice().sort((a, b) => a.order - b.order)
})

function copyToEditor(): void {
  if (!example.value) return
  const canvas = canvasStore.createCanvas(example.value.name, 'business-model-canvas')
  router.push(`/canvas/${canvas.id}`)
}
</script>
