// 修改 router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { constantRoutes } from './routes'
import { setupRouterGuard } from './permission'
import { usePermissionStore } from '../store/modules/permission'

// 创建路由实例
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: constantRoutes,
  scrollBehavior: () => ({ left: 0, top: 0 })
})

// 设置路由守卫
setupRouterGuard(router)

// 全局路由错误处理
router.onError((error) => {
  console.error('路由错误:', error)

  // 尝试恢复路由状态
  const permissionStore = usePermissionStore()

  // 如果路由加载出错，标记为回退到本地路由
  if (!permissionStore.fallbackToLocalRoutes) {
    permissionStore.fallbackToLocalRoutes = true

    // 如果当前不在错误页，跳转到仪表盘
    const currentRoute = router.currentRoute.value
    if (!['/403', '/404', '/500'].includes(currentRoute.path)) {
      router.push('/dashboard')
    }
  }
})

export default router
