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
        <button class="btn-ghost text-sm gap-1.5 mb-6 !px-2" @click="router.push('/examples')">
          <ArrowLeft class="w-4 h-4" /> 全部案例
        </button>
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
          <p class="text-sm text-text-muted max-w-xl">{{ example.tagline }}</p>
          <div class="flex gap-2">
            <button class="btn-secondary gap-2" @click="copyToEditor(true)">
              <Share2 class="w-4 h-4" /> 导出 JSON
            </button>
            <button class="btn-primary gap-2" @click="copyToEditor(false)">
              <Copy class="w-4 h-4" /> 复制到编辑器
            </button>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 class="text-3xl font-bold text-text mb-2">经典商业案例</h1>
            <p class="text-text-muted">学习知名公司的商业模式画布，一键复制后修改为你自己的方案</p>
          </div>
          <div class="relative w-full md:w-72 shrink-0">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              v-model="searchQuery"
              class="input !pl-9"
              placeholder="搜索案例..."
              aria-label="搜索案例"
            />
          </div>
        </div>

        <div class="flex flex-wrap gap-2 mb-6">
          <button
            v-for="cat in CATEGORIES"
            :key="cat.id"
            class="px-3 py-1.5 text-sm rounded-full border transition-colors"
            :class="
              activeCategory === cat.id
                ? 'bg-primary-600 text-white border-primary-600'
                : 'border-canvas-border text-text-muted hover:border-primary-400 hover:text-primary-600'
            "
            @click="activeCategory = cat.id"
          >
            {{ cat.label }} ({{ countByCategory(cat.id) }})
          </button>
        </div>

        <div v-if="filteredIds.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <button
            v-for="id in filteredIds"
            :key="id"
            class="card p-0 overflow-hidden text-left group hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
            @click="router.push(`/examples/${String(id)}`)"
          >
            <div class="h-28 flex items-end justify-between p-4" :style="{ background: `linear-gradient(135deg, ${EXAMPLES[id].gradient})` }">
              <span class="text-white font-bold text-lg drop-shadow">{{ EXAMPLES[id].short }}</span>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-white/25 text-white backdrop-blur-sm">
                {{ categoryLabel(EXAMPLES[id].category) }}
              </span>
            </div>
            <div class="p-4">
              <h3 class="font-semibold text-text group-hover:text-primary-600 transition-colors">{{ EXAMPLES[id].name }}</h3>
              <p class="text-sm text-text-muted mt-1">{{ EXAMPLES[id].desc }}</p>
            </div>
          </button>
        </div>
        <div v-else class="card p-10 text-center border-dashed">
          <SearchX class="w-10 h-10 mx-auto text-text-muted mb-3" />
          <p class="text-text-muted">没有匹配「{{ searchQuery }}」的案例</p>
        </div>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Copy, Search, SearchX, Share2 } from 'lucide-vue-next'
import { useCanvasStore } from '@/stores'
import { getTemplateById } from '@/templates'
import { exportJSON } from '@/utils/export'

type CategoryId = 'all' | 'platform' | 'sharing' | 'saas' | 'hardware'

interface ExampleInfo {
  name: string
  short: string
  desc: string
  tagline: string
  gradient: string
  category: Exclude<CategoryId, 'all'>
}

const EXAMPLES: Record<string, ExampleInfo> = {
  uber: {
    name: 'Uber 商业模式',
    short: 'Uber',
    desc: '经典双边市场平台模式',
    tagline: '连接司机与乘客的按需出行平台，核心在于网络效应与动态定价。',
    gradient: '#000000, #333333',
    category: 'platform',
  },
  airbnb: {
    name: 'Airbnb 商业模式',
    short: 'Airbnb',
    desc: '共享经济住宿平台',
    tagline: '让房主闲置房源变现的共享经济典范，关键资源是社区信任体系。',
    gradient: '#ff5a5f, #00a699',
    category: 'sharing',
  },
  dropbox: {
    name: 'Dropbox 商业模式',
    short: 'Dropbox',
    desc: 'Freemium SaaS 模式',
    tagline: '免费增值获客、推荐机制裂变、订阅制变现的经典 SaaS 路径。',
    gradient: '#0061ff, #00c2ff',
    category: 'saas',
  },
  spotify: {
    name: 'Spotify 商业模式',
    short: 'Spotify',
    desc: '内容订阅双轨制',
    tagline: '免费广告与付费订阅并行，以版权内容与推荐算法构建护城河。',
    gradient: '#1db954, #191414',
    category: 'saas',
  },
  tesla: {
    name: 'Tesla 商业模式',
    short: 'Tesla',
    desc: '直销 + 软件生态',
    tagline: '跳过经销商直营交付，用 OTA 升级与超充网络锁定长期价值。',
    gradient: '#cc0000, #17181c',
    category: 'hardware',
  },
}

const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'platform', label: '双边平台' },
  { id: 'sharing', label: '共享经济' },
  { id: 'saas', label: 'Freemium SaaS' },
  { id: 'hardware', label: '硬件生态' },
]

const NOTE_BG = ['#fef08a', '#bfdbfe', '#bbf7d0', '#fbcfe8', '#ffedd5', '#e9d5ff', '#f3f4f6', '#fed7aa', '#d9f99d']

const route = useRoute()
const router = useRouter()
const canvasStore = useCanvasStore()

const searchQuery = ref('')
const activeCategory = ref<CategoryId>('all')

const example = computed<ExampleInfo | null>(() => EXAMPLES[String(route.params.id)] ?? null)

const previewBlocks = computed(() => {
  const template = getTemplateById('business-model-canvas')
  return template.blocks.slice().sort((a, b) => a.order - b.order)
})

const filteredIds = computed(() =>
  Object.keys(EXAMPLES).filter(id => {
    const item = EXAMPLES[id]
    const matchCategory = activeCategory.value === 'all' || item.category === activeCategory.value
    const q = searchQuery.value.trim().toLowerCase()
    const matchSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.desc.toLowerCase().includes(q) ||
      item.tagline.toLowerCase().includes(q)
    return matchCategory && matchSearch
  })
)

function countByCategory(cat: CategoryId): number {
  if (cat === 'all') return Object.keys(EXAMPLES).length
  return Object.values(EXAMPLES).filter(e => e.category === cat).length
}

function categoryLabel(cat: ExampleInfo['category']): string {
  return CATEGORIES.find(c => c.id === cat)?.label ?? cat
}

function copyToEditor(exportJson: boolean): void {
  if (!example.value) return
  const canvas = canvasStore.createCanvas(example.value.name, 'business-model-canvas')
  if (exportJson) {
    exportJSON(canvas)
  } else {
    router.push(`/canvas/${canvas.id}`)
  }
}
</script>
