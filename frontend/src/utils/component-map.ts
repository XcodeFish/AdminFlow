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
  'system/dept': () => import('@/views/system/dept/index.vue'),

}

const LoggerComponents: ComponentMapType = {
  // 操作日志管理
  'logger/operation/index': () => import('@/views/logger/operation/index.vue'),
  'logger/operation': () => import('@/views/logger/operation/index.vue'),

  // API日志管理
  'logger/apiLog/index': () => import('@/views/logger/apiLog/index.vue'),
  'logger/apiLog': () => import('@/views/logger/apiLog/index.vue'),

  // 日志仪表盘
  'logger/logDashboard/index': () => import('@/views/logger/logDashboard/index.vue'),
  'logger/logDashboard': () => import('@/views/logger/logDashboard/index.vue')
}

// 代码生成器相关页面
const GeneratorComponents: ComponentMapType = {
  // 代码生成器主页
  'generator/index': () => import('@/views/generator/index.vue'),
  generator: () => import('@/views/generator/index.vue'),

  // 数据源管理模块
  'generator/datasource/index': () => import('@/views/generator/datasource/index.vue'),
  'generator/datasource': () => import('@/views/generator/datasource/index.vue'),

  // 表结构管理模块
  'generator/table/index': () => import('@/views/generator/table/index.vue'),
  'generator/table': () => import('@/views/generator/table/index.vue'),

  // 代码生成向导模块
  'generator/wizard/index': () => import('@/views/generator/wizard/index.vue'),
  'generator/wizard': () => import('@/views/generator/wizard/index.vue'),

  // 配置管理模块
  'generator/config/index': () => import('@/views/generator/config/index.vue'),
  'generator/config': () => import('@/views/generator/config/index.vue'),

  // 代码预览模块
  'generator/preview/index': () => import('@/views/generator/preview/index.vue'),
  'generator/preview': () => import('@/views/generator/preview/index.vue'),

  // 版本管理模块
  'generator/version/index': () => import('@/views/generator/version/index.vue'),
  'generator/version': () => import('@/views/generator/version/index.vue')
}

// 个人中心相关
const ProfileComponents: ComponentMapType = {
  'profile/index': () => import('@/views/profile/index.vue'),
  profile: () => import('@/views/profile/index.vue')
}

// 仪表盘相关
const DashboardComponents: ComponentMapType = {
  'logger/dashboard/index': () => import('@/views/dashboard/index.vue'),
  'logger/dashboard': () => import('@/views/dashboard/index.vue')
}

// 组合所有组件映射
export const ComponentMap: ComponentMapType = {
  ...SystemComponents,
  ...ProfileComponents,
  ...DashboardComponents,
  ...GeneratorComponents,
  ...LoggerComponents
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

// export function getComponentByPath(path: string): any {
//   const normalizedPath = normalizeComponentPath(path)

//   // 先检查静态映射
//   if (StaticComponentMap[normalizedPath]) {
//     return StaticComponentMap[normalizedPath]
//   }

//   // 再尝试动态加载
//   const dynamicComponent = getDynamicComponent(normalizedPath)
//   if (dynamicComponent) {
//     console.log(`🔄 动态加载组件: ${normalizedPath}`)
//     return dynamicComponent
//   }

//   // 都找不到，返回404组件
//   console.warn(`⚠️ 组件不存在: ${normalizedPath}`)
//   return NotFoundComponent
// }
