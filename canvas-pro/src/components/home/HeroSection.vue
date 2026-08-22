<template>
  <section class="text-center py-16 md:py-24 px-4">
    <h1 class="text-4xl md:text-6xl font-bold text-text leading-tight mb-6">
      专业级个人商业画布工具
      <span class="block text-primary-600 mt-2">CanvasPro</span>
    </h1>
    <p class="text-lg text-text-muted max-w-2xl mx-auto mb-10">
      1:1 复刻 Canvanizer 核心体验。便利贴式头脑风暴、多模板支持、快照版本控制，
      PNG / PDF / Markdown 多格式导出。
    </p>
    <div class="flex flex-wrap items-center justify-center gap-3">
      <button class="btn-primary !px-8 !py-3 text-base gap-2" @click="$emit('create')">
        <Plus class="w-5 h-5" /> 开始创作
      </button>
      <button class="btn-secondary !px-8 !py-3 text-base" @click="$emit('guide')">查看教程</button>
    </div>

    <div class="mt-14 max-w-3xl mx-auto card p-6 md:p-8 shadow-xl text-left">
      <div class="grid grid-cols-3 md:grid-cols-5 gap-3">
        <div
          v-for="(blockName, i) in PREVIEW_BLOCKS"
          :key="blockName"
          class="rounded-lg border border-canvas-border overflow-hidden animate-slide-up"
          :style="{ animationDelay: `${i * 60}ms`, borderTopColor: BLOCK_COLORS[i], borderTopWidth: '3px' }"
        >
          <div
            class="text-[10px] font-semibold px-1.5 py-1 truncate"
            :style="{ backgroundColor: BLOCK_COLORS[i] + '33', color: '#334155' }"
          >
            {{ blockName }}
          </div>
          <div class="p-1.5 space-y-1 bg-canvas-bg/50 min-h-[44px]">
            <div
              v-for="j in (i % 3) + 1"
              :key="j"
              class="h-4 rounded-sm"
              :class="j === (i % 3) + 1 ? 'w-2/3' : 'w-full'"
              :style="{ backgroundColor: NOTE_BG[(i * 2 + j) % NOTE_BG.length] }"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Plus } from 'lucide-vue-next'

defineEmits<{
  (e: 'create'): void
  (e: 'guide'): void
}>()

const PREVIEW_BLOCKS = ['重要伙伴', '关键业务', '核心资源', '价值主张', '客户关系', '成本结构']
const BLOCK_COLORS = ['#38bdf8', '#4ade80', '#c084fc', '#fb923c', '#f472b6', '#9ca3af']
const NOTE_BG = ['#fef08a', '#bfdbfe', '#bbf7d0', '#fbcfe8', '#ffedd5']
</script>
