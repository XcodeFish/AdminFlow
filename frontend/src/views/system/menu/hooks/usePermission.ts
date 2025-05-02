import { useUserStore } from '@/store/modules/user'

export function usePermission() {
  const userStore = useUserStore()

  /**
   * 检查当前用户是否有指定权限
   * @param permission 权限标识
   * @returns 是否拥有权限
   */
  const hasPermission = (permission: string): boolean => {
    // 超级管理员直接返回true
    if (userStore.isAdmin) {
      return true
    }

    // 检查用户权限列表
    const permissions = userStore.permissions || []
    return permissions.includes(permission)
  }

  return {
    hasPermission
  }
}
