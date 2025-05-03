import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index'
import { useUserStore } from './store/modules/user'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './styles/index.scss'
// 导入Element Plus图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

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

// 注册所有Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 将路由实例挂载到window对象，方便在非Vue组件中访问
// 例如在权限存储模块中使用
declare global {
  interface Window {
    $router: typeof router
  }
}

// 挂载路由实例
window.$router = router
console.log('🚩 路由实例已挂载到window.$router')

const userStore = useUserStore()
if (userStore.shouldAutoLogin) {
  userStore.checkAutoLogin()
}

// 挂载应用
app.mount('#app')
