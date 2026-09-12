<template>
  <Transition name="banner">
    <div
      v-if="needRefresh"
      class="fixed top-0 left-0 right-0 z-[250] bg-primary-600 text-white text-sm px-4 py-2.5 flex items-center justify-center gap-3 shadow-lg"
      role="alert"
    >
      <span>发现新版本，更新后即可使用最新功能</span>
      <button class="px-3 py-1 rounded-md bg-white/20 hover:bg-white/30 transition-colors font-medium" @click="confirmUpdate">
        立即更新
      </button>
      <button class="opacity-70 hover:opacity-100" aria-label="暂不更新" @click="needRefresh = false">
        <X class="w-4 h-4" />
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { needRefresh, confirmUpdate } from '@/pwa'
</script>

<style scoped>
.banner-enter-active,
.banner-leave-active {
  transition: transform 250ms ease-out;
}
.banner-enter-from,
.banner-leave-to {
  transform: translateY(-100%);
}
</style>
