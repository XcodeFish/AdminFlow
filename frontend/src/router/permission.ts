// web/src/router/permission.ts
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import type { Router, RouteLocationNormalized } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import { usePermissionStore } from '@/store/modules/permission'
import { autoRefreshToken } from '@/utils/auth-helper'
import type { CustomRouteRecord } from '@/utils/route-generator'
import { errorRoutes } from './routes'

// 白名单路径 - 不需要认证即可访问
const WHITE_LIST = ['/login', '/403', '/404', '/500']

// 配置NProgress
NProgress.configure({ showSpinner: false })

// 开始加载进度条
function startProgress() {
  NProgress.start()
}

// 结束加载进度条
function stopProgress() {
  NProgress.done()
}

/**
 * 设置路由守卫
 * @param router 路由实例
 */
export function setupRouterGuard(router: Router) {
  // 记录重定向以防止无限循环
  const redirectsCount = new Map<string, number>()

  // 路由前置守卫
  router.beforeEach(async (to, from, next) => {
    // 开始进度条
    startProgress()

    // 检查路由正确性
    console.log(`🚩 导航开始: ${from.path} -> ${to.path}`)

    // 设置页面标题
    updatePageTitle(to)

    // 防止无限重定向
    const redirectKey = `${from.path}->${to.path}`
    const currentCount = redirectsCount.get(redirectKey) || 0
    if (currentCount > 3) {
      console.error(`🚨 检测到可能的无限重定向: ${redirectKey}`)
      redirectsCount.clear() // 重置计数
      return next('/500')
    }
    redirectsCount.set(redirectKey, currentCount + 1)

    // 如果已经在仪表盘页面，不要再重定向到仪表盘
    if (to.path === '/dashboard') {
      redirectsCount.clear()
    }

    // 白名单页面不需要验证，直接放行
    if (WHITE_LIST.includes(to.path)) {
      return next()
    }

    // 检查认证状态
    const userStore = useUserStore()
    const token = userStore.getToken
    const isLoggedIn = !!token
    const requiresAuth = to.meta.requiresAuth !== false

    // 未登录且需要认证的页面
    if (requiresAuth && !isLoggedIn) {
      console.log('🚩 用户未登录，重定向到登录页')
      redirectsCount.clear()
      return next({
        path: '/login',
        query: to.path !== '/' && to.path !== '/dashboard' ? { redirect: to.path } : {},
        replace: true
      })
    }

    // 已登录但访问登录页面
    if (isLoggedIn && to.path === '/login') {
      console.log('🚩 已登录用户访问登录页，重定向到首页')
      redirectsCount.clear()
      return next({ path: '/' })
    }

    // 已登录且需要认证的页面
    if (isLoggedIn && requiresAuth) {
      // 获取用户信息(如果未获取)
      if (Object.keys(userStore.getUserInfo).length === 0) {
        try {
          // 调用获取用户信息的API
          await userStore.checkAutoLogin()
        } catch (error) {
          console.error('🚨 获取用户信息失败:', error)
          userStore.clearToken()
          redirectsCount.clear()
          return next({
            path: '/login',
            query: { redirect: to.path, ...to.query }
          })
        }
      }

      // 动态路由处理
      const permissionStore = usePermissionStore()

      // 检查异常状态：如果标记为已添加但没有实际路由
      if (permissionStore.isDynamicRouteAdded && permissionStore.dynamicRoutes.length === 0) {
        console.warn('⚠️ 检测到异常状态：isDynamicRouteAdded为true但没有动态路由，尝试修复...')
        permissionStore.isDynamicRouteAdded = false
      }

      if (!permissionStore.isDynamicRouteAdded) {
        try {
          console.log('🚩 开始加载动态路由...')
          const { success, routes } = await permissionStore.loadPermissions()
          console.log('🚩 动态路由加载结果:', {
            success,
            routesCount: routes?.length || 0
          })

          if (success && routes && routes.length > 0) {
            // 记录添加前的路由数量
            const beforeCount = router.getRoutes().length

            // 添加动态路由
            // routes.forEach((route) => {
            //   router.addRoute(route)
            //   console.log(`🚩 添加路由: ${route.path} (${String(route.name)})`)
            // })
            // 分离父路由和子路由
            const parentRoutes = routes.filter((route: CustomRouteRecord) => !route.parentName)
            const childRoutes = routes.filter((route: CustomRouteRecord) => route.parentName)

            console.log('🚩 父路由:', parentRoutes)
            console.log('🚩 子路由:', childRoutes)

            // 先添加所有父级路由
            parentRoutes.forEach((route: CustomRouteRecord) => {
              const { parentName, ...routeConfig } = route // 移除parentName属性
              router.addRoute(routeConfig)
              console.log(`🚩 添加父路由: ${route.path} (${String(route.name)})`)
            })

            // 再添加所有子路由
            childRoutes.forEach((route: CustomRouteRecord) => {
              const { parentName, ...routeConfig } = route // 移除parentName属性
              if (parentName) {
                router.addRoute(parentName, routeConfig)
                console.log(
                  `🚩 添加子路由: ${route.path} (${String(route.name)}) -> 父路由: ${parentName}`
                )
              }
            })

            // 添加错误路由
            errorRoutes.forEach((route) => {
              if (route.name && !router.hasRoute(route.name)) {
                router.addRoute(route)
                console.log(`🚩 添加错误路由: ${route.path} (${String(route.name)})`)
              }
            })

            // 记录添加后的路由数量
            const afterCount = router.getRoutes().length
            console.log(`🚩 路由添加完成，路由总数从 ${beforeCount} 增加到 ${afterCount}`)

            // 在这里添加代码查看路由详情
            console.log(
              '📍 所有注册的路由:',
              router.getRoutes().map((r) => ({ path: r.path, name: r.name }))
            )

            // 设置路由已添加标志
            permissionStore.setDynamicRouteAdded(true)

            // 如果当前访问的是根路径，重定向到仪表盘
            if (to.path === '/') {
              redirectsCount.clear()
              return next({ path: '/dashboard', replace: true })
            }

            // 如果导航目标有效，使用replace模式导航（避免历史堆积）
            if (to.matched.length === 0) {
              // 需要重新解析路由
              redirectsCount.clear()
              return next({ ...to, replace: true })
            }
          }
        } catch (error) {
          console.error('🚨 加载动态路由失败:', error)
          redirectsCount.clear()
          return next({ path: '/500' })
        }
      }

      // 刷新页面时的路由匹配问题处理
      // 如果URL中的path与to.path相同，则说明是刷新或直接访问
      if (window.location.pathname === to.path && !to.redirectedFrom) {
        console.log('🚩 检测到页面刷新:', to.path)

        // 如果路由匹配失败但动态路由已添加
        if (to.matched.length === 0 && permissionStore.isDynamicRouteAdded) {
          console.log('🚩 刷新时路由匹配失败，尝试重新加载权限...')
          try {
            await permissionStore.loadPermissions()

            // 添加时间戳作为query参数，避免重定向到相同路由时导航被取消
            const timestamp = Date.now()
            redirectsCount.clear()
            return next({
              path: to.path,
              query: { ...to.query, _t: timestamp.toString() },
              replace: true
            })
          } catch (error) {
            console.error('🚨 重新加载权限失败:', error)
            redirectsCount.clear()
            return next({ path: '/500' })
          }
        }
      }
    }

    // 检查组件是否存在
    if (to.meta.componentExists === false) {
      console.warn(`⚠️ 访问不存在的组件路由: ${to.path}`)
      redirectsCount.clear()
      return next('/404')
    }

    // 允许访问
    redirectsCount.clear() // 导航成功，清除重定向计数
    return next()
  })

  // 路由后置守卫
  router.afterEach(() => {
    // 结束加载进度条
    stopProgress()
    // 清除重定向计数
    redirectsCount.clear()
  })

  // 路由错误处理
  router.onError((error) => {
    console.error('🚨 路由错误:', error)
    stopProgress()
    // 清除重定向计数
    redirectsCount.clear()
  })
}

