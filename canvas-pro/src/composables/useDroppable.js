import { ref } from 'vue'
import { useDroppable } from '@dnd-kit/core'

export function useDroppable(options = {}) {
  const isOver = ref(false)
  const { setNodeRef, ...rest } = useDroppable(options)

  return {
    setNodeRef,
    isOver,
    ...rest,
  }
}