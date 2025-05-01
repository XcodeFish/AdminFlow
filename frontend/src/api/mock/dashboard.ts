import { DashboardStats, UserGrowthData, UserDistributionData, TodoItem } from '@/types/dashboard'

// 统计数据
export const mockStats: DashboardStats = {
  totalUsers: 5821,
  todayActive: 432,
  totalOrders: 12456,
  totalRevenue: 254980
}

// 用户增长趋势
export const mockUserGrowth: UserGrowthData[] = [
  { date: '2024-04-01', count: 120 },
  { date: '2024-04-02', count: 132 },
  { date: '2024-04-03', count: 101 },
  { date: '2024-04-04', count: 134 },
  { date: '2024-04-05', count: 156 },
  { date: '2024-04-06', count: 140 },
  { date: '2024-04-07', count: 158 }
]

// 用户分布
export const mockUserDistribution: UserDistributionData[] = [
  { type: '企业用户', value: 1250, percentage: 25 },
  { type: '个人用户', value: 3210, percentage: 55 },
  { type: 'VIP用户', value: 860, percentage: 15 },
  { type: '试用用户', value: 501, percentage: 5 }
]

// 待办事项
export const mockTodoList: TodoItem[] = [
  {
    id: '1',
    content: '完成后台管理系统初稿',
    deadline: '2024-04-10 14:00:00',
    status: 1,
    createdAt: '2024-04-01 10:00:00'
  },
  {
    id: '2',
    content: '召开产品评审会议',
    deadline: '2024-04-12 10:00:00',
    status: 0,
    createdAt: '2024-04-02 09:30:00'
  },
  {
    id: '3',
    content: '修复用户管理模块Bug',
    deadline: '2024-04-11 18:00:00',
    status: 0,
    createdAt: '2024-04-03 14:20:00'
  },
  {
    id: '4',
    content: '完成数据统计功能',
    deadline: '2024-04-15 16:00:00',
    status: 0,
    createdAt: '2024-04-05 11:00:00'
  },
  {
    id: '5',
    content: '产品发布准备',
    deadline: '2024-04-20 09:00:00',
    status: 2,
    createdAt: '2024-04-05 16:30:00'
  }
]
