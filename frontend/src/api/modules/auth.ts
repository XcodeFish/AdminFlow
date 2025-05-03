// frontend/src/api/modules/auth.ts
import request from '@/utils/request'
import {
  LoginParams,
  RefreshTokenParams,
  LoginApiResponse,
  RefreshTokenApiResponse,
  LogoutApiResponse
} from '@/types/auth'

/**
 * 用户登录
 * @param data 登录参数
 */
export function login(data: LoginParams) {
  return request.post<LoginApiResponse>('/v1/auth/login', data)
}

/**
 * 刷新访问令牌
 * @param data 刷新令牌参数
 */
export function refreshToken(data: RefreshTokenParams) {
  return request.post<RefreshTokenApiResponse>('/v1/auth/refresh-token', data)
}

/**
 * 退出登录
 */
export function logout() {
  return request.post<LogoutApiResponse>('/v1/auth/logout')
}

/**
 * 获取验证码（如果项目需要）
 */
export function getCaptcha() {
  return request.get('/v1/auth/captcha')
}

/**
 * 获取用户信息
 * @param id 用户ID
 */
export function getUserInfo(id: string) {
  return request.get(`/v1/users/${id}`)
}
