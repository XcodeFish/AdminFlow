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

// 配置Pinia
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// 注册全局组件和插件
app.use(router)
app.use(pinia)
app.use(ElementPlus, { size: 'default', zIndex: 2000 })

// 挂载应用
app.mount('#app')
