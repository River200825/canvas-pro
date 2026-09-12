<template>
  <div
    class="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
    @click.self="$emit('cancel')"
  >
    <div class="w-full max-w-sm card animate-scale-in overflow-hidden" role="alertdialog" :aria-label="title">
      <div class="p-5">
        <div class="flex items-start gap-3">
          <div
            class="shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
            :class="danger ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400' : 'bg-primary-100 dark:bg-primary-900/40 text-primary-600'"
          >
            <AlertTriangle class="w-5 h-5" />
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-text">{{ title }}</h3>
            <p class="text-sm text-text-muted mt-1 leading-relaxed whitespace-pre-line">{{ message }}</p>
          </div>
        </div>
      </div>
      <div class="flex justify-end gap-2 px-5 py-3.5 border-t border-canvas-border bg-gray-50 dark:bg-gray-800/50">
        <button class="btn-secondary" @click="$emit('cancel')">{{ cancelText }}</button>
        <button
          class="btn gap-2"
          :class="danger ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500' : 'btn-primary'"
          @click="$emit('confirm')"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { AlertTriangle } from 'lucide-vue-next'

withDefaults(
  defineProps<{
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    danger?: boolean
  }>(),
  {
    confirmText: '确认',
    cancelText: '取消',
    danger: false,
  }
)

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') emit('cancel')
  else if (event.key === 'Enter') emit('confirm')
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>
