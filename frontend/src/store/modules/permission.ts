// frontend/src/store/modules/permission.ts
import { defineStore } from 'pinia'
import { RouteRecordRaw } from 'vue-router'
import { asyncRoutes, constantRoutes } from '@/router/routes'
import { useUserStore } from './user'
import { getUserMenus } from '@/api/modules/menu'

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
      if (this.isLoadingRoutes) {
        console.log('正在加载路由，等待加载完成...')
        // 等待路由加载完成
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
        console.log('从后端获取菜单数据...')

        const response = await getUserMenus()

        // 处理不同的后端响应格式
        let userMenus: any[] = []
        if (Array.isArray(response)) {
          userMenus = response
        } else if (response && typeof response === 'object') {
          // 尝试不同的嵌套结构
          const responseObj = response as Record<string, any>
          userMenus = responseObj.data || responseObj.items || responseObj.menus || []
        }

        console.log('获取到的用户菜单数据:', userMenus)

        if (!userMenus || userMenus.length === 0) {
          console.warn('未获取到后端菜单数据，使用本地路由')
          this.fallbackToLocalRoutes = true
          return this.generateRoutesFromLocal()
        }

        // 将后端菜单转换为前端路由格式
        const accessedRoutes = this.transformMenuToRoutes(userMenus)

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
    transformMenuToRoutes(menus: any[]): RouteRecordRaw[] {
      const routes: RouteRecordRaw[] = []

      if (!menus || !Array.isArray(menus)) {
        console.warn('菜单数据不是数组格式:', menus)
        return routes
      }

      menus.forEach((menu) => {
        if (!menu || typeof menu !== 'object') {
          return // 跳过无效菜单项
        }

        try {
          // 构建路由对象
          const route: RouteRecordRaw = {
            // 处理路径，确保格式正确
            path: menu.path || '',

            // 处理路由名称
            name: this.generateRouteName(menu.menuName || menu.id),

            // 处理重定向，目录类型通常需要重定向
            redirect: menu.menuType === 'M' ? 'noRedirect' : menu.redirect,

            // 处理组件路径
            component: this.resolveComponent(menu.component || ''),

            // 元数据处理
            meta: {
              title: menu.menuName || '未命名',
              icon: menu.icon || '',
              hidden: menu.isVisible !== 1, // 转换可见性
              requiresAuth: true,
              keepAlive: menu.isCache === 1, // 转换缓存设置
              permission: menu.perms || '' // 权限标识
            }
          }

          // 特殊处理目录类型
          if (menu.menuType === 'M') {
            route.meta = route.meta || {}
            route.meta.alwaysShow = true
          }

          // 处理子路由
          if (menu.children && Array.isArray(menu.children) && menu.children.length > 0) {
            route.children = this.transformMenuToRoutes(menu.children)

            // 如果是目录且有子路由，设置第一个子路由为重定向目标
            if (menu.menuType === 'M' && route.children.length > 0) {
              route.redirect = route.children[0].path
            }
          }

          routes.push(route)
        } catch (error) {
          console.error('处理菜单项时出错:', error, menu)
        }
      })

      return routes
    },

    // 生成路由名称
    generateRouteName(input: string | any): string {
      if (!input) return `Menu_${Date.now().toString(36)}`

      if (typeof input === 'string') {
        // 移除空格和特殊字符，首字母大写
        return input
          .replace(/[^\w\s]/gi, '')
          .replace(/\s+/g, '')
          .replace(/^./, (str) => str.toUpperCase())
      }

      return `Menu_${Date.now().toString(36)}`
    },

    // 解析组件路径
    resolveComponent(component: string): any {
      if (!component) {
        // 默认返回布局组件
        console.log('未提供组件路径，使用默认布局组件')
        return () => import('@/layout/index.vue')
      }

      // 处理布局组件
      if (component === 'Layout' || component.includes('layout')) {
        console.log('检测到布局组件:', component)
        return () => import('@/layout/index.vue')
      }

      // 处理其他组件路径
      try {
        console.log('尝试解析组件路径:', component)

        // 设置回退到本地路由策略
        this.fallbackToLocalRoutes = true
        console.log('主动切换到本地路由策略')

        // 特殊处理菜单管理页面，确保路由一定能加载
        if (component === 'system/menu/index') {
          return () => import('@/views/system/menu/index.vue')
        }

        // 对于目前不存在的组件，重定向到404
        return () => import('@/views/error/404.vue')
      } catch (error) {
        console.error('组件路径解析错误:', component, error)
        // 发生错误时返回404页面
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

      // 管理员拥有所有权限
      if (userStore.roles.includes('admin')) {
        return true
      }
      // 支持多种格式的权限检查
      if (Array.isArray(permissionKey)) {
        return permissionKey.some((key) => userStore.permissions.includes(key))
      }
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
        // 强制使用本地路由，暂时禁用后端菜单获取
        this.fallbackToLocalRoutes = true

        // 尝试加载本地路由
        const localRoutes = await this.generateRoutesFromLocal()

        // 如果是用户角色不是管理员，确保至少有系统管理和菜单管理权限
        const userStore = useUserStore()
        if (
          !userStore.roles.includes('admin') &&
          !userStore.permissions.includes('system:menu:list')
        ) {
          console.log('添加菜单管理权限')
          userStore.permissions.push('system:menu:list')
        }

        return {
          success: true,
          routes: localRoutes
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
