/**
 * 组件映射工具
 * 解决Vite中动态导入的问题，提供静态导入映射
 */

// 定义组件函数类型
type ComponentImport = () => Promise<any>
// 定义组件映射类型
type ComponentMapType = Record<string, ComponentImport>

// 系统相关页面
const SystemComponents: ComponentMapType = {
  // 菜单管理
  'system/menu/index': () => import('@/views/system/menu/index.vue'),
  'system/menu': () => import('@/views/system/menu/index.vue'),

  // 用户管理
  'system/user/index': () => import('@/views/system/user/index.vue'),
  'system/user': () => import('@/views/system/user/index.vue'),

  // 角色管理
  'system/role/index': () => import('@/views/system/role/index.vue'),
  'system/role': () => import('@/views/system/role/index.vue'),

  // 部门管理
  'system/dept/index': () => import('@/views/system/dept/index.vue'),
  'system/dept': () => import('@/views/system/dept/index.vue')
}

// 个人中心相关
const ProfileComponents: ComponentMapType = {
  'profile/index': () => import('@/views/profile/index.vue'),
  profile: () => import('@/views/profile/index.vue')
}

// 仪表盘相关
const DashboardComponents: ComponentMapType = {
  'dashboard/index': () => import('@/views/dashboard/index.vue'),
  dashboard: () => import('@/views/dashboard/index.vue')
}

// 组合所有组件映射
export const ComponentMap: ComponentMapType = {
  ...SystemComponents,
  ...ProfileComponents,
  ...DashboardComponents
}

/**
 * 规范化组件路径，以便在映射中查找
 * @param path 组件路径
 */
export function normalizeComponentPath(path: string): string {
  // 移除开头的@/views/
  let normalized = path.replace(/^@\/views\//, '')

  // 移除.vue后缀
  normalized = normalized.replace(/\.vue$/, '')

  // 移除开头的/
  normalized = normalized.replace(/^\//, '')

  return normalized
}

/**
 * 通过路径获取组件
 * @param path 组件路径
 * @param defaultComponent 默认组件（如果映射中找不到）
 */
export function getComponentByPath(path: string | null, defaultComponent: any): any {
  if (!path) return defaultComponent

  const normalizedPath = normalizeComponentPath(path)

  // 解决类型错误，使用安全的属性访问
  if (Object.prototype.hasOwnProperty.call(ComponentMap, normalizedPath)) {
    return ComponentMap[normalizedPath]
  }

  // 在开发环境中添加警告
  if (import.meta.env.DEV) {
    console.warn(`⚠️ 警告：组件路径 '${path}' (规范化后: '${normalizedPath}') 未在组件映射中定义。`)
    console.warn('请将该组件添加到 src/utils/component-map.ts 文件中。')
  }

  return defaultComponent
}
