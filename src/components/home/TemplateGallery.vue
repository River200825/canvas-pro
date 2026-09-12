<template>
  <section class="px-4 pb-16">
    <div class="max-w-6xl mx-auto">
      <h2 class="text-2xl font-bold text-text mb-2 text-center">选择模板开始</h2>
      <p class="text-text-muted text-center mb-8">内置经典商业画布模板，点击即可创建新画布</p>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <button
          v-for="template in templates"
          :key="template.id"
          class="card p-0 overflow-hidden text-left group hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
          @click="$emit('select', template.id)"
        >
          <div class="aspect-[4/3] bg-canvas-bg p-3 grid grid-cols-3 grid-rows-2 gap-1.5 border-b border-canvas-border">
            <div
              v-for="block in template.blocks.slice(0, 9)"
              :key="block.id"
              class="rounded border border-canvas-border bg-white dark:bg-gray-800 p-1 overflow-hidden"
              :style="{ borderTopColor: block.color || '#e2e8f0', borderTopWidth: '2px' }"
            >
              <span class="text-[9px] leading-tight text-gray-600 dark:text-gray-300 line-clamp-2">{{ block.title }}</span>
            </div>
          </div>
          <div class="p-4 flex items-start justify-between gap-2">
            <div>
              <h3 class="font-semibold text-text group-hover:text-primary-600 transition-colors">
                {{ template.name }}
              </h3>
              <p class="text-sm text-text-muted mt-1 line-clamp-2">{{ template.description }}</p>
            </div>
            <ArrowRight class="w-5 h-5 text-text-muted group-hover:text-primary-600 shrink-0 mt-1 transition-colors" />
          </div>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'
import { templates } from '@/templates'

defineEmits<{
  (e: 'select', templateId: string): void
}>()
</script>
