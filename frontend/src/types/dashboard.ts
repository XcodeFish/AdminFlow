/**
 * 仪表盘相关类型定义
 */

// 仪表盘统计数据
export interface DashboardStats {
  // 总用户数
  totalUsers: number
  // 今日活跃
  todayActive: number
  // 订单总量
  totalOrders: number
  // 营收总额
  totalRevenue: number
}

// 用户增长数据
export interface UserGrowthData {
  // 日期
  date: string
  // 用户数量
  count: number
}

// 用户分布数据
export interface UserDistributionData {
  // 用户类型
  type: string
  // 用户数量
  value: number
  // 百分比
  percentage: number
}

// 待办事项
export interface TodoItem {
  // ID
  id: string
  // 内容
  content: string
  // 截止时间
  deadline: string
  // 状态: 0-进行中, 1-已完成, 2-已取消
  status: number
  // 创建时间
  createdAt: string
}

// 待办事项表单
export interface TodoItemForm {
  // 内容
  content: string
  // 截止时间
  deadline: string
}
