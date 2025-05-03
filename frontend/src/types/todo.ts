/**
 * 待办事项状态枚举
 */
export enum TodoStatus {
  PENDING = 0, // 未完成
  COMPLETED = 1, // 已完成
  CANCELLED = 2 // 已取消
}

/**
 * 待办事项实体
 */
export interface TodoItem {
  id: string
  content: string
  startTime: string
  status: TodoStatus
  createdAt: string
  updatedAt: string
}

/**
 * 待办事项请求响应
 */

export interface TodoResponse {
  code?: number | string
  message?: string
  data?: TodoPaginationResponse
}

/**
 * 创建todo响应参数
 */

export interface CreateTodoResponse {
  code?:  number,
  data: TodoItem,
  message?: string,
  timestamp?: string
}

export interface UpdateTodoResponse {
  code?:  number,
  data: TodoItem,
  message?: string,
  timestamp?: string
}



/**
 * 待办事项分页响应
 */
export interface TodoPaginationResponse {
  list: TodoItem[],
  total: number
  page: number
  pageSize: number
  totalPages: number

}

/**
 * 创建待办事项参数
 */
export interface CreateTodoParams {
  content: string
  startTime: string
}

/**
 * 更新待办事项状态参数
 */
export interface UpdateTodoStatusParams {
  status: TodoStatus
}

/**
 * 查询待办事项参数
 */
export interface QueryTodoParams {
  status?: TodoStatus
  page?: number
  pageSize?: number
}
