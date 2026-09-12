<template>
  <div class="min-h-screen flex items-center justify-center bg-canvas-bg p-4">
    <div class="card p-8 max-w-md w-full shadow-xl">
      <h2 class="text-2xl font-bold text-text mb-6 text-center">注册账号</h2>

      <div v-if="errorMsg" class="mb-4 p-3 rounded bg-red-50 dark:bg-red-900/20 text-red-600 text-sm">
        {{ errorMsg }}
      </div>

      <div v-if="successMsg" class="mb-4 p-3 rounded bg-green-50 dark:bg-green-900/20 text-green-600 text-sm">
        {{ successMsg }}
      </div>

      <form v-if="!successMsg" @submit.prevent="register" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-text mb-2">邀请码</label>
          <input
            v-model="inviteCode"
            type="text"
            class="w-full rounded-lg border border-canvas-border px-3 py-2.5 bg-white dark:bg-gray-800 text-text focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono"
            placeholder="向管理员获取邀请码"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-text mb-2">邮箱</label>
          <input
            v-model="email"
            type="email"
            class="w-full rounded-lg border border-canvas-border px-3 py-2.5 bg-white dark:bg-gray-800 text-text focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="your@email.com"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-text mb-2">密码</label>
          <input
            v-model="password"
            type="password"
            class="w-full rounded-lg border border-canvas-border px-3 py-2.5 bg-white dark:bg-gray-800 text-text focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="设置密码"
            required
          />
        </div>

        <button type="submit" class="w-full btn-primary py-2.5 font-medium">注册</button>
      </form>

      <div v-if="successMsg" class="text-center">
        <router-link to="/login" class="btn-primary inline-block py-2.5 px-6 font-medium">去登录</router-link>
      </div>

      <div class="mt-4 text-center text-sm text-text-muted">
        <router-link to="/login" class="text-primary-600 hover:underline">已有账号？登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const inviteCode = ref('')
const email = ref('')
const password = ref('')
const errorMsg = ref('')
const successMsg = ref('')

function register(): void {
  errorMsg.value = ''

  if (!inviteCode.value || !email.value || !password.value) {
    errorMsg.value = '请填写所有字段'
    return
  }

  const pendingUsers = JSON.parse(localStorage.getItem('canvas-pro:pendingUsers') || '[]')
  const matched = pendingUsers.find((u: any) => u.inviteCode === inviteCode.value && u.email === email.value)

  if (!matched) {
    errorMsg.value = '邀请码无效或与邮箱不匹配'
    return
  }

  // 检查邮箱是否已注册
  const users = JSON.parse(localStorage.getItem('canvas-pro:users') || '[]')
  if (users.some((u: any) => u.email === email.value)) {
    errorMsg.value = '该邮箱已注册'
    return
  }

  // 正式注册：从 pending 移到 users
  users.push({
    id: matched.id,
    email: email.value,
    password: password.value,
    status: 'active',
    createdAt: Date.now(),
  })
  localStorage.setItem('canvas-pro:users', JSON.stringify(users))

  // 从 pending 中移除
  const newPending = pendingUsers.filter((u: any) => u.inviteCode !== inviteCode.value)
  localStorage.setItem('canvas-pro:pendingUsers', JSON.stringify(newPending))

  successMsg.value = '注册成功！'
}
</script>
