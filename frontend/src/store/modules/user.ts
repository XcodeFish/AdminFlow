// frontend/src/store/modules/user.ts
import { defineStore } from 'pinia'
import { UserInfo, LoginParams, LoginResponse } from '@/types/auth'
import request from '@/utils/request'
import { login } from '@/api/modules/auth'

interface UserState {
  token: string | null
  userInfo: UserInfo
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
        console.log('登录成功', response)

        // 设置token
        this.setToken(response.data.accessToken)
        this.setRememberMe(loginParams.rememberMe || false)

        // 设置用户信息
        this.userInfo = response.data.userInfo

        // 提取角色和权限信息
        this.roles = response.data.userInfo.roles?.map((role: any) => role.roleKey) || []

        // 尝试从JWT中解析权限信息
        if (response.data.accessToken) {
          try {
            const base64Url = response.data.accessToken.split('.')[1]
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
            const payload = JSON.parse(atob(base64))
            this.permissions = payload.permissions || []
          } catch (error) {
            console.error('解析JWT获取权限失败:', error)
            this.permissions = []
          }
        }
      } catch (error) {
        console.error('登录失败:', error)
        throw error
      }
    },

    async logoutAction(): Promise<void> {
      try {
        await request.post('/auth/logout')
      } finally {
        this.clearToken()
        this.userInfo = {}
        this.roles = []
        this.permissions = []
      }
    },

    /**
     * 检查并执行自动登录
     * @returns 是否已执行自动登录
     */
    checkAutoLogin(): boolean {
      if (this.shouldAutoLogin) {
        // 如果有token，解析JWT获取权限信息
        if (this.token) {
          try {
            const base64Url = this.token.split('.')[1]
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
            const payload = JSON.parse(atob(base64))
            this.permissions = payload.permissions || []
            this.roles = payload.roles || []
          } catch (error) {
            console.error('解析JWT获取权限失败:', error)
            this.clearToken()
            return false
          }
        }
        return true
      }
      return false
    }
  }
})
