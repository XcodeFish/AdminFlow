/**
 * 通用错误类型定义
 */
export interface ApiError {
  message: string
  code?: number
  [key: string]: any
}
