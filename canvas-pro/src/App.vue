<template>
  <ErrorBoundary>
    <RouterView />
    <UpdateBanner />
    <AppToast />
    <KeyboardShortcutsTable v-if="uiStore.activeModal === 'shortcuts'" @close="uiStore.closeModal()" />
  </ErrorBoundary>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUIStore } from '@/stores/ui'
import { useCanvasStore } from '@/stores'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'
import ErrorBoundary from '@/components/ui/ErrorBoundary.vue'
import UpdateBanner from '@/components/ui/UpdateBanner.vue'
import AppToast from '@/components/ui/AppToast.vue'
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
