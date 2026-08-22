<template>
  <div class="h-screen w-screen overflow-hidden bg-canvas-bg">
    <Toolbar />

    <div
      class="absolute inset-0"
      :class="uiStore.presentationMode ? 'top-0' : 'top-[52px]'"
      data-canvas-area
    >
      <CanvasGrid :presentation-mode="false" />
    </div>

    <button
      v-if="uiStore.presentationMode"
      class="fixed top-3 right-3 z-[60] btn-secondary !py-1.5 text-sm"
      aria-label="退出演示模式"
      @click="uiStore.setPresentationMode(false)"
    >
      退出演示 (Esc)
    </button>

    <SnapshotsPanel v-if="uiStore.activeModal === 'snapshots'" @close="uiStore.closeModal()" />
    <ExportDialog v-if="uiStore.activeModal === 'export'" @close="uiStore.closeModal()" />
    <ShareDialog v-if="uiStore.activeModal === 'share'" @close="uiStore.closeModal()" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useCanvasStore } from '@/stores'
import { useUIStore } from '@/stores/ui'
import Toolbar from '@/components/toolbar/Toolbar.vue'
import CanvasGrid from '@/components/canvas/CanvasGrid.vue'
import SnapshotsPanel from '@/components/canvas/SnapshotsPanel.vue'
import ExportDialog from '@/components/export/ExportDialog.vue'
import ShareDialog from '@/components/export/ShareDialog.vue'

const route = useRoute()
const canvasStore = useCanvasStore()
const uiStore = useUIStore()

function syncRouteCanvas(): void {
  const id = route.params.id as string | undefined
  const templateId = route.query.template as string | undefined
  if (!id) return

  if (id === 'new') {
    if (!canvasStore.currentCanvas || templateId) {
      canvasStore.createCanvas(undefined, templateId)
    }
    return
  }

  if (canvasStore.currentCanvasId !== id) {
    canvasStore.switchCanvas(id)
  }
}

onMounted(syncRouteCanvas)
watch(
  () => [route.params.id, route.query.template],
  () => syncRouteCanvas(),
  { deep: true }
)
</script>
