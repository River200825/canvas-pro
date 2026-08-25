<template>
  <Transition name="progress">
    <div
      v-if="visible"
      class="fixed top-0 left-0 right-0 h-0.5 z-[400] pointer-events-none"
      role="progressbar"
      aria-label="页面加载中"
    >
      <div class="h-full bg-primary-500 progress-indeterminate" />
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const visible = ref(false)
let showTimer: number | undefined
let hideTimer: number | undefined
let shownAt = 0

const MIN_VISIBLE_MS = 250

const router = useRouter()

function start(): void {
  window.clearTimeout(hideTimer)
  showTimer = window.setTimeout(() => {
    visible.value = true
    shownAt = Date.now()
  }, 80)
}

function end(): void {
  window.clearTimeout(showTimer)
  hideTimer = window.setTimeout(() => {
    const elapsed = Date.now() - shownAt
    const wait = visible.value ? Math.max(0, MIN_VISIBLE_MS - elapsed) : 0
    setTimeout(() => (visible.value = false), wait)
  }, 0)
}

onMounted(() => {
  router.beforeEach((to, from) => {
    if (to.path !== from.path) start()
  })
  router.afterEach(end)
  router.onError(end)
})

onUnmounted(() => {
  window.clearTimeout(showTimer)
  window.clearTimeout(hideTimer)
})
</script>

<style scoped>
.progress-indeterminate {
  animation: slide 0.9s ease-in-out infinite;
  width: 40%;
}
@keyframes slide {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(350%);
  }
}
.progress-enter-active,
.progress-leave-active {
  transition: opacity 150ms ease-out;
}
.progress-enter-from,
.progress-leave-to {
  opacity: 0;
}
</style>
