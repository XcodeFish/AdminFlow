import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './styles/index.scss'

// 创建应用实例
const app = createApp(App)

// 添加全局错误处理器
app.config.errorHandler = (err, instance, info) => {
  // 导入和使用全局错误处理器
  const { globalErrorHandler } = require('./composables/useErrorHandler')

  // 处理错误并提供组件实例和错误信息
  globalErrorHandler.handleError(err, 'error', {
    log: true,
    showNotification: true,
    addToHistory: true
  })

  // 输出调试信息（仅在开发环境）
  if (import.meta.env.DEV) {
    console.error('Vue组件错误:', err)
    console.error('错误来源:', instance)
    console.error('错误信息:', info)
  }
}

// 配置Pinia
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// 注册全局组件和插件
app.use(router)
app.use(pinia)
app.use(ElementPlus, { size: 'default', zIndex: 2000 })

// 挂载应用
app.mount('#app')