/**
 * 更新页面标题
 * @param to 目标路由
 */
function updatePageTitle(to: RouteLocationNormalized): void {
  const title = to.meta.title ? `${to.meta.title} - Admin Flow` : 'Admin Flow'
  document.title = title
  console.log(`🚩 页面标题已更新: ${title}`)
}

/**
 * 检查用户认证状态
 * @param to 目标路由
 * @returns 重定向对象或true
 */
async function checkAuthentication(to: RouteLocationNormalized) {
  const userStore = useUserStore()
  const token = userStore.token

  console.log(`🚩 检查认证状态: ${to.path}，token存在: ${!!token}`)

  // 已登录状态
  if (token) {
    // 获取用户信息（如果未获取）
    if (Object.keys(userStore.userInfo).length === 0) {
      try {
        // 尝试解析JWT获取用户信息
        const autoLoginSuccess = userStore.checkAutoLogin()
        if (!autoLoginSuccess) {
          // 如果无法从JWT解析，清除token并重定向到登录页
          console.warn('⚠️ 自动登录失败，清除token并重定向到登录页')
          userStore.clearToken()
          return { path: '/login', query: { redirect: to.fullPath } }
        }
      } catch (error) {
        console.error('🚨 获取用户信息失败:', error)
        userStore.clearToken()
        return { path: '/login', query: { redirect: to.fullPath } }
      }
    }
    return true
  }

  // 未登录，尝试自动登录
  if (userStore.rememberMe && localStorage.getItem('remember') === 'true') {
    try {
      console.log('🚩 尝试自动登录...')
      const autoLoginSuccess = userStore.checkAutoLogin()
      if (autoLoginSuccess) {
        console.log('🚩 自动登录成功!')
        return { ...to, replace: true }
      }
    } catch (error) {
      console.error('🚨 自动登录失败:', error)
    }
  }

  // 无法自动登录，跳转到登录页
  console.log('🚩 未登录，重定向到登录页')
  return { path: '/login', query: { redirect: to.fullPath } }
}

