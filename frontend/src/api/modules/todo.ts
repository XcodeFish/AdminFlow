import request from '@/utils/request'
import {
  TodoItem,
  TodoPaginationResponse,
  CreateTodoParams,
  UpdateTodoStatusParams,
  QueryTodoParams
} from '@/types/todo'

/**
 * 创建待办事项
 * @param data todo数据
 * @returns
 */

export const createTodo = (data: CreateTodoParams) => {
  return request.post<TodoItem>('/v1/todo/create', data)
}

/**
 * 获取待办事项列表
 * @param params 查询参数
 * @returns
 */

export const getTodoList = (params?: QueryTodoParams) => {
  return request.get<TodoPaginationResponse>('/v1/todo/list', { params })
}

/**
 * 更新待办事项状态
 * @param id 待办事项id
 * @param data 更新数据
 */
export const updateTodoStatus = (id: string, data: UpdateTodoStatusParams) => {
  return request.put<TodoItem>(`/v1/todo/${id}/update`, data)
}

/**
 * 删除待办事项
 * @param id 待办事项id
 */
export const deleteTodo = (id: string) => {
  return request.del<TodoItem>(`/v1/todo/${id}/delete`)
}
