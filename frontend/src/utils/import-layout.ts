/**
 * 布局组件导入工具
 * 统一管理布局组件的导入，便于维护和切换
 */

// 导出主布局组件
export const Layout = () => import('@/layout/index.vue')

// 导出空布局组件（用于特殊情况，如多级菜单布局）
export const EmptyLayout = () => import('@/layout/empty.vue')

// 导出嵌套布局组件（可用于iframe或内容嵌套）
export const IFrameLayout = () => import('@/layout/iframe.vue')

/**
 * 根据类型获取布局组件
 * @param type 布局类型
 */
export const getLayoutByType = (type: string) => {
  switch (type) {
    case 'empty':
      return EmptyLayout
    case 'iframe':
      return IFrameLayout
    case 'layout':
    default:
      return Layout
  }
}
