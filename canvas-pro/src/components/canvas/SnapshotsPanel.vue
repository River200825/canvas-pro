<template>
  <aside
    v-if="canvasStore.currentCanvas"
    class="fixed right-0 top-0 bottom-0 w-80 z-[60] bg-white dark:bg-gray-900 border-l border-canvas-border shadow-xl flex flex-col animate-slide-in-right"
    aria-label="快照历史面板"
  >
    <div class="flex items-center justify-between px-4 py-3 border-b border-canvas-border shrink-0">
      <h2 class="font-semibold text-text flex items-center gap-2">
        <History class="h-5 w-5 text-primary-600" /> 快照历史
      </h2>
      <button class="btn-icon text-text-muted hover:text-text" aria-label="关闭快照面板" @click="$emit('close')">
        <X class="h-5 w-5" />
      </button>
    </div>

    <div class="px-4 py-3 border-b border-canvas-border shrink-0">
      <button class="btn-primary w-full gap-2" @click="handleCreate">
        <Camera class="h-4 w-4" /> 创建快照 (Ctrl+S)
      </button>
      <p class="text-xs text-text-muted mt-2">
        每 30 分钟与重大操作后自动创建，最多保留 {{ MAX_SNAPSHOTS }} 个
      </p>
    </div>

    <div class="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
      <p v-if="snapshots.length === 0" class="text-sm text-text-muted text-center py-8">
        暂无快照。<br />点击上方按钮创建第一个快照。
      </p>

      <div
        v-for="snapshot in snapshots"
        :key="snapshot.id"
        class="card p-3 flex items-start gap-2 hover:shadow-md transition-shadow"
      >
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-text truncate">{{ snapshot.name }}</p>
          <p class="text-xs text-text-muted mt-0.5">
            {{ formatTime(snapshot.createdAt) }} · {{ snapshot.notes.length }} 张便利贴
          </p>
        </div>
        <div class="flex items-center gap-1 shrink-0">
          <button
            class="btn-icon-sm text-text-muted hover:text-primary-600"
            :aria-label="`恢复到 ${snapshot.name}`"
            title="恢复此快照（当前内容会自动备份）"
            @click="askRestore(snapshot.id, snapshot.name)"
          >
            <RotateCcw class="h-4 w-4" />
          </button>
          <button
            class="btn-icon-sm text-text-muted hover:text-red-500"
            :aria-label="`删除 ${snapshot.name}`"
            title="删除快照"
            @click="deleteSnapshot(snapshot.id)"
          >
            <Trash2 class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>

    <ConfirmDialog
      v-if="restoreTarget"
      title="恢复快照"
      :message="`将恢复到「${restoreTarget.name}」。\n当前内容会自动备份为「恢复前」快照，可随时找回。`"
      confirm-text="恢复"
      @confirm="confirmRestore"
      @cancel="restoreTarget = null"
    />
  </aside>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Camera, History, RotateCcw, Trash2, X } from 'lucide-vue-next'
import { useCanvasStore } from '@/stores'
import { useToast } from '@/composables/useToast'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'

const emit = defineEmits<{
  (e: 'close'): void
}>()

const canvasStore = useCanvasStore()
const toast = useToast()
const MAX_SNAPSHOTS = 20

const snapshots = computed(() => canvasStore.currentCanvas?.snapshots ?? [])
const restoreTarget = ref<{ id: string; name: string } | null>(null)

function handleCreate(): void {
  canvasStore.createSnapshot()
  toast.success('快照已创建')
}

function askRestore(id: string, name: string): void {
  restoreTarget.value = { id, name }
}

function confirmRestore(): void {
  if (!restoreTarget.value) return
  canvasStore.restoreSnapshot(restoreTarget.value.id)
  restoreTarget.value = null
  toast.success('已恢复快照，之前的内容已自动备份')
}

function deleteSnapshot(id: string): void {
  canvasStore.deleteSnapshot(id)
  toast.info('快照已删除')
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}
</script>

<style scoped>
.animate-slide-in-right {
  animation: slideInRight 180ms ease-out;
}
@keyframes slideInRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}
</style>
