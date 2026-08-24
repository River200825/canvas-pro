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
      <template v-if="exampleId && example">
        <button class="btn-ghost text-sm gap-1.5 mb-6 !px-2" @click="router.push('/examples')">
          <ArrowLeft class="w-4 h-4" /> 全部案例
        </button>
        <h1 class="text-3xl font-bold text-text mb-2">{{ example.name }}</h1>
        <p class="text-text-muted mb-8">{{ example.tagline }}</p>

        <div class="tpl-grid mb-8" :style="gridStyle ?? undefined">
          <div
            v-for="block in bmcBlocks"
            :key="block.id"
            class="rounded-xl border border-canvas-border shadow-block overflow-hidden bg-white dark:bg-gray-800"
            :style="{ borderTopColor: block.color || '#e2e8f0', borderTopWidth: '3px', ...(block.area ? { gridArea: block.area } : {}) }"
          >
            <div
              class="px-3 py-2 border-b border-canvas-border font-semibold text-sm"
              :style="{ backgroundColor: (block.color || '#e2e8f0') + '33', color: '#334155' }"
            >
              {{ block.title }}
            </div>
            <div class="p-2 space-y-2 min-h-[90px]">
              <div
                v-for="(note, i) in exampleContent[block.id] ?? []"
                :key="i"
                class="rounded-lg shadow-sm p-2 pl-3 relative overflow-hidden"
                :style="{ backgroundColor: NOTE_BG[(block.order + i) % NOTE_BG.length] }"
              >
                <p v-if="note.t" class="font-semibold text-xs text-gray-800">{{ note.t }}</p>
                <p class="text-xs text-gray-700 whitespace-pre-line leading-relaxed mt-0.5">{{ note.c }}</p>
              </div>
              <p v-if="(exampleContent[block.id] ?? []).length === 0" class="text-xs text-gray-400 italic p-2 text-center">暂无内容</p>
            </div>
          </div>
        </div>

        <div class="card p-6 flex flex-wrap items-center justify-between gap-4">
          <p class="text-sm text-text-muted max-w-xl">{{ example.desc }}。复制到编辑器后可自由修改为你的方案。</p>
          <div class="flex gap-2">
            <button class="btn-secondary gap-2" @click="copyToEditor(true)">
              <Download class="w-4 h-4" /> 导出 JSON
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
              <p class="text-xs text-primary-600 mt-2">{{ noteCount(id) }} 条要点</p>
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
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Copy, Download, Search, SearchX } from 'lucide-vue-next'
import { useCanvasStore } from '@/stores'
import { getTemplateById } from '@/templates'
import { getGridStyle } from '@/templates/layout'
import { useToast } from '@/composables/useToast'
import { exportJSON } from '@/utils/export'
import {
  EXAMPLES,
  EXAMPLE_CONTENT,
  EXAMPLE_CATEGORIES as CATEGORIES,
  EXAMPLE_NOTE_BG as NOTE_BG,
  type CategoryId,
  type ExampleInfo,
  type ExampleContent,
} from '@/data/examples'

const route = useRoute()
const router = useRouter()
const canvasStore = useCanvasStore()

onMounted(() => {
  document.title = '案例库 · CanvasPro'
})

const searchQuery = ref('')
const activeCategory = ref<CategoryId>('all')

const exampleId = computed(() => (route.params.id as string) in EXAMPLES ? String(route.params.id) : null)
const example = computed<ExampleInfo | null>(() => (exampleId.value ? EXAMPLES[exampleId.value] : null))
const exampleContent = computed<ExampleContent>(() => (exampleId.value ? EXAMPLE_CONTENT[exampleId.value] : {}))

const template = computed(() => getTemplateById('business-model-canvas'))
const gridStyle = computed(() => getGridStyle(template.value))
const bmcBlocks = computed(() => template.value.blocks.slice().sort((a, b) => a.order - b.order))

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

function noteCount(id: string): number {
  return Object.values(EXAMPLE_CONTENT[id]).reduce((sum, notes) => sum + notes.length, 0)
}

function copyToEditor(exportJson: boolean): void {
  if (!exampleId.value) return
  const canvas = canvasStore.createCanvas(EXAMPLES[exampleId.value].name.replace(' 商业模式', ''), 'business-model-canvas')

  // 整批填充（只算一步撤销）
  canvasStore.fillExample(EXAMPLE_CONTENT[exampleId.value])

  if (exportJson) {
    exportJSON(canvas)
  } else {
    router.push(`/canvas/${canvas.id}`)
  }
}
</script>

<style scoped>
@media (max-width: 899px) {
  .tpl-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    grid-template-areas: none !important;
    grid-template-rows: auto !important;
  }
  .tpl-grid > * {
    grid-area: auto !important;
  }
}
</style>
