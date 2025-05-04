/**
 * 用户相关类型定义
 */

// 用户基础信息
export interface User {
  id?: string
  username?: string
  nickname?: string
  realName?: string
  email?: string
  phone?: string
  gender?: number // 0-未知，1-男，2-女
  avatar?: string
  remark?: string
  status?: number // 0-禁用，1-启用
  deptId?: number
  lastLoginTime?: Date
  createdAt?: Date
  updatedAt?: Date
  roles?: Role[]
}

// 角色信息
export interface Role {
  id: string
  roleName: string
  roleKey: string
  orderNum: number
  status: number // 0-禁用，1-启用
  remark?: string
  dataScope: number // 1-全部，2-自定义，3-本部门，4-本部门及以下，5-仅本人
  parentId?: string
  permissions: Permission[]
}

// 权限信息
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
  remark?: string
  createdAt: Date
  updatedAt: Date
}

// 用户查询参数
export interface UserQueryParams {
  username?: string
  realName?: string
  phone?: string
  email?: string
  status?: number
  deptId?: number
  roleId?: number
  page?: number
  pageSize?: number
  searchKey?: string
  orderBy?: string
  orderType?: 'asc' | 'desc'
}

// 创建用户参数
export interface CreateUserParams {
  username: string
  password: string
  nickname?: string
  realName?: string
  email?: string
  phone?: string
  gender?: number
  avatar?: string
  remark?: string
  status?: number
  deptId?: number
  roleIds?: string[]
}

// 更新用户参数
export interface UpdateUserParams {
  nickname?: string
  realName?: string
  email?: string
  phone?: string
  gender?: number
  avatar?: string
  remark?: string
  status?: number
  deptId?: number
  roleIds?: string[]
}

// 重置密码参数
export interface ResetPasswordParams {
  password: string
}

// 修改密码参数
export interface ChangePasswordParams {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

// API响应类型定义
export interface UserListResponse {
  code?: number
  message?: string
  data: {
    items: User[]
    total: number
    page: number
    pageSize: number
  }
  timestamp?: string
}

export interface UserResponse {
  code?: number
  message?: string
  data: User
  timestamp?: string
}

export interface CreateUserResponse {
  code?: number
  message?: string
  data: User
  timestamp?: string
}

export interface UpdateUserResponse {
  code?: number
  message?: string
  data: User
  timestamp?: string
}

export interface DeleteUserResponse {
  code?: number
  message?: string
  data: null
  timestamp?: string
}

export interface ResetPasswordResponse {
  code?: number
  message?: string
  data: null
  timestamp?: string
}

export interface UpdateUserStatusResponse {
  code?: number
  message?: string
  data: User
  timestamp?: string
}
