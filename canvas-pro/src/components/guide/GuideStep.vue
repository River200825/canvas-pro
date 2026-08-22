<template>
  <div v-if="isActive || isCompleted" class="animate-fade-in">
    <div class="text-center mb-8">
      <div
        class="inline-flex items-center justify-center w-16 h-16 rounded-2xl mx-auto mb-6 transition-all duration-300"
        :class="
          isCompleted
            ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
            : 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
        "
      >
        <component :is="icon" class="w-8 h-8" />
      </div>
      <h2 class="text-2xl md:text-3xl font-bold text-text mb-3">{{ step.title }}</h2>
      <p class="text-text-muted max-w-2xl mx-auto whitespace-pre-line leading-relaxed">{{ step.description }}</p>
    </div>

    <PracticeArea v-if="isActive && practiceIds.includes(step.id)" :step-id="step.id" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Download,
  Edit,
  Gamepad2,
  MousePointerClick,
  Move,
  Sparkles,
  type LucideIcon,
} from 'lucide-vue-next'
import PracticeArea from './PracticeArea.vue'

interface GuideStepData {
  id: string
  title: string
  description: string
}

const props = defineProps<{
  step: GuideStepData
  isActive: boolean
  isCompleted: boolean
}>()

const ICONS: Record<string, LucideIcon> = {
  welcome: Sparkles,
  'create-note': MousePointerClick,
  'edit-note': Edit,
  'drag-note': Move,
  viewport: Move,
  'export-share': Download,
  presentation: Gamepad2,
  complete: Sparkles,
}

const practiceIds = ['create-note', 'edit-note', 'drag-note', 'viewport']

const icon = computed<LucideIcon>(() => ICONS[props.step.id] ?? Sparkles)
</script>
