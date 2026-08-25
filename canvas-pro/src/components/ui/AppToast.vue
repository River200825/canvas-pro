<template>
  <div
    class="fixed bottom-4 left-1/2 -translate-x-1/2 z-[300] flex flex-col items-center gap-2"
    :style="{ paddingBottom: 'env(safe-area-inset-bottom)' }"
    aria-live="polite"
  >
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-xl text-sm text-white max-w-[90vw]"
        :class="toast.type === 'success' ? 'bg-green-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-gray-800'"
        role="status"
      >
        <CheckCircle v-if="toast.type === 'success'" class="w-4 h-4 shrink-0" />
        <AlertCircle v-else-if="toast.type === 'error'" class="w-4 h-4 shrink-0" />
        <Info v-else class="w-4 h-4 shrink-0" />
        <span>{{ toast.message }}</span>
        <button
          class="ml-1 opacity-70 hover:opacity-100"
          aria-label="关闭提示"
          @click="dismiss(toast.id)"
        >
          <X class="w-3.5 h-3.5" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle, CheckCircle, Info, X } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'

const { toasts, dismiss } = useToast()
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 200ms ease-out;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
