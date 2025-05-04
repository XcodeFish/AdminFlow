/**
 * 权限相关类型定义
 */

// 权限基础信息
export interface Permission {
  id: string
  permName: string
  permKey: string
  permType: number // 0-菜单 1-操作 2-数据
  parentId?: string
  orderNum: number
  path?: string
  component?: string
  status: number // 0-禁用 1-正常
  isVisible: number // 0-隐藏 1-显示
  icon?: string
  createdAt?: Date
  updatedAt?: Date
  children?: Permission[]
}

// 创建权限参数
export interface CreatePermissionParams {
  permName: string
  permKey: string
  permType: number
  parentId?: string
  orderNum?: number
  path?: string
  component?: string
  status?: number
  isVisible?: number
  icon?: string
}

// 更新权限参数
export interface UpdatePermissionParams {
  permName?: string
  permKey?: string
  permType?: number
  parentId?: string
  orderNum?: number
  path?: string
  component?: string
  status?: number
  isVisible?: number
  icon?: string
}

// 权限查询参数
export interface PermissionQueryParams {
  permName?: string
  permType?: number
  status?: number
  page?: number
  pageSize?: number
}

// API响应类型定义
export interface PermissionResponse {
  code: number
  message: string
  data: Permission
}

export interface PermissionListResponse {
  code: number
  message: string
  data: Permission[]
}

export interface PermissionPageResponse {
  code: number
  message: string
  data: {
    items: Permission[]
    meta: {
      itemCount: number
      totalPages: number
      currentPage: number
    }
  }
}

export interface PermissionTreeResponse {
  code: number
  message: string
  data: Permission[]
}

export interface AuditLogItem {
  id: string
  operationType: number // 1-角色权限变更 2-用户角色变更
  targetId: string
  targetName: string
  beforeData: any
  afterData: any
  operatorId: string
  operatorName: string
  operatorIp: string
  createdAt: string
}

export interface AuditLogResponse {
  code: number
  message: string
  data: {
    items: AuditLogItem[]
    meta: {
      itemCount: number
      totalPages: number
      currentPage: number
    }
  }
}
