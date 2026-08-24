<template>
  <template v-if="hasError">
    <div class="min-h-screen bg-canvas-bg flex items-center justify-center p-4">
      <div class="text-center max-w-md">
        <AlertTriangle class="w-12 h-12 mx-auto text-amber-500 mb-4" />
        <h1 class="text-xl font-bold text-text mb-2">页面出了点问题</h1>
        <p class="text-sm text-text-muted mb-6 leading-relaxed">
          应用遇到意外错误。你的数据仍保存在浏览器本地，不会丢失。<br />
          点击下方按钮重新加载即可继续。
        </p>
        <div class="flex items-center justify-center gap-2">
          <button class="btn-primary" @click="reload">重新加载</button>
          <button class="btn-secondary" @click="goHome">返回首页</button>
        </div>
      </div>
    </div>
  </template>
  <template v-else>
    <slot />
  </template>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import { useRouter } from 'vue-router'
import { AlertTriangle } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const hasError = ref(false)
const toast = useToast()

onErrorCaptured((err) => {
  hasError.value = true
  console.error('[ErrorBoundary]', err)
  return false
})

function reload(): void {
  window.location.reload()
}

function goHome(): void {
  hasError.value = false
  router.push('/').catch(() => window.location.reload())
  void toast
}
</script>
