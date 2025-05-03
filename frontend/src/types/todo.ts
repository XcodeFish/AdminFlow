/**
 * 待办事项状态枚举
 */
export enum TodoStatus {
  NOT_STARTED = 0, // 未开始
  IN_PROGRESS = 1, // 进行中
  COMPLETED = 2, // 已完成
  CANCELLED = 3, // 已取消
  EXPIRED = 4 // 已过期
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
 * 待办事项分页响应
 */
export interface TodoPaginationResponse {
  list: TodoItem[]
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
