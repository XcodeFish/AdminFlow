import request from '@/utils/request'
import {
  CreatePermissionParams,
  UpdatePermissionParams,
  PermissionQueryParams,
  PermissionResponse,
  PermissionListResponse,
  PermissionPageResponse,
  PermissionTreeResponse,
  AuditLogResponse
} from '@/types/permission'

/**
 * 创建权限
 * @param data 权限数据
 */
export const createPermission = (data: CreatePermissionParams) => {
  return request.post<PermissionResponse>('/v1/permission', data)
}

/**
 * 更新权限
 * @param id 权限ID
 * @param data 更新数据
 */
export const updatePermission = (id: string, data: UpdatePermissionParams) => {
  return request.put<PermissionResponse>(`/v1/permission/${id}`, data)
}

/**
 * 删除权限
 * @param id 权限ID
 */
export const deletePermission = (id: string) => {
  return request.del<{ code: number; message: string; data: null }>(`/v1/permission/${id}`)
}

/**
 * 获取权限列表（带条件筛选）
 * @param params 筛选参数
 */
export const getPermissionList = (params?: PermissionQueryParams) => {
  return request.get<PermissionListResponse>('/v1/permission/perms', params)
}

/**
 * 分页查询权限列表
 * @param page 页码
 * @param take 每页条数
 */
export const getPermissionsByPage = (page = 1, take = 10) => {
  return request.get<PermissionPageResponse>('/v1/permission', { page, take })
}

/**
 * 获取权限详情
 * @param id 权限ID
 */
export const getPermissionById = (id: string) => {
  return request.get<PermissionResponse>(`/v1/permission/${id}`)
}

/**
 * 获取权限树
 */
export const getPermissionTree = () => {
  return request.get<PermissionTreeResponse>('/v1/permission/tree')
}

/**
 * 清除所有权限缓存（仅管理员使用）
 */
export const clearAllPermissionCache = () => {
  return request.del<{ code: number; message: string; data: null }>('/v1/permission/cache/all')
}

/**
 * 清除指定用户权限缓存
 * @param userId 用户ID
 */
export const clearUserPermissionCache = (userId: string) => {
  return request.del<{ code: number; message: string; data: null }>(
    `/v1/permission/cache/users/${userId}`
  )
}

/**
 * 获取权限审计日志
 * @param params 查询参数
 */
export const getPermissionAuditLogs = (params?: {
  operationType?: number
  targetId?: string
  startTime?: Date
  endTime?: Date
  page?: number
  limit?: number
}) => {
  return request.get<AuditLogResponse>('/v1/permission/audit-logs', params)
}

/**
 * 获取用户权限列表
 * @param userId 用户ID
 */
export const getUserPermissions = (userId: string) => {
  return request.get<PermissionListResponse>(`/v1/permission/users/${userId}/permissions`)
}
