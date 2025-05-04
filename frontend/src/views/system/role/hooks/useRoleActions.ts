import { ref, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { updateRole, deleteRole } from '@/api/modules/role'
import type { Role, UpdateRoleParams } from '@/types/role'

export default function useRoleActions(loadRoleList: () => Promise<void>) {
  // 添加初始化标记
  const isInitialized = ref(false)

  // 更改角色状态
  const handleStatusChange = async (row: Role): Promise<void> => {
    if (!isInitialized.value || !row.id) return

    const data: UpdateRoleParams = {
      status: row.status === 1 ? 0 : 1
    }

    try {
      const res = await updateRole(row.id, data)
      if (res.code === 0) {
        ElMessage.success(row.status === 1 ? '禁用成功' : '启用成功')
        await loadRoleList()
      }
    } catch (error) {
      console.error('更改角色状态失败', error)
      ElMessage.error('更改角色状态失败')
      // 恢复原状态
      row.status = row.status === 1 ? 0 : 1
    }
  }

  // 删除角色
  const handleDelete = async (row: Role): Promise<void> => {
    if (!isInitialized.value || !row.id) return

    try {
      await ElMessageBox.confirm(`确认删除角色"${row.roleName}"吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      const res = await deleteRole(row.id)
      if (res.code === 0) {
        ElMessage.success('删除成功')
        await loadRoleList()
      }
    } catch (error: any) {
      // 如果是用户取消删除，不显示错误信息
      if (error === 'cancel' || error?.toString().includes('cancel')) {
        return
      }
      console.error('删除角色失败', error)
      ElMessage.error('删除角色失败')
    }
  }

  // 批量删除
  const handleBatchDelete = async (selectedRows: Role[]): Promise<void> => {
    if (!isInitialized.value || selectedRows.length === 0) {
      ElMessage.warning('请选择要删除的角色')
      return
    }

    try {
      await ElMessageBox.confirm(`确认删除选中的${selectedRows.length}个角色吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      const promises = selectedRows.map((row) => (row.id ? deleteRole(row.id) : Promise.resolve()))
      await Promise.all(promises)
      ElMessage.success('批量删除成功')
      await loadRoleList()
    } catch (error: any) {
      // 如果是用户取消删除，不显示错误信息
      if (error === 'cancel' || error?.toString().includes('cancel')) {
        return
      }
      console.error('批量删除角色失败', error)
      ElMessage.error('批量删除角色失败')
    }
  }

  // 初始化
  onMounted(() => {
    nextTick(() => {
      isInitialized.value = true
    })
  })

  return {
    handleStatusChange,
    handleDelete,
    handleBatchDelete,
    isInitialized
  }
}
