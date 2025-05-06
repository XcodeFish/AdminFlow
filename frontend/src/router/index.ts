// 修改 router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { constantRoutes, basicRoutes, errorRoutes } from './routes'
import { setupRouterGuard } from './permission'
import { usePermissionStore } from '../store/modules/permission'

// 创建路由实例 - 只加载静态路由和基础路由
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...constantRoutes, ...basicRoutes], // 只加载静态路由和基础路由
  scrollBehavior: () => ({ left: 0, top: 0 })
})

// 设置路由守卫
setupRouterGuard(router)

// 全局路由错误处理
router.onError((error) => {
  console.error('🚨 路由错误:', error)

  // 记录详细错误信息
  console.error('🚨 路由错误详情:', {
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
    console.log('🚩 路由错误，重定向到仪表盘...')
    router.push('/dashboard')
  }
})

// 添加调试代码
console.log('🚩 初始路由配置:', {
  staticRoutesCount: constantRoutes.length,
  basicRoutesCount: basicRoutes.length,
  totalInitialRoutes: [...constantRoutes, ...basicRoutes].length
})

// 输出所有已注册的路由路径
console.log('🚩 已注册的初始路由:')
router.getRoutes().forEach((route) => {
  console.log(`- ${route.path} (${String(route.name)})`)
})

// 添加注册动态路由的方法
export function resetRouter() {
  // 输出当前路由信息用于调试
  console.log('🚩 重置前的路由数量:', router.getRoutes().length)
  console.log('🚩 现有路由列表:')
  router.getRoutes().forEach((route) => {
    console.log(`- ${route.path} (${String(route.name)})`)
  })

  try {
    // 先尝试移除所有非基础路由
    const routesToRemove = router
      .getRoutes()
      .filter(
        (route) =>
          route.name &&
          !constantRoutes.some((r) => r.name === route.name) &&
          !basicRoutes.some((r) => r.name === route.name)
      )

    // 移除找到的路由
    routesToRemove.forEach((route) => {
      if (route.name) {
        console.log(`🚩 移除路由: ${route.path} (${String(route.name)})`)
        router.removeRoute(route.name)
      }
    })

    // 确保重新添加基础路由
    basicRoutes.forEach((route) => {
      if (route.name && !router.hasRoute(route.name)) {
        router.addRoute(route)
        console.log(`🚩 重新添加基础路由: ${route.path} (${String(route.name)})`)
      }
    })

    // 确保重新添加错误路由（放在最后）
    errorRoutes.forEach((route) => {
      if (route.name && !router.hasRoute(route.name)) {
        router.addRoute(route)
        console.log(`🚩 重新添加错误路由: ${route.path} (${String(route.name)})`)
      }
    })

    console.log('🚩 路由已重置，当前路由数量:', router.getRoutes().length)

    // 打印重置后的所有路由，用于调试
    console.log('🚩 重置后的路由列表:')
    router.getRoutes().forEach((route) => {
      console.log(`- ${route.path} (${String(route.name)})`)
    })
  } catch (error) {
    console.error('🚨 重置路由时发生错误:', error)
    // 尝试进行备用恢复
    try {
      const routes = [...constantRoutes, ...basicRoutes, ...errorRoutes]
      router.getRoutes().forEach((route) => {
        if (route.name) router.removeRoute(route.name)
      })
      routes.forEach((route) => router.addRoute(route))
      console.log('🚩 路由已通过备选方法重置')
    } catch (fallbackError) {
      console.error('🚨 路由备选重置也失败:', fallbackError)
    }
  }
}

export default router
