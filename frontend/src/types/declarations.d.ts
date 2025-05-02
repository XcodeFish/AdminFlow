// 添加自定义类型声明

// 扩展 Vue Router 类型
import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    icon?: string
    hidden?: boolean
    requiresAuth?: boolean
    keepAlive?: boolean
    permission?: string | string[]
    activeMenu?: string
    affix?: boolean
  }

  interface RouteRecordRaw {
    alwaysShow?: boolean
  }
}
