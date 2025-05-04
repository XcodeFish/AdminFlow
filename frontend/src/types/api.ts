/**
 * API相关类型定义
 */

// 通用分页响应
export interface PageResult<T> {
  list: T[]
  total: number
  pageNum: number
  pageSize: number
}

// 通用API响应格式
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 登录请求参数
export interface LoginParams {
  username: string
  password: string
}

// 登录响应
export interface LoginResult {
  token: string
  user: {
    id: string
    username: string
    nickname?: string
    avatar?: string
    permissions: string[] // 权限标识列表
  }
}

// 通用响应
export interface CommonResponse {
  code: number
  message: string
  data: any
}
