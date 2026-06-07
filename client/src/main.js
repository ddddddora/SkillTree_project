import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// Импортируйте стили
import './index.css'

// Настройка feature flags для Vue
if (import.meta.env.PROD) {
  window.__VUE_OPTIONS_API__ = true
  window.__VUE_PROD_DEVTOOLS__ = false
  window.__VUE_PROD_HYDRATION_MISMATCH_DETAILS__ = false
}

const app = createApp(App)
app.use(store)
app.use(router)
app.mount('#app')

// Глобальная обработка ошибок
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue error:', err)
  console.info('Error info:', info)
}