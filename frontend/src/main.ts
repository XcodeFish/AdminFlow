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
// 导入全局错误处理器
import { globalErrorHandler } from './composables/useErrorHandler'

// 创建应用实例
const app = createApp(App)

/**
 * 添加全局错误处理器
 * 特别处理三类常见错误:
 * 1. Element Plus组件特有的错误
 * 2. 涉及undefined属性设置的错误
 * 3. Vue watcher回调错误
 */
app.config.errorHandler = (err, instance, info) => {
  // 防止处理过程中出错
  try {
    // 添加某些错误的屏蔽机制
    const ignoredErrors = [
      // ElTree内部可能产生的错误，通常是临时性的DOM更新问题，可以忽略
      "Cannot set properties of undefined (setting 'checked')",
      "Cannot read properties of undefined (reading 'checked')"
    ]

    // 检查是否为可以忽略的错误
    if (err instanceof Error && ignoredErrors.some((msg) => err.message.includes(msg))) {
      // 仅在开发环境记录，但不显示通知
      if (import.meta.env.DEV) {
        console.warn('忽略非关键错误:', err.message)
      }
      return // 直接返回，不进一步处理
    }

    // 处理特定类型的 Element Plus 相关错误
    if (err instanceof Error && err.message.includes('Element Plus')) {
      console.warn('Element Plus组件错误:', err.message)

      // 可能是组件还未完全初始化就调用了方法，通常可忽略
      globalErrorHandler.handleError(
        {
          message: `UI组件错误: ${err.message}`,
          details: { info, component: 'Element Plus' }
        },
        'warning',
        {
          log: true,
          showMessage: false,
          showNotification: false,
          addToHistory: true
        }
      )
      return
    }

    // 处理特定类型的错误 - 设置undefined属性
    if (err instanceof TypeError && err.message.includes('Cannot set properties of undefined')) {
      console.warn('属性设置错误:', err.message)

      // 检查是否包含 watcher callback 信息
      const isWatcherError = info && typeof info === 'string' && info.includes('watcher callback')

      globalErrorHandler.handleError(
        {
          message: isWatcherError
            ? `Watcher回调错误: ${err.message}`
            : `属性设置错误: ${err.message}`,
          details: { info }
        },
        'warning',
        {
          log: true,
          showMessage: false, // 不显示消息
          showNotification: false, // 不显示通知
          addToHistory: true
        }
      )
      return
    }

    // 获取组件信息
    let componentName = '未知组件'
    try {
      if (instance && instance.type) {
        componentName =
          instance.type.name || instance.type.__name || instance.type.displayName || '匿名组件'
      }
    } catch (e) {
      componentName = '获取组件信息失败'
    }

    // 处理其他类型的错误
    globalErrorHandler.handleError(
      {
        message: err instanceof Error ? err.message : String(err),
        details: {
          component: componentName,
          info: info,
          stack: err instanceof Error ? err.stack : undefined
        }
      },
      'error',
      {
        log: true,
        showNotification: import.meta.env.PROD, // 仅在生产环境显示通知
        addToHistory: true
      }
    )

    // 输出调试信息（仅在开发环境）
    if (import.meta.env.DEV) {
      console.error('Vue错误:', err)
      console.error('错误来源:', componentName)
      console.error('错误信息:', info)
    }
  } catch (handlerError) {
    // 处理错误处理器本身的错误
    console.error('错误处理器出错:', handlerError)
    console.error('原始错误:', err)
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
