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
]

const router = createRouter({
  history: createWebHashHistory('/canvas-pro/'),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
