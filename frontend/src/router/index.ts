// 修改 router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { constantRoutes, asyncRoutes } from './routes'
import { setupRouterGuard } from './permission'
import { usePermissionStore } from '../store/modules/permission'

// 创建路由实例 - 包含所有静态路由和动态路由
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...constantRoutes, ...asyncRoutes], // 直接加载所有路由
  scrollBehavior: () => ({ left: 0, top: 0 })
})

// 设置路由守卫
setupRouterGuard(router)

// 全局路由错误处理
router.onError((error) => {
  console.error('路由错误:', error)

  // 记录详细错误信息
  console.error('路由错误详情:', {
    error: error.message,
    stack: error.stack,
    currentPath: router.currentRoute.value.path,
    currentName: router.currentRoute.value.name,
    currentParams: router.currentRoute.value.params
  })

  // 尝试恢复路由状态
  const permissionStore = usePermissionStore()
  permissionStore.fallbackToLocalRoutes = true

  // 如果当前不在错误页，跳转到仪表盘
  const currentRoute = router.currentRoute.value
  if (!['/403', '/404', '/500'].includes(currentRoute.path)) {
    console.log('重定向到仪表盘...')
    router.push('/dashboard')
  }
})

// 添加调试代码
console.log('路由配置:', {
  constantRoutesCount: constantRoutes.length,
  asyncRoutesCount: asyncRoutes.length,
  totalRoutes: [...constantRoutes, ...asyncRoutes].length
})

// 输出所有已注册的路由路径
console.log('已注册路由:')
router.getRoutes().forEach((route) => {
  console.log(`- ${route.path} (${String(route.name)})`)
})

export default router
