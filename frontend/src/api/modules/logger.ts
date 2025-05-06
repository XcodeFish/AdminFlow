import request from '@/utils/request'
import {
  OperationLogQueryParams,
  ApiLogQueryParams,
  DeleteLogsParams,
  OperationLogListResponse,
  OperationLogResponse,
  ApiLogListResponse,
  ApiLogResponse,
  DeleteLogsResponse,
  OperationLogStatsResponse,
  ApiLogStatsResponse
} from '@/types/logger'
import { ApiResponse } from '@/types/api'

/**
 * 获取操作日志列表
 * @param params 查询参数
 */
export const getOperationLogList = (params?: OperationLogQueryParams) => {
  return request.get<OperationLogListResponse>('/v1/logger/operation/list', { params })
}

/**
 * 获取操作日志详情
 * @param id 日志ID
 */
export const getOperationLogDetail = (id: number) => {
  return request.get<OperationLogResponse>(`/v1/logger/operation/${id}`)
}

/**
 * 删除操作日志
 * @param data 日志ID数组
 */
export const deleteOperationLogs = (data: DeleteLogsParams) => {
  return request.del<DeleteLogsResponse>('/v1/logger/operation', { data })
}

/**
 * 清空操作日志
 */
export const cleanOperationLogs = () => {
  return request.del<ApiResponse<null>>('/v1/logger/operation/clean')
}

/**
 * 导出操作日志
 * @param params 查询参数
 */
export const exportOperationLogs = (params?: OperationLogQueryParams) => {
  return request.get('/v1/logger/operation/export', {
    params,
    responseType: 'blob'
  })
}

/**
 * 获取接口日志列表
 * @param params 查询参数
 */
export const getApiLogList = (params?: ApiLogQueryParams) => {
  return request.get<ApiLogListResponse>('/v1/logger/api/list', { params })
}

/**
 * 获取接口日志详情
 * @param id 日志ID
 */
export const getApiLogDetail = (id: number) => {
  return request.get<ApiLogResponse>(`/v1/logger/api/${id}`)
}

/**
 * 删除接口日志
 * @param data 日志ID数组
 */
export const deleteApiLogs = (data: DeleteLogsParams) => {
  return request.del<DeleteLogsResponse>('/v1/logger/api', { data })
}

/**
 * 清空接口日志
 */
export const cleanApiLogs = () => {
  return request.del<ApiResponse<null>>('/v1/logger/api/clean')
}

/**
 * 导出接口日志
 * @param params 查询参数
 */
export const exportApiLogs = (params?: ApiLogQueryParams) => {
  return request.get('/v1/logger/api/export', {
    params,
    responseType: 'blob'
  })
}

/**
 * 获取操作日志统计数据
 * @param params 查询参数
 */
export const getOperationLogStats = (params: {
  startTime: string
  endTime: string
  timeGranularity?: string
}) => {
  return request.get<OperationLogStatsResponse>('/v1/logger/dashboard/operation-stats', { params })
}

/**
 * 获取接口日志统计数据
 * @param params 查询参数
 */
export const getApiLogStats = (params: {
  startTime: string
  endTime: string
  timeGranularity?: string
}) => {
  return request.get<ApiLogStatsResponse>('/v1/logger/dashboard/api-stats', { params })
}
