// frontend/src/utils/auth-helper.ts
// 新建文件，用于处理token的自动刷新

import { refreshToken } from '@/api/modules/auth'
import { useUserStore } from '@/store/modules/user'

/**
 * 检查token是否即将过期
 * @param expiryBuffer 过期前缓冲时间（秒），默认为10分钟
 * @returns 是否即将过期
 */
export function isTokenExpiringSoon(expiryBuffer = 10 * 60): boolean {
  const tokenExpiry = localStorage.getItem('token_expiry')
  if (!tokenExpiry) return false

  const expiryTime = parseInt(tokenExpiry)
  const currentTime = Date.now()

  // 如果token将在缓冲时间内过期，返回true
  return expiryTime - currentTime < expiryBuffer * 1000
}

/**
 * 自动刷新token
 */
export async function autoRefreshToken(): Promise<void> {
  const userStore = useUserStore()

  // 如果用户没有登录或没有设置记住我，不进行刷新
  if (!userStore.isLoggedIn || !userStore.rememberMe) {
    return
  }

  // 检查token是否即将过期
  if (isTokenExpiringSoon()) {
    try {
      // 调用刷新token API
      // 注：此处假设后端实现了refresh token的接口，传递当前token
      const response = await refreshToken({ refreshToken: userStore.token! })

      // 更新token
      const newToken = response.data.accessToken
      if (newToken) {
        userStore.setToken(newToken)

        // 更新过期时间
        const expiresIn = response.data.expiresIn
        if (expiresIn) {
          const expiryTime = Date.now() + expiresIn * 1000
          localStorage.setItem('token_expiry', expiryTime.toString())
        }
      }
    } catch (error) {
      console.error('自动刷新token失败:', error)
      // 如果刷新失败，可能是refresh token也过期了，可以选择登出或要求用户重新登录
      // userStore.logoutAction()
    }
  }
}
