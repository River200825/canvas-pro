import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { registerSW } from 'virtual:pwa-register'
import { needRefresh, bindUpdateSw } from '@/pwa'
import router from '@/router'
import 'virtual:uno.css'
import './styles/main.css'
import App from './App.vue'

// A6：新版本由用户确认后再刷新，避免打断编辑
bindUpdateSw(
  registerSW({
    immediate: true,
    onNeedRefresh() {
      needRefresh.value = true
    },
  })
)

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')