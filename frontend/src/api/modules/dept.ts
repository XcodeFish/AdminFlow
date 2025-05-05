import request from '@/utils/request'
import {
  CreateDeptParams,
  UpdateDeptParams,
  QueryDeptParams,
  DeptResponse,
  DeptListResponse,
  DeptTreeResponse,
  CreateDeptResponse,
  UpdateDeptResponse,
  DeleteDeptResponse
} from '@/types/dept'

/**
 * 获取部门树结构
 * @param status 可选，部门状态（0-禁用，1-启用）
 * @returns 部门树结构
 */
export const getDeptTree = (status?: number) => {
  return request.get<DeptTreeResponse>('/v1/departments/tree', {
    params: { status }
  })
}

/**
 * 获取部门列表
 * @param params 查询参数
 * @returns 部门列表
 */
export const getDeptList = (params?: QueryDeptParams) => {
  return request.get<DeptListResponse>('/v1/departments/list',params)
}

/**
 * 获取部门详情
 * @param id 部门ID
 * @returns 部门详情
 */
export const getDeptDetail = (id: string) => {
  return request.get<DeptResponse>(`/v1/departments/${id}`)
}

/**
 * 创建部门
 * @param data 创建部门参数
 * @returns 创建的部门信息
 */
export const createDept = (data: CreateDeptParams) => {
  return request.post<CreateDeptResponse>('/v1/departments/create', data)
}

/**
 * 更新部门
 * @param id 部门ID
 * @param data 更新部门参数
 * @returns 更新后的部门信息
 */
export const updateDept = (id: string, data: UpdateDeptParams) => {
  return request.put<UpdateDeptResponse>(`/v1/departments/${id}/update`, data)
}

/**
 * 删除部门
 * @param id 部门ID
 * @returns 删除结果
 */
export const deleteDept = (id: string) => {
  return request.del<DeleteDeptResponse>(`/v1/departments/${id}/delete`)
}
