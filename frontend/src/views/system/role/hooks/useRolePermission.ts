import { ref, Ref } from 'vue'
import { ElMessage } from 'element-plus'
import { assignRolePermissions, getRolePermissions } from '@/api/modules/role'
import { getPermissionTree } from '@/api/modules/permission'
import type { Permission } from '@/types/permission'
import type { AssignRolePermissionsParams } from '@/types/role'

export default function useRolePermission(roleId: Ref<string | null>) {
  // 权限树数据
  const permissionTree = ref<Permission[]>([])
  const checkedPermKeys = ref<string[]>([])
  const loading = ref(false)

  // 加载权限数据
  const loadPermissionData = async () => {
    if (!roleId.value) return

    loading.value = true
    try {
      // 获取所有权限树
      const treeRes = await getPermissionTree()

      if (treeRes.code === 200) {
        permissionTree.value = treeRes.data
      }

      // 获取角色已有权限
      const rolePermRes = await getRolePermissions(roleId.value)
      console.log('rolePermRes', rolePermRes)
      if (rolePermRes.code === 200) {
        checkedPermKeys.value = rolePermRes.data.map((perm) => perm.permKey)
        console.log('映射后的checkedPermKeys:', checkedPermKeys.value)
      }
    } catch (error) {
      console.error('加载权限数据失败', error)
      ElMessage.error('获取权限数据失败')
    } finally {
      loading.value = false
    }
  }

  // 保存权限分配
  const saveRolePermissions = async () => {
    if (!roleId.value) return false

    loading.value = true
    try {
      const params: AssignRolePermissionsParams = {
        permKeys: checkedPermKeys.value
      }

      const res = await assignRolePermissions(roleId.value, params)
      if (res.code === 0) {
        ElMessage.success('权限分配成功')
        return true
      }
      return false
    } catch (error) {
      console.error('保存权限分配失败', error)
      ElMessage.error('保存权限分配失败')
      return false
    } finally {
      loading.value = false
    }
  }

  // 权限类型文本
  const getPermTypeName = (type: number) => {
    switch (type) {
      case 0:
        return '菜单'
      case 1:
        return '操作'
      case 2:
        return '数据'
      default:
        return '未知'
    }
  }

  return {
    permissionTree,
    checkedPermKeys,
    loading,
    loadPermissionData,
    saveRolePermissions,
    getPermTypeName
  }
}
