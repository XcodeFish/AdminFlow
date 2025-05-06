/**
 * 静态组件映射
 * 用于解决Vite动态import路径问题
 */

// 导入组件
import SystemMenu from '@/views/system/menu/index.vue'
import SystemUser from '@/views/system/user/index.vue'
import SystemRole from '@/views/system/role/index.vue'
import SystemDept from '@/views/system/dept/index.vue'
import Profile from '@/views/profile/index.vue'
import Dashboard from '@/views/dashboard/index.vue'
import OperationLog from '@/views/logger/operation/index.vue'
import ApiLog from '@/views/logger/apiLog/index.vue'
import LoggerDashboard from '@/views/logger/dashboard/index.vue'
// 创建完整的静态映射对象
export const StaticComponentMap: Record<string, any> = {
  // 系统管理
  'system/menu/index': SystemMenu,
  'system/menu': SystemMenu,
  'system/user/index': SystemUser,
  'system/user': SystemUser,
  'system/role/index': SystemRole,
  'system/role': SystemRole,
  'system/dept/index': SystemDept,
  'system/dept': SystemDept,

  // 操作日志管理
  'logger/operation/index': OperationLog,
  'logger/operation': OperationLog,

  // API日志管理
  'logger/apiLog/index': ApiLog,
  'logger/apiLog': ApiLog,

  // 日志仪表盘
  'logger/logDashboard/index': LoggerDashboard,
  'logger/logDashboard': LoggerDashboard,

  // 个人中心
  'profile/index': Profile,
  profile: Profile,

  // 仪表盘
  'dashboard/index': Dashboard,
  dashboard: Dashboard
}

export default StaticComponentMap

/**
 * 规范化路径用于查找
 */
export function normalizePath(path: string): string {
  return path
    .replace(/^@\/views\//, '')
    .replace(/\.vue$/, '')
    .replace(/^\//, '')
}
