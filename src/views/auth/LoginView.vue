<template>
  <div class="min-h-screen flex items-center justify-center bg-canvas-bg p-4">
    <div class="card p-8 max-w-md w-full shadow-xl">
      <h2 class="text-2xl font-bold text-text mb-6 text-center">登录</h2>

      <div v-if="errorMsg" class="mb-4 p-3 rounded bg-red-50 dark:bg-red-900/20 text-red-600 text-sm">
        {{ errorMsg }}
      </div>

      <form @submit.prevent="login" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-text mb-2">账号</label>
          <input
            v-model="account"
            type="text"
            class="w-full rounded-lg border border-canvas-border px-3 py-2.5 bg-white dark:bg-gray-800 text-text focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="输入账号或邮箱"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-text mb-2">密码</label>
          <input
            v-model="password"
            type="password"
            class="w-full rounded-lg border border-canvas-border px-3 py-2.5 bg-white dark:bg-gray-800 text-text focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="输入密码"
            required
          />
        </div>

        <button type="submit" class="w-full btn-primary py-2.5 font-medium">登录</button>
      </form>

      <div class="mt-4 text-center text-sm text-text-muted">
        <router-link to="/register" class="text-primary-600 hover:underline">还没有账号？注册</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCanvasStore } from '@/stores'

const router = useRouter()
const canvasStore = useCanvasStore()
const account = ref('')
const password = ref('')
const errorMsg = ref('')

function login(): void {
  errorMsg.value = ''

  // 先清除旧登录状态
  localStorage.removeItem('canvas-pro:currentUser')

  // admin 账号
  if (account.value === 'admin' && password.value === 'Xag88888888') {
    localStorage.setItem('canvas-pro:currentUser', JSON.stringify({ email: 'admin', role: 'admin' }))
    canvasStore.switchUser('admin')
    router.push('/admin')
    return
  }

  // 普通用户（用邮箱登录）
  const users = JSON.parse(localStorage.getItem('canvas-pro:users') || '[]')
  const user = users.find((u: any) => u.email === account.value && u.password === password.value)

  if (!user) {
    errorMsg.value = '账号或密码错误'
    return
  }

  if (user.status !== 'active') {
    errorMsg.value = '账号未激活，请联系管理员'
    return
  }

  localStorage.setItem('canvas-pro:currentUser', JSON.stringify({ email: user.email, role: 'user' }))
  canvasStore.switchUser(user.email)
  router.push('/')
}
</script>
