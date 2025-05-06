import { defineStore } from 'pinia'
import { LoginParams } from '@/types/auth'
import { User } from '@/types/user'
import { login, logout } from '@/api/modules/auth'
import { usePermissionStore } from '@/store/modules/permission'

interface UserState {
  token: string | null
  userInfo: User
  isLoggedIn: boolean
  rememberMe: boolean
  roles: string[] // 用户角色key列表
  permissions: string[] // 用户权限列表
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: localStorage.getItem('token') || null,
    userInfo: {},
    isLoggedIn: !!localStorage.getItem('token'),
    rememberMe: localStorage.getItem('remember') === 'true',
    roles: [],
    permissions: []
  }),

  getters: {
    getToken: (state) => state.token,
    getUserInfo: (state) => state.userInfo,
    // 检查角色 - 使用角色key列表
    hasRole: (state) => (role: string) => state.roles.includes(role),
    // 检查权限 - 使用JWT中的permissions
    hasPermission: (state) => (permission: string) => state.permissions.includes(permission),
    // 是否是管理员
    isAdmin: (state) => state.roles.includes('admin'),
    shouldAutoLogin: (state) => state.rememberMe && state.token !== null
  },

  actions: {
    setToken(token: string | null): void {
      this.token = token
      this.isLoggedIn = !!token
      if (token) {
        localStorage.setItem('token', token)
      } else {
        localStorage.removeItem('token')
      }
    },

    updateUserInfo(userInfo: User): void {
      // 合并新的用户信息到现有信息
      this.userInfo = { ...this.userInfo, ...userInfo }
    },

    setRememberMe(value: boolean): void {
      this.rememberMe = value
      if (value) {
        localStorage.setItem('remember', 'true')
      } else {
        localStorage.removeItem('remember')
      }
    },

    clearToken(): void {
      this.token = null
      this.isLoggedIn = false
      localStorage.removeItem('token')
      if (!this.rememberMe) {
        localStorage.removeItem('remember')
      }
    },

    // 登录方法
    async login(loginParams: LoginParams): Promise<void> {
      try {
        const response = await login(loginParams)
        console.log('登录响应数据:', response)
        // 提取token
        const accessToken = response.data.accessToken

        if (!accessToken) {
          throw new Error('登录失败：未获取到token')
        }

        // 设置token
        this.setToken(accessToken)
        this.setRememberMe(loginParams.rememberMe || false)

        // 保存token过期时间，用于自动更新处理
        const expiresIn = response.data.expiresIn
        if (expiresIn) {
          const expiryTime = Date.now() + expiresIn * 1000
          localStorage.setItem('token_expiry', expiryTime.toString())
        }

        // 提取用户信息
        const userInfo = response.data.userInfo
        this.userInfo = userInfo

        // 提取角色和权限信息
        if (userInfo.roles && Array.isArray(userInfo.roles)) {
          this.roles = userInfo.roles.map((role: any) => role.roleKey || role)
        } else {
          // 如果没有角色信息，默认设置一个基础角色，确保可以访问基础页面
          this.roles = ['user']
        }

        // 尝试从JWT中解析权限信息
        if (accessToken) {
          try {
            const base64Url = accessToken.split('.')[1]
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
            const payload = JSON.parse(atob(base64))
            this.permissions = payload.permissions || []

            // 如果没有权限，赋予一个基础权限
            if (this.permissions.length === 0) {
              this.permissions = ['dashboard:view']
            }
          } catch (error) {
            console.error('解析JWT获取权限失败:', error)
            // 默认赋予仪表盘权限，确保可以访问
            this.permissions = ['dashboard:view']
          }
        }

        console.log('登录后的权限和角色:', {
          roles: this.roles,
          permissions: this.permissions
        })
      } catch (error) {
        console.error('登录失败:', error)
        throw error
      }
    },

    async logoutAction(): Promise<void> {
      try {
        // 先重置权限存储 - 在清除用户数据之前重置路由
        const permissionStore = usePermissionStore()
        console.log('🚩 登出前的isDynamicRouteAdded状态:', permissionStore.isDynamicRouteAdded)

        // 先执行路由重置
        permissionStore.resetState()

        // 确保isDynamicRouteAdded状态被重置
        permissionStore.setDynamicRouteAdded(false)

        // 然后尝试调用登出接口
        try {
          await logout()
        } catch (error) {
          console.error('登出接口调用失败:', error)
          // 即使接口调用失败，也继续执行登出流程
        }

        // 清除用户数据
        this.clearToken()
        this.userInfo = {}
        this.roles = []
        this.permissions = []

        // 清除token过期时间
        localStorage.removeItem('token_expiry')

        // 如果用户没有选择记住我，也清除rememberMe状态
        if (!this.rememberMe) {
          localStorage.removeItem('remember')
          this.rememberMe = false
        }

        // 清除localStorage中的状态数据
        localStorage.removeItem('user-store')
        localStorage.removeItem('permission-store')

        console.log('🚩 用户已完全登出，路由和权限状态已重置')
      } catch (error) {
        console.error('🚨 登出操作发生错误:', error)
        throw error
      }
    },

    /**
     * 检查并执行自动登录
     * @returns 是否已执行自动登录
     */
    checkAutoLogin(): boolean {
      // 已经从持久化存储中恢复了状态，不需要再次解析JWT
      if (this.token && Object.keys(this.userInfo).length > 0 && this.roles.length > 0) {
        return true
      }

      // 只有在有token但没有其他信息时才尝试解析JWT
      if (this.token) {
        try {
          const base64Url = this.token.split('.')[1]
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
          const payload = JSON.parse(atob(base64))

          // 如果jwt中有用户信息，则使用
          if (payload.user) {
            this.userInfo = payload.user
          }

          // 如果没有用户信息但有其他必要信息，设置默认值
          if (Object.keys(this.userInfo).length === 0) {
            this.userInfo = { username: 'user', nickname: '用户' }
          }

          // 获取权限和角色
          this.permissions = payload.permissions || ['dashboard:view']
          this.roles = payload.roles || ['user']

          return true
        } catch (error) {
          console.error('解析JWT获取信息失败:', error)
          // 解析失败但不要立即清除token，设置默认值
          if (Object.keys(this.userInfo).length === 0) {
            this.userInfo = { username: 'user', nickname: '用户' }
          }
          if (this.roles.length === 0) {
            this.roles = ['user']
          }
          if (this.permissions.length === 0) {
            this.permissions = ['dashboard:view']
          }
          return true
        }
      }

      return false
    }
  },
  // 添加持久化配置
  persist: {
    key: 'user-store',
    storage: localStorage
  }
})
