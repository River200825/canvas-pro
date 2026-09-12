<template>
  <div class="space-y-4">
    <div class="flex items-start gap-3 p-3 rounded-lg border border-canvas-border bg-white dark:bg-gray-800">
      <div class="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-primary-100 dark:bg-primary-900">
        <Sparkles class="w-5 h-5 text-primary-600" />
      </div>
      <div v-if="content" class="flex-1">
        <p class="font-medium text-text">{{ content.title }}</p>
        <p class="text-sm text-text-muted mt-1 whitespace-pre-line">{{ content.instruction }}</p>
      </div>
    </div>

    <!-- 可实际操作的练习沙盒 -->
    <div v-if="sandboxMode === 'edit'" class="rounded-xl border border-primary-200 dark:border-primary-900 bg-primary-50/40 dark:bg-gray-800 p-3">
      <div class="flex flex-wrap gap-2 items-start content-start min-h-[60px]">
        <div
          v-for="note in notes"
          :key="note.id"
          class="w-[46%] min-w-[150px] rounded-md p-2 shadow-sm"
          :style="{ backgroundColor: colorOf(note.color) }"
        >
          <input
            v-model="note.title"
            placeholder="标题..."
            class="w-full bg-transparent text-xs font-semibold text-gray-800 placeholder-gray-500 focus:outline-none"
          />
          <textarea
            v-model="note.content"
            rows="2"
            placeholder="内容..."
            class="w-full bg-transparent text-xs text-gray-700 placeholder-gray-500 focus:outline-none resize-none mt-1"
          ></textarea>
        </div>
      </div>
      <button class="btn-secondary !py-1 !px-2 text-xs gap-1 mt-2" @click="addNote">
        <Plus class="w-3.5 h-3.5" /> 添加便利贴
      </button>
    </div>

    <div v-else-if="sandboxMode === 'drag'" class="rounded-xl border border-primary-200 dark:border-primary-900 bg-primary-50/40 dark:bg-gray-800 p-3">
      <div class="grid grid-cols-2 gap-2">
        <div
          v-for="b in ['A', 'B']"
          :key="b"
          class="min-h-[130px] rounded-lg border-2 border-dashed border-canvas-border p-2 space-y-2 transition-colors"
          :class="{ 'border-primary-400 bg-primary-50/60': draggingOver === b }"
          @dragover.prevent="draggingOver = b"
          @dragleave="draggingOver = null"
          @drop.prevent="dropTo(b)"
        >
          <p class="text-xs font-semibold text-text-muted">区块 {{ b }}</p>
          <div
            v-for="note in notesByBlock(b)"
            :key="note.id"
            draggable="true"
            class="rounded-md p-2 cursor-grab active:cursor-grabbing shadow-sm text-xs text-gray-800 select-none"
            :style="{ backgroundColor: colorOf(note.color) }"
            :title="'按住我拖到另一个区块'"
            @dragstart="dragId = note.id"
            @dragend="draggingOver = null"
          >
            {{ note.content || '按住拖动我' }}
          </div>
        </div>
      </div>
    </div>

    <p v-else-if="content" class="text-sm text-text-muted text-center py-2">
      该步骤无需练习区操作，完成后进入编辑器体验即可
    </p>

    <button class="btn-primary w-full gap-2" :disabled="done" @click="done = true">
      <CheckCircle v-if="done" class="w-4 h-4" />
      {{ done ? '已完成练习' : '我已理解，继续下一步' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { CheckCircle, Plus, Sparkles } from 'lucide-vue-next'
import { getNoteColor, type NoteColorId } from '@/types/note'

const props = defineProps<{
  stepId: string
}>()

interface PracticeContent {
  title: string
  instruction: string
}

interface SandboxNote {
  id: number
  title: string
  content: string
  blockId: 'A' | 'B'
  color: NoteColorId
}

const CONTENT: Record<string, PracticeContent> = {
  'create-note': {
    title: '练习：创建便利贴',
    instruction: '点击下方「添加便利贴」按钮创建，然后在便签上直接输入标题和内容',
  },
  'edit-note': {
    title: '练习：编辑便利贴',
    instruction: '下方已有一张便利贴，直接点击文字修改标题和内容',
  },
  'drag-note': {
    title: '练习：跨区块拖拽',
    instruction: '按住下方便利贴拖到另一个区块的虚线框里松手',
  },
  viewport: {
    title: '了解缩放与平移',
    instruction: '进入编辑器后：Ctrl+滚轮以鼠标为中心缩放\n空白处拖拽平移，双击空白处重置视图',
  },
  'export-share': {
    title: '了解导出功能',
    instruction: '工具栏提供 PNG / PDF / Markdown / JSON 四种导出格式，JSON 可随时导入恢复备份',
  },
  presentation: {
    title: '了解演示模式',
    instruction: '进入编辑器后按 F 进入演示模式：隐藏 UI、Esc 退出',
  },
}

const PALETTE: NoteColorId[] = ['yellow', 'blue', 'green', 'pink', 'orange']

const done = ref(false)
let nextId = 1

const notes = ref<SandboxNote[]>([])
const dragId = ref<number | null>(null)
const draggingOver = ref<'A' | 'B' | null>(null)

// 编辑练习预置一张便利贴
if (props.stepId === 'edit-note') {
  notes.value.push(
    reactive({ id: nextId++, title: '第一张便利贴', content: '点击文字直接修改我', blockId: 'A', color: 'yellow' })
  )
}

const sandboxMode = computed<'edit' | 'drag' | null>(() => {
  if (props.stepId === 'create-note' || props.stepId === 'edit-note') return 'edit'
  if (props.stepId === 'drag-note') return 'drag'
  return null
})

const content = computed<PracticeContent | null>(() => CONTENT[props.stepId] ?? null)

function colorOf(id: NoteColorId): string {
  return getNoteColor(id).bg
}

function addNote(): void {
  notes.value.push({
    id: nextId++,
    title: '',
    content: '',
    blockId: 'A',
    color: PALETTE[notes.value.length % PALETTE.length],
  })
}

function notesByBlock(b: 'A' | 'B'): SandboxNote[] {
  return notes.value.filter(n => n.blockId === b)
}

function dropTo(b: 'A' | 'B'): void {
  const note = notes.value.find(n => n.id === dragId.value)
  if (note) note.blockId = b
  dragId.value = null
  draggingOver.value = null
}
</script>
