// 修改 router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { constantRoutes } from './routes'
import { setupRouterGuard } from './permission'

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes,
  scrollBehavior: () => ({ left: 0, top: 0 })
})

// 设置路由守卫
setupRouterGuard(router)

export default router
