/**
 * 日志管理相关类型定义
 */

import { PageResult, ApiResponse } from './api'

// 操作日志类型
export enum OperationType {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  INSERT = 'INSERT',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
  OTHER = 'OTHER'
}

// 操作日志实体
export interface OperationLog {
  id: number
  username: string
  nickname: string
  operationType: string
  operationName: string
  module: string
  content: string
  requestParams?: any
  responseResult?: any
  ip: string
  location: string
  userAgent: string
  requestMethod: string
  requestUrl: string
  status: number // 1-成功，0-失败
  errorMessage?: string
  operationTime: string
  duration: number // 毫秒
  createTime?: string
  createBy?: string
  updateTime?: string
  updateBy?: string
}

// 操作日志查询参数
export interface OperationLogQueryParams {
  page?: number
  pageSize?: number
  startTime?: string
  endTime?: string
  username?: string
  operationType?: string
  module?: string
  status?: number
}

// 接口日志错误级别
export enum ErrorLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

// 接口日志实体
export interface ApiLog {
  id: number
  traceId: string
  requestUrl: string
  requestMethod: string
  requestIp: string
  userAgent?: string
  userId?: number
  username?: string
  requestHeaders?: any
  requestParams?: any
  responseHeaders?: any
  responseBody?: any
  status: number
  errorLevel: string
  errorMessage?: string
  stackTrace?: string
  duration: number // 毫秒
  requestTime: string
  responseTime: string
  createTime?: string
  createBy?: string
  updateTime?: string
  updateBy?: string
}

// 接口日志查询参数
export interface ApiLogQueryParams {
  page?: number
  pageSize?: number
  startTime?: string
  endTime?: string
  requestUrl?: string
  requestMethod?: string
  status?: number
  errorLevel?: string
  minDuration?: number
}

// 删除日志参数
export interface DeleteLogsParams {
  ids: number[]
}

// 操作日志统计数据
export interface OperationLogStats {
  operationTypesCount: Record<string, number>
  operationStatusCount: {
    success: number
    fail: number
  }
  topModules: Array<{
    name: string
    count: number
  }>
  topUsers: Array<{
    username: string
    count: number
  }>
  timeDistribution: Array<{
    time: string
    count: number
  }>
}

// 接口日志统计数据
export interface ApiLogStats {
  methodCount: Record<string, number>
  statusCount: Record<string, number>
  topSlowApis: Array<{
    url: string
    method: string
    avgDuration: number
    count: number
  }>
  topErrorApis: Array<{
    url: string
    method: string
    errorCount: number
    totalCount: number
  }>
  timeDistribution: Array<{
    time: string
    count: number
    avgDuration: number
  }>
}

// API响应类型
export interface OperationLogListResponse extends ApiResponse<PageResult<OperationLog>> {}
export interface OperationLogResponse extends ApiResponse<OperationLog> {}
export interface ApiLogListResponse extends ApiResponse<PageResult<ApiLog>> {}
export interface ApiLogResponse extends ApiResponse<ApiLog> {}
export interface DeleteLogsResponse extends ApiResponse<{ deletedCount: number }> {}
export interface OperationLogStatsResponse extends ApiResponse<OperationLogStats> {}
export interface ApiLogStatsResponse extends ApiResponse<ApiLogStats> {}
