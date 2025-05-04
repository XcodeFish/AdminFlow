import request from '@/utils/request'
import {
  CreateRoleParams,
  UpdateRoleParams,
  AssignRolePermissionsParams,
  RoleQueryParams,
  RoleListResponse,
  RoleResponse,
  RoleTreeResponse,
  AssignRolePermissionsResponse,
  RolePermissionsResponse
} from '@/types/role'

/**
 * 创建角色
 * @param data 角色数据
 */
export const createRole = (data: CreateRoleParams) => {
  return request.post<RoleResponse>('/v1/permission/roles', data)
}

/**
 * 更新角色
 * @param id 角色ID
 * @param data 更新数据
 */
export const updateRole = (id: string, data: UpdateRoleParams) => {
  return request.put<RoleResponse>(`/v1/permission/roles/${id}`, data)
}

/**
 * 删除角色
 * @param id 角色ID
 */
export const deleteRole = (id: string) => {
  return request.del<{ code: number; message: string; data: null }>(`/v1/permission/roles/${id}`)
}

/**
 * 获取角色列表
 */
export const getRoleList = () => {
  return request.get<RoleListResponse>('/v1/permission/roles')
}

/**
 * 获取角色详情
 * @param id 角色ID
 */
export const getRoleById = (id: string) => {
  return request.get<RoleResponse>(`/v1/permission/roles/${id}`)
}

/**
 * 分配角色权限
 * @param roleId 角色ID
 * @param data 权限标识列表
 */
export const assignRolePermissions = (roleId: string, data: AssignRolePermissionsParams) => {
  return request.put<AssignRolePermissionsResponse>(`/v1/permission/roles/${roleId}/permissions`, data)
}

/**
 * 获取角色权限列表
 * @param roleId 角色ID
 */
export const getRolePermissions = (roleId: string) => {
  return request.get<RolePermissionsResponse>(`/v1/permission/roles/${roleId}/permissions`)
}

/**
 * 获取角色树
 */
export const getRoleTree = () => {
  return request.get<RoleTreeResponse>('/v1/permission/roles/tree')
}

/**
 * 添加子角色
 * @param parentId 父角色ID
 * @param data 角色数据
 */
export const addChildRole = (parentId: string, data: CreateRoleParams) => {
  return request.post<RoleResponse>(`/v1/permission/roles/${parentId}/children`, data)
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
  return request.get('/v1/permission/audit-logs', params)
}

/**
 * 为用户分配角色
 * @param userId 用户ID
 * @param roleIds 角色ID数组
 */
export const assignUserRoles = (userId: string, roleIds: string[]) => {
  return request.put(`/v1/permission/users/${userId}/roles`, { roleIds })
}

/**
 * 获取用户角色列表
 * @param userId 用户ID
 */
export const getUserRoles = (userId: string) => {
  return request.get(`/v1/permission/users/${userId}/roles`)
}
