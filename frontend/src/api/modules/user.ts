import request from '@/utils/request'
import {
  CreateUserParams,
  UpdateUserParams,
  UserQueryParams,
  ResetPasswordParams,
  UserListResponse,
  UserResponse,
  CreateUserResponse,
  UpdateUserResponse,
  DeleteUserResponse,
  ResetPasswordResponse,
  UpdateUserStatusResponse
} from '@/types/user'

/**
 * 创建用户
 * @param data 用户数据
 */
export const createUser = (data: CreateUserParams) => {
  return request.post<CreateUserResponse>('/v1/users/create', data)
}

/**
 * 获取用户列表
 * @param params 查询参数
 */
export const getUserList = (params?: UserQueryParams) => {
  return request.get<UserListResponse>('/v1/users/list', { params })
}

/**
 * 根据ID获取用户
 * @param id 用户ID
 */
export const getUserById = (id: string) => {
  return request.get<UserResponse>(`/v1/users/${id}`)
}

/**
 * 更新用户信息
 * @param id 用户ID
 * @param data 更新数据
 */
export const updateUser = (id: string, data: UpdateUserParams) => {
  return request.put<UpdateUserResponse>(`/v1/users/${id}`, data)
}

/**
 * 删除用户
 * @param id 用户ID
 */
export const deleteUser = (id: string) => {
  return request.del<DeleteUserResponse>(`/v1/users/${id}`)
}

/**
 * 重置用户密码
 * @param id 用户ID
 * @param data 密码数据
 */
export const resetUserPassword = (id: string, data: ResetPasswordParams) => {
  return request.post<ResetPasswordResponse>(`/v1/users/${id}/reset-password`, data)
}

/**
 * 更新用户状态
 * @param id 用户ID
 * @param status 状态值 (0-禁用，1-启用)
 */
export const updateUserStatus = (id: string, status: number) => {
  return request.put<UpdateUserStatusResponse>(`/v1/users/${id}/status`, { status })
}