/**
 * 设置动态路由
 * @param router 路由实例
 * @param to 目标路由
 * @returns 路由重定向对象或null
 */
async function setupDynamicRoutes(router: Router, to: RouteLocationNormalized) {
  const permissionStore = usePermissionStore()

  // 如果还没有添加动态路由，则添加
  if (!permissionStore.isDynamicRouteAdded) {
    try {
      console.log('🚩 开始加载动态路由...')
      const { success, routes } = await permissionStore.loadPermissions()
      console.log('🚩 动态路由加载结果:', {
        success,
        routesCount: routes?.length || 0
      })

      // 添加动态路由
      if (success && routes && routes.length > 0) {
        // 记录添加前的路由数量
        const beforeCount = router.getRoutes().length

        // 先清除所有动态路由（以防重复）
        routes.forEach((route) => {
          if (route.name && router.hasRoute(route.name)) {
            router.removeRoute(route.name)
          }
        })

        // 动态添加路由
        routes.forEach((route) => {
          router.addRoute(route)
          console.log(`🚩 添加路由: ${route.path} (${String(route.name)})`)
        })

        // 最后添加错误处理路由（确保404路由在最后）
        errorRoutes.forEach((route) => {
          if (route.name && !router.hasRoute(route.name)) {
            router.addRoute(route)
            console.log(`🚩 添加错误路由: ${route.path} (${String(route.name)})`)
          }
        })

        // 记录添加后的路由数量
        const afterCount = router.getRoutes().length
        console.log(`🚩 路由添加完成，路由总数从 ${beforeCount} 增加到 ${afterCount}`)

        permissionStore.setDynamicRouteAdded(true)

        // 如果当前访问的是根路径或登录页，重定向到仪表盘
        if (to.path === '/' || to.path === '/login') {
          return { path: '/dashboard', replace: true }
        }

        // 如果当前路由不存在或需要匹配新添加的路由，则重定向
        if (to.name && to.name !== 'NotFound' && !router.hasRoute(to.name)) {
          console.log(`🚩 当前路由 ${to.path} 不存在，重定向到同路径`)
          return { path: to.fullPath, replace: true }
        }
      } else {
        // 在这里，仪表盘路由已经在basicRoutes中，无需再添加基本路由
        console.warn('⚠️ 未获取到动态路由权限，仅使用基础路由...')
        permissionStore.setDynamicRouteAdded(true)

        // 如果当前访问的是根路径或登录页，重定向到仪表盘
        if (to.path === '/' || to.path === '/login') {
          return { path: '/dashboard', replace: true }
        }
      }
    } catch (error) {
      console.error('🚨 加载权限路由失败:', error)
      // 标记动态路由已添加，使用基础路由
      permissionStore.setDynamicRouteAdded(true)

      // 重定向到错误页
      return { path: '/500', replace: true }
    }
  } else {
    // 动态路由已添加，检查当前路由是否存在
    if (to.matched.length === 0 && to.name !== 'NotFound' && to.name !== 'NotFoundRedirect') {
      console.warn(`⚠️ 路由 ${to.path} 不存在，重定向到404`)
      return { path: '/404', replace: true }
    }
  }

  return null
}

/**
 * 检查页面访问权限
 * @param to 目标路由
 * @returns 权限拒绝重定向对象或null
 */
function checkPermissions(to: RouteLocationNormalized) {
  const permissionStore = usePermissionStore()

  // 检查页面权限
  if (to.meta?.permission) {
    const permissionKey = to.meta.permission as string
    const hasPermission = permissionStore.checkPermission(permissionKey)

    if (!hasPermission) {
      console.warn(`⚠️ 无权限访问: ${to.path}，缺少权限: ${permissionKey}`)
      return { path: '/403', replace: true }
    }
  }

  // 检查角色权限
  if (to.meta?.roles && Array.isArray(to.meta.roles)) {
    const roles = to.meta.roles as string[]
    if (roles.length > 0 && !roles.some((role) => permissionStore.checkRole(role))) {
      console.warn(`⚠️ 无权限访问: ${to.path}，缺少角色: ${roles.join(', ')}`)
      return { path: '/403', replace: true }
    }
  }

  return null
}
