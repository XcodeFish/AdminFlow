/**
 * 部门相关类型定义
 */

/**
 * 部门状态枚举
 */
export enum DeptStatus {
  DISABLED = 0, // 禁用
  ENABLED = 1 // 启用
}

/**
 * 部门实体
 */
export interface Department {
  id: string
  deptName: string
  parentId: string | null
  ancestors: string
  orderNum: number
  leader: string
  phone: string
  email: string
  status: DeptStatus
  delFlag?: number
  children?: Department[]
  createdAt?: string
  updatedAt?: string
}

/**
 * 创建部门参数
 */
export interface CreateDeptParams {
  deptName: string
  parentId?: string | null
  orderNum?: number
  leader?: string
  phone?: string
  email?: string
  status?: DeptStatus
}

/**
 * 更新部门参数
 */
export interface UpdateDeptParams {
  deptName?: string
  parentId?: string | null
  orderNum?: number
  leader?: string
  phone?: string
  email?: string
  status?: DeptStatus
}

/**
 * 查询部门参数
 */
export interface QueryDeptParams {
  deptName?: string
  status?: DeptStatus
  page?: number
  pageSize?: number
  parentId?: string | null
}

/**
 * 部门树结构
 */
export interface DeptTree {
  id: string
  deptName: string
  parentId: string | null
  ancestors: string
  orderNum: number
  leader: string
  phone: string
  email: string
  status: DeptStatus
  children: DeptTree[]
}

/**
 * 部门响应结果
 */
export interface DeptResponse {
  code?: number
  message?: string
  data: Department
  timestamp?: string
}

/**
 * 部门列表响应结果
 */
export interface DeptListResponse {
  code?: number
  message?: string
  data: {
    items: Department[]
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
  timestamp?: string
}

/**
 * 部门树响应结果
 */
export interface DeptTreeResponse {
  code?: number
  message?: string
  data: DeptTree[]
  timestamp?: string
}

/**
 * 创建部门响应
 */
export interface CreateDeptResponse {
  code?: number
  message?: string
  data: Department
  timestamp?: string
}

/**
 * 更新部门响应
 */
export interface UpdateDeptResponse {
  code?: number
  message?: string
  data: Department
  timestamp?: string
}

/**
 * 删除部门响应
 */
export interface DeleteDeptResponse {
  code?: number
  message?: string
  data: null
  timestamp?: string
}
