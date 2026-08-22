<template>
  <RouterView />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useUIStore } from '@/stores/ui'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'

const uiStore = useUIStore()

useKeyboardShortcuts()

onMounted(() => {
  const guideShown = localStorage.getItem('guideShown')
  if (!guideShown) {
    uiStore.showGuide = true
  }
})
</script>

<style scoped>
/* Global styles handled by main.css */
</style>