/**
 * 角色相关类型定义
 */

// 角色基础信息
export interface Role {
  id: string
  roleName: string
  roleKey: string
  dataScope: number // 1-全部 2-自定义 3-本部门 4-部门及以下 5-仅本人
  parentId?: string
  orderNum: number
  status: number // 0-禁用 1-正常
  remark?: string
  createdAt?: Date
  updatedAt?: Date
  permissions?: Permission[]
}

// 创建角色参数
export interface CreateRoleParams {
  roleName: string
  roleKey: string
  dataScope?: number
  parentId?: string
  orderNum?: number
  status?: number
  remark?: string
}

// 更新角色参数
export interface UpdateRoleParams {
  roleName?: string
  roleKey?: string
  dataScope?: number
  parentId?: string
  orderNum?: number
  status?: number
  remark?: string
}

// 角色权限分配参数
export interface AssignRolePermissionsParams {
  permKeys: string[]
}

// 用户角色分配参数
export interface AssignUserRolesParams {
  roleIds: string[]
}

// 角色查询参数
export interface RoleQueryParams {
  roleName?: string
  roleKey?: string
  status?: number
  page?: number
  pageSize?: number
}

// API响应类型定义
export interface RoleListResponse {
  code: number
  message: string
  data: Role[]
}

export interface RoleResponse {
  code: number
  message: string
  data: Role
}

export interface RoleTreeResponse {
  code: number
  message: string
  data: RoleTreeNode[]
}

export interface RoleTreeNode {
  id: string
  label: string
  value: string
  roleKey: string
  status: number
  dataScope: number
  orderNum: number
  remark?: string
  children?: RoleTreeNode[]
}

export interface AssignRolePermissionsResponse {
  code: number
  message: string
  data: null
}

export interface RolePermissionsResponse {
  code: number
  message: string
  data: Permission[]
}

// 引用权限类型，可能需要从permission.ts导入
import { Permission } from './permission'
