const viewComponents = import.meta.glob('@/views/**/*.vue')

// 在开发环境中验证组件是否存在
export function validateComponent(componentPath: string): boolean {
  if (!componentPath) return false

  const normalizedPath = componentPath.replace(/^@\/views\//, '').replace(/\.vue$/, '')
  const fullPath = `/src/views/${normalizedPath}.vue`

  return Object.keys(viewComponents).some((path) => path.endsWith(fullPath))
}
