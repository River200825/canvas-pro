<template>
  <Teleport to="body">
    <div
      v-if="menu.open && menu.note"
      ref="menuRef"
      class="fixed z-[180] min-w-[176px] card shadow-xl py-1 animate-scale-in"
      :style="{ left: `${pos.x}px`, top: `${pos.y}px` }"
      role="menu"
      @click.stop
      @contextmenu.prevent
    >
      <!-- 颜色行 -->
      <div class="flex items-center gap-1 px-2.5 py-2 border-b border-canvas-border mb-1">
        <button
          v-for="c in NOTE_COLORS"
          :key="c.id"
          class="w-5 h-5 rounded-md border-2 transition-all hover:scale-110"
          :class="{ 'ring-2 ring-primary-500 ring-offset-1': c.id === menu.note.color }"
          :style="{ backgroundColor: c.bg, borderColor: c.border }"
          :aria-label="`改为${c.id}色`"
          :title="c.id"
          @click="act(() => canvasStore.colorNotes(targets, c.id))"
        />
      </div>

      <button class="dropdown-item w-full gap-2" @click="act(() => beginEdit())">
        <Pencil class="h-4 w-4" /> 编辑
      </button>
      <button class="dropdown-item w-full gap-2" @click="act(() => canvasStore.duplicateNote(menu.note!.id))">
        <Copy class="h-4 w-4" /> 复制
      </button>
      <button
        v-if="!menu.note.locked"
        class="dropdown-item w-full gap-2 text-primary-600 font-medium"
        @click="act(openCoach)"
      >
        <Sparkles class="h-4 w-4" /> AI 打磨...
      </button>
      <button class="dropdown-item w-full gap-2" @click="act(() => canvasStore.updateNote(menu.note!.id, { locked: !menu.note!.locked }))">
        <component :is="menu.note.locked ? LockOpen : Lock" class="h-4 w-4" />
        {{ menu.note.locked ? '解锁' : '锁定' }}
      </button>
      <template v-if="!menu.note.locked">
        <div class="my-1 border-t border-canvas-border" />
        <button
          class="dropdown-item w-full gap-2 !text-red-500 hover:!bg-red-50 dark:hover:!bg-red-900/30"
          @click="act(deleteTargets)"
        >
          <Trash2 class="h-4 w-4" /> 删除{{ targets.length > 1 ? `（${targets.length} 张）` : '' }}
        </button>
      </template>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { Copy, Lock, LockOpen, Pencil, Sparkles, Trash2 } from 'lucide-vue-next'
import { useCanvasStore } from '@/stores'
import { NOTE_COLORS } from '@/types/note'
import { closeNoteContextMenu, noteContextMenu as menu, requestEdit } from './noteInteraction'
import { openAiCoach } from '@/components/ai/aiState'

const canvasStore = useCanvasStore()
const menuRef = ref<HTMLElement | null>(null)

const targets = computed(() =>
  menu.note && canvasStore.selectedIds.includes(menu.note.id) && canvasStore.selectedIds.length > 1
    ? [...canvasStore.selectedIds]
    : menu.note
      ? [menu.note.id]
      : []
)

/** 视口内夹紧位置，避免菜单溢出屏幕 */
const pos = computed(() => {
  const W = 180
  const H = 220
  return {
    x: Math.min(menu.x, window.innerWidth - W - 8),
    y: Math.min(menu.y, window.innerHeight - H - 8),
  }
})

function beginEdit(): void {
  const note = menu.note
  if (!note || note.locked) return
  requestEdit(note.id)
}

function openCoach(): void {
  if (!menu.note) return
  openAiCoach(menu.note.id)
}

function deleteTargets(): void {
  canvasStore.deleteNotes(targets.value)
}

function act(fn: () => void): void {
  fn()
  closeNoteContextMenu()
}

function onGlobalClick(): void {
  if (menu.open) closeNoteContextMenu()
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && menu.open) closeNoteContextMenu()
}

watch(
  () => menu.open,
  async open => {
    if (open) {
      await nextTick()
      // 延迟注册，避免触发菜单的那次点击立即关闭
      setTimeout(() => {
        window.addEventListener('click', onGlobalClick)
        window.addEventListener('contextmenu', onGlobalClick)
      }, 0)
      window.addEventListener('keydown', onKeydown)
      window.addEventListener('resize', onGlobalClick)
    } else {
      window.removeEventListener('click', onGlobalClick)
      window.removeEventListener('contextmenu', onGlobalClick)
      window.removeEventListener('keydown', onKeydown)
      window.removeEventListener('resize', onGlobalClick)
    }
  }
)

onUnmounted(() => {
  window.removeEventListener('click', onGlobalClick)
  window.removeEventListener('contextmenu', onGlobalClick)
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('resize', onGlobalClick)
})
</script>
