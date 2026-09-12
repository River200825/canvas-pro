<template>
  <div class="min-h-screen bg-canvas-bg p-4">
    <div class="max-w-4xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-text">用户管理</h1>
          <p class="text-text-muted text-sm">欢迎，admin</p>
        </div>
        <button class="btn-secondary text-sm" @click="logout">退出登录</button>
      </div>

      <!-- 邀请新用户 -->
      <div class="card p-4 mb-6">
        <h2 class="text-sm font-semibold text-text mb-3">邀请新用户</h2>
        <div class="flex gap-2">
          <input
            v-model="newUserEmail"
            type="email"
            class="flex-1 rounded-lg border border-canvas-border px-3 py-2 bg-white dark:bg-gray-800 text-text focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="输入邮箱"
          />
          <button @click="inviteUser" class="btn-primary py-2 px-4 font-medium" :disabled="!newUserEmail">
            生成邀请码
          </button>
        </div>

        <div v-if="inviteResult" class="mt-3 p-3 rounded bg-primary-50 dark:bg-primary-900/20 text-sm">
          <p class="text-text-muted">已为 <strong>{{ inviteResult.email }}</strong> 生成邀请码：</p>
          <p class="font-mono font-bold text-primary-600 text-lg my-1">{{ inviteResult.code }}</p>
          <p class="text-text-muted text-xs">用户注册时需输入此邀请码和对应邮箱</p>
        </div>
      </div>

      <!-- 已注册用户 -->
      <div class="card p-4 mb-4">
        <h2 class="text-sm font-semibold text-text mb-3">已注册用户（{{ users.length }} 人）</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-text-muted border-b border-canvas-border">
                <th class="pb-2 font-medium">邮箱</th>
                <th class="pb-2 font-medium">状态</th>
                <th class="pb-2 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id" class="border-b border-canvas-border/50">
                <td class="py-2.5">{{ user.email }}</td>
                <td class="py-2.5">
                  <span v-if="user.status === 'active'" class="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs">已激活</span>
                  <span v-else class="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs">已停用</span>
                </td>
                <td class="py-2.5 text-right">
                  <button @click="deleteUser(user.id)" class="text-red-500 hover:underline text-xs">删除</button>
                  <button @click="toggleStatus(user.id)" class="text-primary-600 hover:underline text-xs ml-2">
                    {{ user.status === 'active' ? '停用' : '激活' }}
                  </button>
                </td>
              </tr>
              <tr v-if="users.length === 0">
                <td colspan="3" class="py-8 text-center text-text-muted">暂无用户</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 待注册邀请 -->
      <div class="card p-4">
        <h2 class="text-sm font-semibold text-text mb-3">待注册邀请（{{ pendingUsers.length }} 人）</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-text-muted border-b border-canvas-border">
                <th class="pb-2 font-medium">邮箱</th>
                <th class="pb-2 font-medium">邀请码</th>
                <th class="pb-2 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in pendingUsers" :key="p.id" class="border-b border-canvas-border/50">
                <td class="py-2.5">{{ p.email }}</td>
                <td class="py-2.5 font-mono text-xs">{{ p.inviteCode }}</td>
                <td class="py-2.5 text-right">
                  <button @click="deletePending(p.id)" class="text-red-500 hover:underline text-xs">撤销</button>
                </td>
              </tr>
              <tr v-if="pendingUsers.length === 0">
                <td colspan="3" class="py-8 text-center text-text-muted">暂无待注册邀请</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="mt-4 text-center">
        <router-link to="/" class="text-sm text-text-muted hover:text-text">返回首页</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCanvasStore } from '@/stores'

const router = useRouter()
const canvasStore = useCanvasStore()
const newUserEmail = ref('')
const inviteResult = ref<{ email: string; code: string } | null>(null)
const users = ref<Array<{ id: string; email: string; status: string }>>([])
const pendingUsers = ref<Array<{ id: string; email: string; inviteCode: string }>>([])

function loadData(): void {
  users.value = JSON.parse(localStorage.getItem('canvas-pro:users') || '[]')
  pendingUsers.value = JSON.parse(localStorage.getItem('canvas-pro:pendingUsers') || '[]')
}

function saveUsers(): void {
  localStorage.setItem('canvas-pro:users', JSON.stringify(users.value))
}

function savePending(): void {
  localStorage.setItem('canvas-pro:pendingUsers', JSON.stringify(pendingUsers.value))
}

function inviteUser(): void {
  if (!newUserEmail.value) return

  if (users.value.some(u => u.email === newUserEmail.value)) {
    alert('该邮箱已注册')
    return
  }
  if (pendingUsers.value.some(p => p.email === newUserEmail.value)) {
    alert('该邮箱已有待注册邀请')
    return
  }

  const code = btoa(newUserEmail.value + Date.now()).substring(0, 8).toUpperCase()
  pendingUsers.value.push({
    id: Date.now().toString(),
    email: newUserEmail.value,
    inviteCode: code,
  })
  savePending()
  inviteResult.value = { email: newUserEmail.value, code }
  newUserEmail.value = ''
}

function deleteUser(id: string): void {
  if (!confirm('确定删除该用户？')) return
  users.value = users.value.filter(u => u.id !== id)
  saveUsers()
}

function toggleStatus(id: string): void {
  const user = users.value.find(u => u.id === id)
  if (!user) return
  user.status = user.status === 'active' ? 'pending' : 'active'
  saveUsers()
}

function deletePending(id: string): void {
  pendingUsers.value = pendingUsers.value.filter(p => p.id !== id)
  savePending()
}

function logout(): void {
  canvasStore.logout()
  localStorage.removeItem('canvas-pro:currentUser')
  router.push('/login')
}

onMounted(() => {
  loadData()
})
</script>
