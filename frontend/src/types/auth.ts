import { User } from './user'
import { ApiResponse } from './api'

export interface LoginParams {
  username: string
  password: string
  rememberMe?: boolean
}

export interface LoginResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
  userInfo: User
}

export interface RefreshTokenParams {
  refreshToken: string
}

export interface RefreshTokenResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
  refreshToken: string
}

// API 响应类型定义
export type LoginApiResponse = ApiResponse<LoginResponse>
export type RefreshTokenApiResponse = ApiResponse<RefreshTokenResponse>
export type LogoutApiResponse = ApiResponse<null>
