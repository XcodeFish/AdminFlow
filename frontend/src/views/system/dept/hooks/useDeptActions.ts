import { ref, onMounted, nextTick } from 'vue'
import { updateDept, deleteDept } from '@/api/modules/dept'
import type { Department } from '@/types/dept'
import { DeptStatus } from '@/types/dept'
import { showSuccess, showError, showConfirm } from '@/utils/message'

export default function useDeptActions(
  loadDeptList: () => Promise<void>,
  loadDeptTree: () => Promise<void>
) {
  // 添加初始化标记，防止组件未完全挂载时进行操作
  const isInitialized = ref(false)

  // 更改部门状态
  const handleStatusChange = async (row: Department): Promise<void> => {
    if (!isInitialized.value || !row.id) return

    const originalStatus = row.status
    const newStatus =
      originalStatus === DeptStatus.ENABLED ? DeptStatus.DISABLED : DeptStatus.ENABLED

    try {
      await updateDept(row.id, { status: newStatus })
      showSuccess(`已${newStatus === DeptStatus.ENABLED ? '启用' : '禁用'}部门：${row.deptName}`)
      // 状态变更成功后刷新列表
      await loadDeptList()
      await loadDeptTree()
    } catch (error) {
      // 恢复原状态
      row.status = originalStatus
      console.error('修改部门状态失败:', error)
      showError('修改部门状态失败')
    }
  }

  // 删除部门
  const handleDelete = async (row: Department): Promise<void> => {
    if (!isInitialized.value || !row.id) return

    try {
      await showConfirm(`确定要删除部门【${row.deptName}】吗？`, '警告', async () => {
        await deleteDept(row.id!)
        showSuccess(`已删除部门：${row.deptName}`)
        // 删除成功后刷新列表
        await loadDeptList()
        await loadDeptTree()
      })
    } catch (error) {
      console.error('删除部门失败:', error)
      showError('删除部门失败')
    }
  }

  // 批量删除
  const handleBatchDelete = async (selectedRows: Department[]): Promise<void> => {
    if (!isInitialized.value || selectedRows.length === 0) {
      showError('请选择要删除的部门')
      return
    }

    try {
      await showConfirm(
        `确定要删除选中的 ${selectedRows.length} 个部门吗？此操作不可恢复！`,
        '警告',
        async () => {
          const promises = selectedRows.map((row) => deleteDept(row.id))
          await Promise.all(promises)
          showSuccess(`已成功删除 ${selectedRows.length} 个部门`)
          // 删除成功后刷新列表
          await loadDeptList()
          await loadDeptTree()
        }
      )
    } catch (error) {
      console.error('批量删除失败:', error)
      showError('批量删除失败')
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
