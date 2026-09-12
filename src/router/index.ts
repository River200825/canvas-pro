import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
  },
  {
    path: '/guide',
    name: 'Guide',
    component: () => import('@/views/GuideView.vue'),
  },
  {
    path: '/canvas/new',
    name: 'NewCanvas',
    component: () => import('@/views/CanvasEditorView.vue'),
    props: (route) => ({ template: route.query.template }),
  },
  {
    path: '/canvas/:id',
    name: 'CanvasEditor',
    component: () => import('@/views/CanvasEditorView.vue'),
    props: true,
  },
  {
    path: '/examples/:id?',
    name: 'Examples',
    component: () => import('@/views/ExampleView.vue'),
    props: true,
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/RegisterView.vue'),
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/admin/AdminView.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory('/canvas-pro/'),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to) => {
  const raw = localStorage.getItem('canvas-pro:currentUser')
  const isLoggedIn = !!raw

  // 未登录 → 只能访问 login 和 register
  if (!isLoggedIn && to.name !== 'Login' && to.name !== 'Register') {
    return '/login'
  }

  // 已登录 → 不能访问 login
  if (isLoggedIn && to.name === 'Login') {
    return '/'
  }

  // admin 页面需要 admin 权限
  if (to.name === 'Admin') {
    const currentUser = raw ? JSON.parse(raw) : null
    if (!currentUser || currentUser.role !== 'admin') {
      return '/'
    }
  }
})

export default router
