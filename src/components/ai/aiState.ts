import { reactive } from 'vue'

/** G1：AI 对话框状态（编辑器内挂载） */
export const aiState = reactive({
  generateOpen: false,
  settingsOpen: false,
  coachNoteId: null as string | null,
})

export function openAiGenerate(): void {
  aiState.generateOpen = true
}

export function openAiSettings(): void {
  aiState.settingsOpen = true
}

export function openAiCoach(noteId: string): void {
  aiState.coachNoteId = noteId
}
