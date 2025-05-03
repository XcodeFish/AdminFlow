// frontend/src/store/modules/permission.ts
import { defineStore } from 'pinia'
import { RouteRecordRaw } from 'vue-router'
import { basicRoutes, errorRoutes } from '@/router/routes'
import { useUserStore } from './user'
import { getMenuTree, getUserMenus } from '@/api/modules/menu'
import { transformMenuToRoutes } from '@/utils/route-generator'
import { resetRouter } from '@/router'
import { normalizeComponentPath } from '@/utils/component-map'
import { resetRouteProcessingState } from '@/utils/route-generator'

// 权限状态接口
interface PermissionState {
  routes: RouteRecordRaw[] // 所有路由
  dynamicRoutes: RouteRecordRaw[] // 动态路由
  permissions: string[] // 当前用户的权限
  isDynamicRouteAdded: boolean // 动态路由是否已添加
  isLoadingRoutes: boolean // 路由加载状态
  fallbackToLocalRoutes: boolean // 是否回退到本地路由
}

export const usePermissionStore = defineStore('permission', {
  state: (): PermissionState => ({
    routes: [],
    dynamicRoutes: [],
    permissions: [],
    isDynamicRouteAdded: false,
    isLoadingRoutes: false,
    fallbackToLocalRoutes: false
  }),

  actions: {
    /**
     * 设置动态路由添加状态
     * @param added 是否已添加
     */
    setDynamicRouteAdded(added: boolean) {
      this.isDynamicRouteAdded = added
    },

    /**
     * 设置路由
     * @param routes 动态路由
     */
    setRoutes(routes: RouteRecordRaw[]) {
      this.dynamicRoutes = routes
      this.routes = [...basicRoutes, ...routes]
    },

    /**
     * 设置用户权限
     * @param permissions 权限列表
     */
    setPermissions(permissions: string[]) {
      this.permissions = permissions
    },

    /**
     * 处理菜单树数据
     * 预处理菜单树数据，确保组件路径的一致性
     */
    preprocessMenuTree(menuTree: any[]): any[] {
      if (!menuTree || !Array.isArray(menuTree)) return []

      return menuTree.map((menu) => {
        // 创建新对象，避免修改原始数据
        const newMenu = { ...menu }

        // 处理组件路径
        if (newMenu.component) {
          // 确保路径格式一致
          if (
            newMenu.component !== 'Layout' &&
            !newMenu.component.startsWith('http://') &&
            !newMenu.component.startsWith('https://')
          ) {
            // 规范化组件路径
            const normalizedPath = normalizeComponentPath(newMenu.component)

            // 如果是菜单类型（C）但没有指定组件，使用默认路径
            if (newMenu.menuType === 'C' && (!normalizedPath || normalizedPath === '')) {
              newMenu.component = `${newMenu.path.replace(/^\//, '')}/index`
              console.log(`🚩 为菜单 ${newMenu.menuName} 指定默认组件:`, newMenu.component)
            }
          }
        } else if (newMenu.menuType === 'M') {
          // 目录类型默认使用Layout
          newMenu.component = 'Layout'
        }

        // 递归处理子菜单
        if (newMenu.children && Array.isArray(newMenu.children)) {
          newMenu.children = this.preprocessMenuTree(newMenu.children)
        }

        return newMenu
      })
    },

    /**
     * 从后端获取菜单并生成路由
     * 使用getMenuTree接口获取完整菜单树
     */
    async generateRoutesFromMenuTree() {
      if (this.isLoadingRoutes) {
        console.log('🚩 正在加载路由，等待加载完成...')
        // 等待路由加载完成
        const startTime = Date.now()
        while (this.isLoadingRoutes) {
          await new Promise((resolve) => setTimeout(resolve, 100))
          // 添加超时处理，避免死锁
          if (Date.now() - startTime > 5000) {
            console.warn('⚠️ 路由加载超时，中断等待')
            this.isLoadingRoutes = false
            break
          }
        }
        return this.dynamicRoutes
      }

      try {
        this.isLoadingRoutes = true
        console.log('🚩 从后端获取菜单树数据...')

        // 获取菜单树
        const response = await getMenuTree()
        console.log('🚩 获取菜单树数据成功', response)
        const rawMenuTree = response.data || []

        console.log('🚩 获取到的原始菜单树数据:', JSON.stringify(rawMenuTree))

        if (!rawMenuTree || rawMenuTree.length === 0) {
          console.warn('⚠️ 未获取到菜单树数据，尝试获取用户菜单...')
          return this.generateRoutesFromUserMenus()
        }

        // 预处理菜单树数据
        const menuTree = this.preprocessMenuTree(rawMenuTree)
        console.log('🚩 处理后的菜单树数据:', JSON.stringify(menuTree))

        // 将菜单树转换为路由
        const dynamicRoutes = transformMenuToRoutes(menuTree)

        console.log('🚩 从菜单树生成的路由:', dynamicRoutes)
        this.setRoutes(dynamicRoutes)

        // 添加错误路由
        this.handleErrorRoutes()

        return dynamicRoutes
      } catch (error) {
        console.error('🚨 获取菜单树数据失败:', error)
        return this.generateRoutesFromUserMenus()
      } finally {
        this.isLoadingRoutes = false
      }
    },

    /**
     * 从用户菜单接口获取路由
     * 作为备选方案，如果菜单树接口失败
     */
    async generateRoutesFromUserMenus() {
      try {
        console.log('🚩 从后端获取用户菜单数据...')

        // 获取用户菜单和权限
        const response = await getUserMenus()

        // 处理响应数据
        let userMenus: any[] = []
        let permissions: string[] = []

        if (response && typeof response === 'object') {
          // 尝试不同的嵌套结构
          const responseObj = response as Record<string, any>
          userMenus = responseObj.data?.menus || responseObj.menus || []
          permissions = responseObj.data?.permissions || responseObj.permissions || []
        }

        console.log('🚩 获取到的用户菜单数据:', userMenus)
        console.log('🚩 获取到的权限数据:', permissions)

        if (permissions && permissions.length > 0) {
          this.setPermissions(permissions)
        }

        if (!userMenus || userMenus.length === 0) {
          console.warn('⚠️ 未获取到用户菜单数据，使用本地路由')
          this.fallbackToLocalRoutes = true
          return []
        }

        // 预处理用户菜单数据
        const processedUserMenus = this.preprocessMenuTree(userMenus)

        // 将用户菜单转换为前端路由格式
        const dynamicRoutes = this.processUserMenus(processedUserMenus)

        console.log('🚩 从用户菜单生成的路由:', dynamicRoutes)
        this.setRoutes(dynamicRoutes)

        // 添加错误路由
        this.handleErrorRoutes()

        return dynamicRoutes
      } catch (error) {
        console.error('🚨 获取用户菜单数据失败:', error)
        this.fallbackToLocalRoutes = true
        return []
      }
    },

    /**
     * 处理错误路由 - 确保404路由始终在最后
     */
    handleErrorRoutes() {
      errorRoutes.forEach((route) => {
        if (route.name) {
          // 移除已存在的同名路由，避免重复
          try {
            const router = (window as any).$router
            if (router && router.hasRoute && router.hasRoute(route.name)) {
              router.removeRoute(route.name)
            }
          } catch (e) {
            console.error('🚨 移除已存在的错误路由失败:', e)
          }
        }
      })
    },

    /**
     * 处理用户菜单数据
     * 将用户菜单接口返回的数据转换为前端路由格式
     */
    processUserMenus(userMenus: any[]): RouteRecordRaw[] {
      if (!userMenus || !Array.isArray(userMenus)) {
        return []
      }

      // 使用通用的菜单转路由方法
      return transformMenuToRoutes(userMenus)
    },

    /**
     * 加载权限和路由
     * 主方法，供router/permission.ts调用
     */
    async loadPermissions() {
      try {
        // 重置路由处理状态，避免重复路径问题
        resetRouteProcessingState()

        // 加载动态路由
        let routes = []

        // 优先使用菜单树生成路由
        routes = await this.generateRoutesFromMenuTree()

        // 处理错误路由
        this.handleErrorRoutes()

        // 返回加载结果
        return {
          success: true,
          routes: routes
        }
      } catch (error) {
        console.error('🚨 加载权限失败:', error)
        return {
          success: false,
          error: error
        }
      }
    },

    /**
     * 检查权限
     * @param permissionKey 权限标识
     */
    checkPermission(permissionKey: string): boolean {
      if (!permissionKey) return true

      const userStore = useUserStore()

      // 管理员拥有所有权限
      if (userStore.roles.includes('admin')) {
        return true
      }

      // 检查是否有指定权限
      return this.permissions.includes(permissionKey)
    },

    /**
     * 检查角色
     * @param roleKey 角色标识
     */
    checkRole(roleKey: string): boolean {
      if (!roleKey) return true

      const userStore = useUserStore()
      return userStore.roles.includes(roleKey)
    },

    /**
     * 重置权限状态
     */
    resetState() {
      this.routes = []
      this.dynamicRoutes = []
      this.permissions = []
      this.isDynamicRouteAdded = false
      this.isLoadingRoutes = false
      this.fallbackToLocalRoutes = false

      // 重置路由
      resetRouter()
    }
  }
})
