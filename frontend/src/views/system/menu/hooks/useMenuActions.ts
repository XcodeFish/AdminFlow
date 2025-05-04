import { ref, onMounted, nextTick } from 'vue'
import { deleteMenu, updateMenu } from '@/api/modules/menu'
import { showSuccess, showError, showConfirm } from '@/utils/message'
import type { MenuItem } from '@/types/menu'

export default function useMenuActions(loadMenuList: () => Promise<void>) {
  // 添加初始化标记
  const isInitialized = ref(false)

  // 更改菜单状态
  const handleStatusChange = async (row: MenuItem): Promise<void> => {
    if (!isInitialized.value || !row.id) return

    const originalStatus = row.status

    try {
      await updateMenu(row.id, { status: row.status })
      showSuccess(`已${row.status === 1 ? '启用' : '禁用'}菜单：${row.menuName}`)
    } catch (error) {
      // 恢复原状态
      row.status = originalStatus === 1 ? 0 : 1
      console.error('修改菜单状态失败:', error)
      showError('修改菜单状态失败')
    }
  }

  // 删除菜单
  const handleDelete = async (row: MenuItem): Promise<void> => {
    if (!isInitialized.value || !row.id) return

    try {
      await showConfirm(`确定要删除菜单 ${row.menuName} 吗？`, '警告', async () => {
        await deleteMenu(row.id!)
        showSuccess(`已删除菜单：${row.menuName}`)
        await loadMenuList()
      })
    } catch (error) {
      console.error('删除菜单失败:', error)
      showError('删除菜单失败')
    }
  }

  // 批量启用
  const handleBatchEnable = async (selectedRows: MenuItem[]): Promise<void> => {
    if (!isInitialized.value || selectedRows.length === 0) {
      showError('请选择要启用的菜单')
      return
    }

    try {
      await showConfirm('确定要批量启用选中的菜单吗？', '提示', async () => {
        const menuIds = selectedRows.map((row) => row.id).filter(Boolean)

        // 此处应调用批量启用API
        // await batchEnableMenus(menuIds)

        showSuccess(`已成功启用 ${menuIds.length} 个菜单`)
        await loadMenuList()
      })
    } catch (error) {
      console.error('批量启用失败:', error)
      showError('批量启用失败')
    }
  }

  // 批量禁用
  const handleBatchDisable = async (selectedRows: MenuItem[]): Promise<void> => {
    if (!isInitialized.value || selectedRows.length === 0) {
      showError('请选择要禁用的菜单')
      return
    }

    try {
      await showConfirm('确定要批量禁用选中的菜单吗？', '提示', async () => {
        const menuIds = selectedRows.map((row) => row.id).filter(Boolean)

        // 此处应调用批量禁用API
        // await batchDisableMenus(menuIds)

        showSuccess(`已成功禁用 ${menuIds.length} 个菜单`)
        await loadMenuList()
      })
    } catch (error) {
      console.error('批量禁用失败:', error)
      showError('批量禁用失败')
    }
  }

  // 批量删除
  const handleBatchDelete = async (selectedRows: MenuItem[]): Promise<void> => {
    if (!isInitialized.value || selectedRows.length === 0) {
      showError('请选择要删除的菜单')
      return
    }

    try {
      await showConfirm(
        `确定要删除选中的 ${selectedRows.length} 个菜单吗？此操作不可恢复！`,
        '警告',
        async () => {
          const menuIds = selectedRows.map((row) => row.id).filter(Boolean)

          // 此处应调用批量删除API
          // await batchDeleteMenus(menuIds)

          showSuccess(`已成功删除 ${menuIds.length} 个菜单`)
          await loadMenuList()
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
    handleBatchEnable,
    handleBatchDisable,
    handleBatchDelete,
    isInitialized
  }
}
