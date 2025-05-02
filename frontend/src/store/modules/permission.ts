// frontend/src/store/modules/permission.ts
import { defineStore } from 'pinia'
import { RouteRecordRaw } from 'vue-router'
import { asyncRoutes, constantRoutes } from '@/router/routes'
import { useUserStore } from './user'
import { getUserMenus } from '@/api/modules/menu'
import { UserMenuInfo } from '@/types/menu'

interface PermissionState {
  routes: RouteRecordRaw[]
  dynamicRoutes: RouteRecordRaw[]
  isDynamicRouteAdded: boolean
  isLoadingRoutes: boolean // 添加路由加载状态标记
  fallbackToLocalRoutes: boolean // 添加标记，表示是否已回退到本地路由
}

export const usePermissionStore = defineStore('permission', {
  state: (): PermissionState => ({
    routes: [],
    dynamicRoutes: [],
    isDynamicRouteAdded: false,
    isLoadingRoutes: false, // 初始化为false
    fallbackToLocalRoutes: false // 初始化为false
  }),

  actions: {
    setDynamicRouteAdded(added: boolean) {
      this.isDynamicRouteAdded = added
    },

    setRoutes(routes: RouteRecordRaw[]) {
      this.routes = constantRoutes.concat(routes)
      this.dynamicRoutes = routes
    },

    // 从后端获取菜单数据并生成路由
    async generateRoutesFromBackend() {
      // 如果已经回退到本地路由，不再尝试获取后端菜单
      if (this.fallbackToLocalRoutes) {
        console.log('已经回退到本地路由，使用本地路由配置')
        return this.generateRoutesFromLocal()
      }

      // 防止并发请求
      if (this.isLoadingRoutes) {
        console.log('路由加载中，等待完成...')
        // 等待现有请求完成
        const startTime = Date.now()
        while (this.isLoadingRoutes) {
          await new Promise((resolve) => setTimeout(resolve, 100))
          // 添加超时处理，避免死锁
          if (Date.now() - startTime > 5000) {
            console.warn('路由加载超时，中断等待')
            this.isLoadingRoutes = false
            break
          }
        }
        return this.routes.filter((r) => !constantRoutes.includes(r))
      }

      try {
        this.isLoadingRoutes = true
        const userStore = useUserStore()
        console.log('从后端获取菜单数据...，用户角色:', userStore.roles)

        // 检查是否是管理员
        const isAdmin = userStore.roles.includes('admin')
        console.log('用户是否是管理员:', isAdmin)

        const response = await getUserMenus()

        // 处理API响应，确保获取到正确的菜单数组
        let userMenus: UserMenuInfo[] = []

        // 检查响应格式
        if (response) {
          // 处理可能的不同响应结构
          if (Array.isArray(response)) {
            userMenus = response as UserMenuInfo[]
          } else {
            // 使用类型断言处理不同的响应结构
            const responseAny = response as any
            if (responseAny.data && Array.isArray(responseAny.data)) {
              userMenus = responseAny.data
            } else if (responseAny.items && Array.isArray(responseAny.items)) {
              userMenus = responseAny.items
            } else if (responseAny.menus && Array.isArray(responseAny.menus)) {
              userMenus = responseAny.menus
            }
          }
        }

        console.log('处理后的菜单数据:', userMenus)

        if (!userMenus || userMenus.length === 0) {
          console.warn('未获取到后端菜单数据，检查用户身份和后端返回')

          // 如果是管理员但未获取到菜单，可能是后端问题
          if (isAdmin) {
            console.warn('管理员未获取到菜单，可能是后端配置问题，使用本地路由')
          }

          this.fallbackToLocalRoutes = true
          return this.generateRoutesFromLocal()
        }

        console.log('获取到的用户菜单数据:', userMenus)
        // 将后端菜单转换为前端路由格式
        const accessedRoutes = this.transformMenuToRoutes(userMenus)

        // 确保至少有仪表盘路由
        if (accessedRoutes.length === 0) {
          console.log('转换后的路由为空，添加基础仪表盘路由')
          const dashboardRoute = asyncRoutes.find((route) => route.path === '/')
          if (dashboardRoute) {
            accessedRoutes.push(dashboardRoute)
          }
        }

        console.log('从后端菜单生成的路由:', accessedRoutes)
        this.setRoutes(accessedRoutes)
        return accessedRoutes
      } catch (error) {
        console.error('获取菜单数据失败，使用权限过滤本地路由:', error)
        this.fallbackToLocalRoutes = true
        return this.generateRoutesFromLocal()
      } finally {
        this.isLoadingRoutes = false
      }
    },

    // 从本地路由配置生成路由（不调用API）
    async generateRoutesFromLocal() {
      return new Promise<RouteRecordRaw[]>((resolve) => {
        const userStore = useUserStore()
        console.log('使用本地路由配置，用户角色和权限:', {
          roles: userStore.roles,
          permissions: userStore.permissions
        })

        let accessedRoutes: RouteRecordRaw[]

        // 如果是管理员，直接返回所有路由
        if (userStore.roles.includes('admin')) {
          console.log('用户是管理员，返回所有本地路由')
          accessedRoutes = asyncRoutes || []
        } else {
          // 否则根据权限过滤路由
          console.log('根据权限过滤本地路由...')

          // 先检查是否有dashboard相关权限，如果没有则添加
          if (!userStore.permissions.some((p) => p.includes('dashboard'))) {
            console.log('添加仪表盘基础权限')
            userStore.permissions.push('dashboard:view')
          }

          // 过滤路由
          accessedRoutes = this.filterAsyncRoutes(asyncRoutes, userStore.permissions)

          // 确保至少有仪表盘路由
          if (
            accessedRoutes.length === 0 ||
            !accessedRoutes.some(
              (route) =>
                route.path === '/' ||
                (route.children && route.children.some((child) => child.path === 'dashboard'))
            )
          ) {
            console.log('没有获取到有效路由，添加基础仪表盘路由')

            // 添加仪表盘路由
            const dashboardRoute = asyncRoutes.find((route) => route.path === '/')
            if (dashboardRoute) {
              accessedRoutes.push(dashboardRoute)
            }
          }
        }

        console.log('生成的有效路由数量:', accessedRoutes.length)
        this.setRoutes(accessedRoutes)
        resolve(accessedRoutes)
      })
    },

    // 根据用户权限过滤路由 - 修改为调用新的方法
    async generateRoutes() {
      // 如果已经回退到本地路由或者明确指定使用本地路由
      if (this.fallbackToLocalRoutes) {
        return this.generateRoutesFromLocal()
      }

      // 否则尝试从后端获取
      try {
        return await this.generateRoutesFromBackend()
      } catch (error) {
        console.error('获取后端路由失败，回退到本地路由', error)
        this.fallbackToLocalRoutes = true
        return this.generateRoutesFromLocal()
      }
    },

    // 将后端菜单数据转换为前端路由格式
    transformMenuToRoutes(menus: UserMenuInfo[] | any): RouteRecordRaw[] {
      const routes: RouteRecordRaw[] = []

      // 检查menus是否是数组，如果不是则返回空数组
      if (!menus || !Array.isArray(menus)) {
        console.warn('菜单数据不是数组格式:', menus)
        return routes
      }

      menus.forEach((menu) => {
        // 检查菜单项是否有效
        if (!menu || typeof menu !== 'object') {
          console.warn('跳过无效的菜单项:', menu)
          return // 跳过此次循环
        }

        try {
          // 构建路由对象
          const route: RouteRecordRaw = {
            path: menu.path || '',
            name: menu.name || '',
            redirect: menu.redirect,
            component: this.resolveComponent(menu.component || ''),
            meta: {
              title: menu.menuName || menu.meta?.title || '未命名',
              icon: menu.icon || menu.meta?.icon || '',
              requiresAuth: true,
              permission: menu.perms || menu.meta?.permission || ''
            },
            children: []
          }

          // 处理子路由
          if (menu.children && Array.isArray(menu.children) && menu.children.length > 0) {
            route.children = this.transformMenuToRoutes(menu.children)
          }

          routes.push(route)
        } catch (error) {
          console.error('处理菜单项时出错:', error, menu)
        }
      })

      return routes
    },

    // 解析组件路径为实际组件
    resolveComponent(component: string): any {
      if (!component || typeof component !== 'string') {
        console.warn('无效的组件路径:', component)
        return () => import('@/views/error/404.vue')
      }

      try {
        // Layout组件特殊处理
        if (component === 'Layout') {
          return () => import('@/layout/index.vue')
        }

        // 处理可能的不同组件路径格式
        let componentPath = component

        // 如果组件路径已经包含完整路径，则直接使用
        if (component.startsWith('@/')) {
          return () => import(/* @vite-ignore */ component)
        }

        // 如果包含.vue后缀，去除后缀
        if (component.endsWith('.vue')) {
          componentPath = component.slice(0, -4)
        }

        // 动态导入组件，使用@vite-ignore避免静态分析错误
        return () => import(/* @vite-ignore */ `@/views/${componentPath}.vue`)
      } catch (error) {
        console.error(`无法解析组件: ${component}`, error)
        // 如果组件不存在，返回404组件
        return () => import('@/views/error/404.vue')
      }
    },

    // 根据权限过滤路由
    filterAsyncRoutes(routes: RouteRecordRaw[], permissions: string[]): RouteRecordRaw[] {
      const res: RouteRecordRaw[] = []

      routes.forEach((route) => {
        const tmp = { ...route }

        if (this.hasPermission(permissions, tmp)) {
          if (tmp.children) {
            tmp.children = this.filterAsyncRoutes(tmp.children, permissions)
          }
          res.push(tmp)
        }
      })

      return res
    },

    // 检查是否有权限访问路由
    hasPermission(permissions: string[], route: RouteRecordRaw): boolean {
      if (route.meta?.permission) {
        return permissions.includes(route.meta.permission as string)
      }

      // 仪表盘路由始终允许访问
      if (
        route.path === '/' ||
        (route.children && route.children.some((child) => child.path === 'dashboard'))
      ) {
        return true
      }

      // 如果路由没有指定权限要求，则默认可访问
      return true
    },

    // 检查是否有某个权限
    checkPermission(permissionKey: string): boolean {
      const userStore = useUserStore()
      return userStore.permissions.includes(permissionKey)
    },

    // 检查是否有某个角色
    checkRole(roleKey: string): boolean {
      const userStore = useUserStore()
      return userStore.roles.includes(roleKey)
    },

    // 加载权限路由
    async loadPermissions() {
      try {
        // 修改为使用后端菜单数据
        const routes = await this.generateRoutesFromBackend()
        return {
          success: true,
          routes
        }
      } catch (error) {
        console.error('加载权限失败', error)
        // 设置标记，避免再次尝试从后端获取
        this.fallbackToLocalRoutes = true
        // 回退到本地路由
        const routes = await this.generateRoutesFromLocal()
        return {
          success: routes.length > 0,
          routes
        }
      }
    },

    // 重置状态
    resetState() {
      this.routes = []
      this.dynamicRoutes = []
      this.isDynamicRouteAdded = false
      this.isLoadingRoutes = false
      this.fallbackToLocalRoutes = false
    }
  }
})
