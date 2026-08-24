<template>
  <button
    class="btn-icon text-text-muted hover:text-text"
    :aria-label="`主题：${label}`"
    :title="`主题：${label}（点击切换）`"
    @click="uiStore.cycleTheme()"
  >
    <Sun v-if="uiStore.theme === 'light'" class="h-5 w-5" />
    <Moon v-else-if="uiStore.theme === 'dark'" class="h-5 w-5" />
    <Monitor v-else class="h-5 w-5" />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Monitor, Moon, Sun } from 'lucide-vue-next'
import { useUIStore } from '@/stores/ui'

const uiStore = useUIStore()

const label = computed(() => {
  switch (uiStore.theme) {
    case 'light':
      return '浅色'
    case 'dark':
      return '深色'
    default:
      return '跟随系统'
  }
})
</script>
