import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.js'),
  },
  {
    path: '/guide',
    name: 'Guide',
    component: () => import('@/views/GuideView.jsx'),
  },
  {
    path: '/canvas/:id',
    name: 'CanvasEditor',
    component: () => import('@/views/CanvasEditorView.js'),
    props: true,
  },
  {
    path: '/canvas/new',
    name: 'NewCanvas',
    component: () => import('@/views/CanvasEditorView.js'),
    props: (route: { query: Record<string, string | undefined> }) => ({ template: route.query.template }),
  },
  {
    path: '/examples/:id',
    name: 'ExampleView',
    component: () => import('@/views/ExampleView.js'),
    props: true,
  },
  {
    path: '/preview/:id',
    name: 'PreviewView',
    component: () => import('@/views/PreviewView.js'),
    props: true,
  },
  {
    path: '/test',
    name: 'Test',
    component: () => import('@/views/TestView.js'),
  },
  {
    path: '/minimal',
    name: 'Minimal',
    component: () => import('@/views/MinimalView.js'),
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