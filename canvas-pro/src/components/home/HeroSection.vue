<template>
  <section class="text-center py-16 md:py-20 px-4">
    <h1 class="text-4xl md:text-6xl font-bold text-text leading-tight mb-6">
      把创业想法<br class="md:hidden" />
      理成一张<span class="text-primary-600">清晰的商业模式图</span>
    </h1>
    <p class="text-lg text-text-muted max-w-2xl mx-auto mb-6">
      9 个区块、便利贴式头脑风暴。像贴纸一样把想法写下来、拖到合适的位置，
      10 分钟理清你的商业模式。
    </p>

    <!-- 核心卖点徽章（B5） -->
    <div class="flex flex-wrap items-center justify-center gap-2 mb-10">
      <span
        v-for="badge in BADGES"
        :key="badge"
        class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900"
      >
        <Check class="w-3 h-3" /> {{ badge }}
      </span>
    </div>

    <div class="flex flex-wrap items-center justify-center gap-3 mb-14">
      <button class="btn-primary !px-8 !py-3 text-base gap-2" @click="$emit('create')">
        <Plus class="w-5 h-5" /> 免费开始创作
      </button>
      <button class="btn-secondary !px-8 !py-3 text-base" @click="$emit('guide')">5 分钟上手教程</button>
    </div>

    <!-- 真实案例成品展示（B5）：Uber 商业模式画布 -->
    <div class="max-w-4xl mx-auto">
      <p class="text-xs text-text-muted mb-3 tracking-wider uppercase">真实案例 · Uber 商业模式画布</p>
      <div class="card p-4 md:p-5 shadow-xl text-left">
        <div class="grid grid-cols-3 md:grid-cols-5 gap-2">
          <div
            v-for="block in previewBlocks"
            :key="block.id"
            class="rounded-lg border border-canvas-border overflow-hidden bg-white dark:bg-gray-800"
            :style="{ borderTopColor: block.color || '#e2e8f0', borderTopWidth: '3px' }"
          >
            <div
              class="text-[10px] font-semibold px-1.5 py-1 truncate"
              :style="{ backgroundColor: block.color || '#e2e8f0', color: '#1e293b' }"
            >
              {{ block.title }}
            </div>
            <div class="p-1.5 space-y-1 min-h-[52px]">
              <div
                v-for="(note, i) in uberContent[block.id] ?? []"
                :key="i"
                class="rounded p-1"
                :style="{ backgroundColor: NOTE_BG[(block.order + i) % NOTE_BG.length] }"
              >
                <p class="text-[10px] font-semibold text-gray-800 leading-tight truncate">{{ note.t }}</p>
              </div>
              <p v-if="(uberContent[block.id] ?? []).length === 0" class="text-[10px] text-gray-300 italic px-1">…</p>
            </div>
          </div>
        </div>
        <button
          class="mt-3 text-xs text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1"
          @click="$emit('examples')"
        >
          在案例库中查看全部 5 个案例 <ArrowRight class="w-3 h-3" />
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ArrowRight, Check, Plus } from 'lucide-vue-next'
import { EXAMPLE_CONTENT, EXAMPLE_NOTE_BG as NOTE_BG } from '@/data/examples'
import { getTemplateById } from '@/templates'
import { computed } from 'vue'

defineEmits<{
  (e: 'create'): void
  (e: 'guide'): void
  (e: 'examples'): void
}>()

const BADGES = ['免注册即用', '数据仅存本地', '支持离线', '完全免费']

const uberContent = computed(() => EXAMPLE_CONTENT.uber)
const previewBlocks = computed(() =>
  getTemplateById('business-model-canvas').blocks.slice().sort((a, b) => a.order - b.order)
)
</script>
