// frontend/src/store/modules/permission.ts
import { defineStore } from 'pinia'
import { RouteRecordRaw } from 'vue-router'
import { asyncRoutes, constantRoutes } from '@/router/routes'
import { useUserStore } from './user'

interface PermissionState {
  routes: RouteRecordRaw[]
  dynamicRoutes: RouteRecordRaw[]
  isDynamicRouteAdded: boolean
}

export const usePermissionStore = defineStore('permission', {
  state: (): PermissionState => ({
    routes: [],
    dynamicRoutes: [],
    isDynamicRouteAdded: false
  }),

  actions: {
    setDynamicRouteAdded(added: boolean) {
      this.isDynamicRouteAdded = added
    },

    setRoutes(routes: RouteRecordRaw[]) {
      this.routes = constantRoutes.concat(routes)
      this.dynamicRoutes = routes
    },

    // 根据用户权限过滤路由
    async generateRoutes() {
      return new Promise<RouteRecordRaw[]>((resolve) => {
        const userStore = useUserStore()
        console.log('开始生成路由，用户角色和权限:', {
          roles: userStore.roles,
          permissions: userStore.permissions
        })

        let accessedRoutes: RouteRecordRaw[]

        // 如果是管理员，直接返回所有路由
        if (userStore.roles.includes('admin')) {
          console.log('用户是管理员，返回所有路由')
          accessedRoutes = asyncRoutes || []
        } else {
          // 否则根据权限过滤路由
          console.log('根据权限过滤路由...')

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

    // 加载权限路由 (为了兼容现有代码)
    async loadPermissions() {
      try {
        const routes = await this.generateRoutes()
        return {
          success: true,
          routes
        }
      } catch (error) {
        console.error('加载权限失败', error)
        return {
          success: false,
          routes: []
        }
      }
    }
  }
})
