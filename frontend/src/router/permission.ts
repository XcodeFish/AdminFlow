// web/src/router/permission.ts
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import type { Router, RouteLocationNormalized } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import { usePermissionStore } from '@/store/modules/permission'
// import { useUIStore } from '@/store/modules/ui';

const WHITE_LIST = ['/login', '/social-callback', '/403', '/404', '/500', '/auth/forgot-password']

// 配置NProgress
NProgress.configure({ showSpinner: false })

export function setupRouterGuard(router: Router) {
  // 路由前置守卫
  router.beforeEach(async (to, from, next) => {
    // 开始加载进度条
    NProgress.start()

    // 设置页面标题
    updatePageTitle(to)

    // 检查UI库选择
    // const shouldRedirectToUISelect = await checkUILibrary(to);
    // if (shouldRedirectToUISelect) {
    //   return next({ path: '/ui-select', query: { redirect: to.fullPath } });
    // }

    // 白名单页面不需要验证，直接放行
    if (WHITE_LIST.includes(to.path)) {
      return next()
    }

    // 检查认证状态
    const authCheckResult = await checkAuthentication(to)
    if (typeof authCheckResult === 'object') {
      return next(authCheckResult)
    }

    // 处理动态路由
    const routeResult = await setupDynamicRoutes(router, to)
    if (routeResult) {
      return next(routeResult)
    }

    // 处理404路由
    if (to.name === 'NotFound' && usePermissionStore().isDynamicRouteAdded) {
      return next()
    }

    // 检查访问权限
    const permissionResult = checkPermissions(to)
    if (permissionResult) {
      return next(permissionResult)
    }

    next()
  })

  // 路由后置守卫
  router.afterEach(() => {
    // 结束加载进度条
    NProgress.done()
  })

  // 路由错误处理
  router.onError((error) => {
    console.error('路由错误:', error)
    NProgress.done()
  })
}

// 更新页面标题
function updatePageTitle(to: RouteLocationNormalized): void {
  const title = to.meta.title ? `${to.meta.title} - Admin Flow` : 'Admin Flow'
  document.title = title
}

// 检查UI库是否已选择
/*
async function checkUILibrary(to: RouteLocationNormalized): Promise<boolean> {
  const uiStore = useUIStore();
  const savedUI = localStorage.getItem('ui-library');

  // 如果已保存UI选择但状态未初始化，更新状态
  if (savedUI && !uiStore.initialized) {
    uiStore.initialized = true;
  }

  // 仅当没有UI选择且不在白名单时才需要跳转到选择页面
  return !savedUI && !WHITE_LIST.includes(to.path);
}
*/

// 检查用户认证状态
async function checkAuthentication(to: RouteLocationNormalized) {
  const userStore = useUserStore()
  const token = userStore.token

  // 已登录状态
  if (token) {
    // 获取用户信息（如果未获取）
    if (Object.keys(userStore.userInfo).length === 0) {
      try {
        // 尝试解析JWT获取用户信息
        const autoLoginSuccess = userStore.checkAutoLogin()
        if (!autoLoginSuccess) {
          // 如果无法从JWT解析，清除token并重定向到登录页
          userStore.clearToken()
          return { path: '/login', query: { redirect: to.fullPath } }
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        userStore.clearToken()
        return { path: '/login', query: { redirect: to.fullPath } }
      }
    }
    return true
  }

  // 未登录，尝试自动登录
  if (userStore.rememberMe && localStorage.getItem('remember') === 'true') {
    try {
      const autoLoginSuccess = userStore.checkAutoLogin()
      if (autoLoginSuccess) {
        return { ...to, replace: true }
      }
    } catch (error) {
      console.error('自动登录失败:', error)
    }
  }

  // 无法自动登录，跳转到登录页
  return { path: '/login', query: { redirect: to.fullPath } }
}

// 设置动态路由
async function setupDynamicRoutes(router: Router, to: RouteLocationNormalized) {
  const permissionStore = usePermissionStore()

  // 如果还没有添加动态路由，则添加
  if (!permissionStore.isDynamicRouteAdded) {
    try {
      console.log('开始加载动态路由...')
      const { success, routes } = await permissionStore.loadPermissions()
      console.log('动态路由加载结果:', { success, routesCount: routes?.length || 0 })

      // 打印当前路由路径，用于调试
      console.log('当前路由路径:', to.path)
      console.log('是否存在该路由:', router.hasRoute(to.name as string))

      // 打印所有已注册路由
      console.log('权限加载后所有注册路由:')
      router.getRoutes().forEach((route) => {
        console.log(`- [${String(route.name)}] ${route.path}`)
      })

      if (success && routes && routes.length > 0) {
        // 动态添加路由
        routes.forEach((route: any) => {
          if (!router.hasRoute(route.name as string)) {
            router.addRoute(route)
            console.log(`添加路由: ${route.path} (${String(route.name)})`)
          }
        })

        permissionStore.setDynamicRouteAdded(true)

        // 如果当前访问的是根路径或登录页，重定向到仪表盘
        if (to.path === '/' || to.path === '/login') {
          return { path: '/dashboard', replace: true }
        }

        // 如果当前路由不存在或需要匹配新添加的路由，则重定向
        if (to.name !== 'NotFound' && !router.hasRoute(to.name as string)) {
          console.log(`当前路由 ${to.path} 不存在，重定向到同路径`)
          return { path: to.fullPath, replace: true }
        }
      } else {
        // 在这里，仪表盘路由已经在constantRoutes中，无需再添加基本路由
        console.log('未获取到动态路由权限，使用静态路由...')
        permissionStore.setDynamicRouteAdded(true)

        // 如果当前访问的是根路径或登录页，重定向到仪表盘
        if (to.path === '/' || to.path === '/login') {
          return { path: '/dashboard', replace: true }
        }
      }
    } catch (error) {
      console.error('加载权限路由失败:', error)
      // 标记动态路由已添加，使用静态路由
      permissionStore.setDynamicRouteAdded(true)

      // 重定向到错误页
      return { path: '/500' }
    }
  }

  return null
}

// 检查页面访问权限
function checkPermissions(to: RouteLocationNormalized) {
  const permissionStore = usePermissionStore()

  // 检查页面权限
  if (to.meta?.permission) {
    const hasPermission = permissionStore.checkPermission(to.meta.permission as string)
    if (!hasPermission) {
      return { path: '/403' }
    }
  }

  // 检查角色权限
  if (to.meta?.roles && Array.isArray(to.meta.roles)) {
    const roles = to.meta.roles as string[]
    if (roles.length > 0 && !roles.some((role) => permissionStore.checkRole(role))) {
      return { path: '/403' }
    }
  }

  return null
}
