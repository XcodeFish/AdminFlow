import { Component } from 'vue'

// 使用import.meta.glob预加载所有组件
const modules = import.meta.glob('@/views/**/*.vue')
const dynamicComponentMap: Record<string, () => Promise<Component>> = {}

// 规范化路径
function normalizePath(path: string): string {
  return path.replace(/^@\/views\//, '').replace(/\.vue$/, '')
}

// 填充动态组件映射
Object.keys(modules).forEach((modulePath) => {
  const key = normalizePath(modulePath)
  dynamicComponentMap[key] = modules[modulePath] as () => Promise<Component>
})

export function getDynamicComponent(path: string): () => Promise<Component> | null {
  const normalizedPath = normalizePath(path)
  return dynamicComponentMap[normalizedPath] || null
}
