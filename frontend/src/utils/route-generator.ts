/**
 * 路由生成工具 - 将后端菜单数据转换为Vue Router路由配置
 */
import type { RouteRecordRaw } from 'vue-router'
import type { MenuTreeNode } from '@/types/menu'
import { Layout, EmptyLayout, IFrameLayout } from '@/utils/import-layout'
import { getComponentByPath } from '@/utils/component-map'

// 预定义布局组件映射
const LayoutMap: Record<string, any> = {
  Layout: Layout,
  ParentView: Layout,
  EmptyLayout: EmptyLayout,
  IFrameLayout: IFrameLayout
}

// 已处理过的路由路径集合，用于防止重复处理
const processedPaths = new Set<string>()

/**
 * 将组件路径解析为实际组件
 * @param component 组件路径
 * @returns 异步组件
 */
export const resolveComponent = (component: string | null): any => {
  if (!component) {
    // 默认返回布局组件
    console.log('🚩 未提供组件路径，使用默认布局组件')
    return Layout
  }

  // 1. 检查是否为布局组件
  if (LayoutMap[component]) {
    console.log(`🚩 使用布局组件: ${component}`)
    return LayoutMap[component]
  }

  // 2. 处理外部链接
  if (component.startsWith('http://') || component.startsWith('https://')) {
    console.log(`🚩 检测到外部链接: ${component}，使用IFrame布局`)
    return IFrameLayout
  }

  // 3. 从组件映射中获取组件
  try {
    console.log(`🚩 尝试加载组件: ${component}`)
    return getComponentByPath(component, Layout)
  } catch (error) {
    console.error('🚨 组件路径解析错误:', component, error)
    return Layout
  }
}

/**
 * 生成路由名称 - 确保唯一性和有效性
 * @param menuName 菜单名称
 * @param id 菜单ID
 * @returns 处理后的路由名称
 */
export const generateRouteName = (menuName: string, id: string): string => {
  if (!menuName) return `Menu_${id || Date.now().toString(36)}`

  // 移除空格和特殊字符，确保首字母大写
  return menuName
    .replace(/[^\w\s\u4e00-\u9fa5]/gi, '') // 保留中文、字母、数字和下划线
    .replace(/\s+/g, '')
    .replace(/^./, (str) => str.toUpperCase())
}

/**
 * 重置路由处理状态
 * 在重新生成路由前调用，清除已处理路径记录
 */
export const resetRouteProcessingState = (): void => {
  processedPaths.clear()
  console.log('🚩 已重置路由处理状态')
}

/**
 * 将菜单树转换为路由配置
 * @param menus 菜单树数据
 * @returns 路由配置数组
 */
export const transformMenuToRoutes = (menus: MenuTreeNode[]): RouteRecordRaw[] => {
  const routes: RouteRecordRaw[] = []
  console.log('🚩 开始转换菜单到路由，菜单数量:', menus.length)

  menus.forEach((menu) => {
    try {
      // 跳过无效菜单或按钮类型
      if (!menu || menu.menuType === 'F') {
        return
      }

      // 构建路径
      const routePath = menu.path || `/${menu.id}`

      // 防止重复处理相同路径，避免无限循环
      if (processedPaths.has(routePath)) {
        console.warn(`⚠️ 检测到重复路径，跳过处理: ${routePath}`)
        return
      }
      processedPaths.add(routePath)

      // 构建路由对象
      const route: RouteRecordRaw = {
        path: routePath,
        name: generateRouteName(menu.menuName, menu.id),
        component: resolveComponent(menu.menuType === 'M' ? 'Layout' : menu.component),
        meta: {
          title: menu.menuName,
          icon: menu.icon,
          // 如果是目录类型，总是显示（即使只有一个子菜单）
          alwaysShow: menu.menuType === 'M',
          // 默认路由需要认证
          requiresAuth: true
        }
      }

      // 处理子路由
      if (menu.children && menu.children.length > 0) {
        // 过滤掉按钮类型，只保留目录和菜单类型
        const validChildren = menu.children.filter((child) => child.menuType !== 'F')

        if (validChildren.length > 0) {
          route.children = transformMenuToRoutes(validChildren)

          // 如果是目录并且有子路由，将第一个子路由设为重定向目标
          if (menu.menuType === 'M' && route.children.length > 0) {
            route.redirect = route.children[0].path
            console.log(`🚩 目录 ${menu.menuName} 设置重定向到:`, route.children[0].path)
          }
        }
      }

      console.log(`🚩 生成路由: ${route.path} (${route.name})`, route)
      routes.push(route)
    } catch (error) {
      console.error('🚨 处理菜单时出错:', error, menu)
    }
  })

  console.log('🚩 菜单转换完成，生成路由数量:', routes.length)
  return routes
}
