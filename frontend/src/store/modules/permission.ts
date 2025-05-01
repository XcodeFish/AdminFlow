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

        let accessedRoutes: RouteRecordRaw[]

        // 如果是管理员，直接返回所有路由
        if (userStore.roles.includes('admin')) {
          accessedRoutes = asyncRoutes || []
        } else {
          // 否则根据权限过滤路由
          accessedRoutes = this.filterAsyncRoutes(asyncRoutes, userStore.permissions)
        }

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
