<template>
  <RouterView />
  <KeyboardShortcutsTable v-if="uiStore.activeModal === 'shortcuts'" @close="uiStore.closeModal()" />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUIStore } from '@/stores/ui'
import { useCanvasStore } from '@/stores'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'
import KeyboardShortcutsTable from '@/components/guide/KeyboardShortcutsTable.vue'

const router = useRouter()
const uiStore = useUIStore()
const canvasStore = useCanvasStore()

useKeyboardShortcuts()

onMounted(() => {
  canvasStore.init()

  if (!localStorage.getItem('guideShown')) {
    router.push('/guide')
  }
})
</script>
