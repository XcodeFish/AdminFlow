import request from '@/utils/request'
import { mockStats, mockUserGrowth, mockUserDistribution, mockTodoList } from '../mock/dashboard'
import { TodoItemForm } from '@/types/dashboard'

/**
 * 获取仪表盘统计数据
 */
export function getDashboardStats() {
  // 使用模拟数据
  return Promise.resolve({
    code: 200,
    data: mockStats
  })
  // 实际 API 调用（目前注释掉）
  // return request.get<API.Result<DashboardStats>>('/v1/dashboard/stats')
}

/**
 * 获取用户增长趋势
 * @param days 天数
 */
export function getUserGrowthTrend(days: number = 7) {
  // 使用模拟数据
  return Promise.resolve({
    code: 200,
    data: mockUserGrowth.slice(-days)
  })
  // 实际 API 调用（目前注释掉）
  // return request.get<API.Result<UserGrowthData[]>>('/v1/dashboard/user-growth', {
  //   params: { days }
  // })
}

/**
 * 获取用户分布数据
 */
export function getUserDistribution() {
  // 使用模拟数据
  return Promise.resolve({
    code: 200,
    data: mockUserDistribution
  })
  // 实际 API 调用（目前注释掉）
  // return request.get<API.Result<UserDistributionData[]>>('/v1/dashboard/user-distribution')
}

/**
 * 获取待办事项列表
 */
export function getTodoList() {
  // 使用模拟数据
  return Promise.resolve({
    code: 200,
    data: mockTodoList
  })
  // 实际 API 调用（目前注释掉）
  // return request.get<API.Result<TodoItem[]>>('/v1/dashboard/todo-list')
}

/**
 * 更新待办事项状态
 * @param id 待办事项ID
 * @param status 状态
 */
export function updateTodoStatus(id: string, status: number) {
  // 模拟更新（实际上不改变数据）
  return Promise.resolve({
    code: 200,
    data: {
      id,
      status
    }
  })
  // 实际 API 调用（目前注释掉）
  // return request.put<API.Result<TodoItem>>(`/v1/dashboard/todo/${id}/status`, { status })
}

/**
 * 添加待办事项
 * @param data 待办事项数据
 */
export function addTodoItem(data: TodoItemForm) {
  // 模拟添加（实际上不添加数据）
  return Promise.resolve({
    code: 200,
    data: {
      id: Date.now().toString(),
      ...data,
      status: 0,
      createdAt: new Date().toISOString()
    }
  })
  // 实际 API 调用（目前注释掉）
  // return request.post<API.Result<TodoItem>>('/v1/dashboard/todo', data)
}
