// useUserActions.ts 重构版
import { ref, reactive, onMounted, nextTick } from 'vue'
import {
  deleteUser,
  updateUserStatus,
  // batchEnableUsers,
  // batchDisableUsers,
  // batchDeleteUsers
} from '@/api/modules/user'
import { showSuccess, showError, showConfirm } from '@/utils/message'
import type { User } from '@/types/user'

export default function useUserActions(loadUserList: () => Promise<void>) {
  // 添加初始化标记
  const isInitialized = ref(false)

  // 设置权限
  const handleSetPermission = async (row: User, type: string): Promise<void> => {
    if (!isInitialized.value) return

    try {
      // 实际项目中实现权限设置逻辑，这里只是示例
      const permissionType = type === 'view' ? '查看' : type === 'edit' ? '编辑' : '管理员'

      // 假设这里有一个API调用
      // await setUserPermission(row.id, type)

      showSuccess(`已设置用户 ${row.username} 的${permissionType}权限`)
    } catch (error) {
      console.error('设置权限失败:', error)
      showError('设置权限失败')
    }
  }

  // 更改用户状态
  const handleStatusChange = async (row: User): Promise<void> => {
    if (!isInitialized.value || !row.id) return

    const originalStatus = row.status

    try {
      await updateUserStatus(row.id, Number(row.status))
      showSuccess(`已${row.status === 1 ? '启用' : '禁用'}用户：${row.username}`)
    } catch (error) {
      // 恢复原状态
      row.status = originalStatus === 1 ? 0 : 1
      console.error('修改用户状态失败:', error)
      showError('修改用户状态失败')
    }
  }

  // 删除用户
  const handleDelete = async (row: User): Promise<void> => {
    if (!isInitialized.value || !row.id) return

    try {
      await showConfirm(`确定要删除用户 ${row.username} 吗？`, '警告', async () => {
        await deleteUser(row.id!)
        showSuccess(`已删除用户：${row.username}`)
        await loadUserList()
      })
    } catch (error) {
      console.error('删除用户失败:', error)
      showError('删除用户失败')
    }
  }

  // 批量启用
  // const handleBatchEnable = async (selectedRows: User[]): Promise<void> => {
  //   if (!isInitialized.value || selectedRows.length === 0) {
  //     showError('请选择要启用的用户')
  //     return
  //   }

  //   try {
  //     const confirmed = await showConfirm('确定要批量启用选中的用户吗？', '提示', {
  //       confirmButtonText: '确定',
  //       cancelButtonText: '取消',
  //       type: 'info'
  //     })

  //     if (confirmed) {
  //       const userIds = selectedRows.map((row) => Number(row.id)).filter(Boolean)

  //       // 使用批量API (假设有这个API)
  //       // await batchEnableUsers(userIds)
  //       // 如果没有批量API，则使用多个请求
  //       // await Promise.all(userIds.map(id => updateUserStatus(id, 1)))

  //       showSuccess(`已成功启用 ${userIds.length} 个用户`)
  //       await loadUserList()
  //     }
  //   } catch (error) {
  //     console.error('批量启用失败:', error)
  //     showError('批量启用失败')
  //   }
  // }

  // 批量禁用
  // const handleBatchDisable = async (selectedRows: User[]): Promise<void> => {
  //   if (!isInitialized.value || selectedRows.length === 0) {
  //     showError('请选择要禁用的用户')
  //     return
  //   }

  //   try {
  //     const confirmed = await showConfirm('确定要批量禁用选中的用户吗？', '提示', {
  //       confirmButtonText: '确定',
  //       cancelButtonText: '取消',
  //       type: 'warning'
  //     })

  //     if (confirmed) {
  //       const userIds = selectedRows.map((row) => Number(row.id)).filter(Boolean)

  //       // 使用批量API (假设有这个API)
  //       // await batchDisableUsers(userIds)
  //       // 如果没有批量API，则使用多个请求
  //       // await Promise.all(userIds.map(id => updateUserStatus(id, 0)))

  //       showSuccess(`已成功禁用 ${userIds.length} 个用户`)
  //       await loadUserList()
  //     }
  //   } catch (error) {
  //     console.error('批量禁用失败:', error)
  //     showError('批量禁用失败')
  //   }
  // }

  // 批量删除
  // const handleBatchDelete = async (selectedRows: User[]): Promise<void> => {
  //   if (!isInitialized.value || selectedRows.length === 0) {
  //     showError('请选择要删除的用户')
  //     return
  //   }

  //   try {
  //     const confirmed = await showConfirm(
  //       `确定要删除选中的 ${selectedRows.length} 个用户吗？此操作不可恢复！`,
  //       '警告',
  //       {
  //         confirmButtonText: '确定',
  //         cancelButtonText: '取消',
  //         type: 'error'
  //       }
  //     )

  //     if (confirmed) {
  //       const userIds = selectedRows.map((row) => Number(row.id)).filter(Boolean)

  //       // 使用批量API
  //       // await batchDeleteUsers(userIds)
  //       // 如果没有批量API，则使用多个请求
  //       // await Promise.all(userIds.map(id => deleteUser(id)))

  //       showSuccess(`已成功删除 ${userIds.length} 个用户`)
  //       await loadUserList()
  //     }
  //   } catch (error) {
  //     console.error('批量删除失败:', error)
  //     showError('批量删除失败')
  //   }
  // }

  // 初始化
  onMounted(() => {
    nextTick(() => {
      isInitialized.value = true
    })
  })

  return {
    handleSetPermission,
    handleStatusChange,
    handleDelete,
    // handleBatchEnable,
    // handleBatchDisable,
    // handleBatchDelete,
    isInitialized
  }
}
