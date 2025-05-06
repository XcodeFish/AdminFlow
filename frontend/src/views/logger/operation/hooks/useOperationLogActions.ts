import { ref, onMounted, nextTick } from 'vue'
import { deleteOperationLogs, cleanOperationLogs, exportOperationLogs } from '@/api/modules/logger'
import { showSuccess, showError, showConfirm } from '@/utils/message'
import type { OperationLog, DeleteLogsParams, OperationLogQueryParams } from '@/types/logger'
import { downloadFile } from '@/utils/download'

export default function useOperationLogActions(fetchLogList: () => Promise<void>) {
  // 添加初始化标记
  const isInitialized = ref(false)

  // 查看日志详情
  const handleViewDetail = (row: OperationLog) => {
    if (!isInitialized.value || !row.id) return

    return {
      id: row.id
    }
  }

  // 删除单条日志
  const handleDelete = async (row: OperationLog): Promise<void> => {
    if (!isInitialized.value || !row.id) return

    try {
      await showConfirm(`确定要删除该条操作日志吗？`, '警告', async () => {
        const params: DeleteLogsParams = { ids: [row.id] }
        const { data } = await deleteOperationLogs(params)

        if (data && data.deletedCount > 0) {
          showSuccess(`已成功删除 ${data.deletedCount} 条日志`)
          await fetchLogList()
        } else {
          showError('删除日志失败')
        }
      })
    } catch (error) {
      console.error('删除日志失败:', error)
      showError('删除日志失败')
    }
  }

  // 批量删除日志
  const handleBatchDelete = async (selectedRows: OperationLog[]): Promise<void> => {
    if (!isInitialized.value || selectedRows.length === 0) {
      showError('请选择要删除的日志')
      return
    }

    try {
      await showConfirm(
        `确定要删除选中的 ${selectedRows.length} 条日志吗？此操作不可恢复！`,
        '警告',
        async () => {
          const logIds = selectedRows.map((row) => row.id)
          const params: DeleteLogsParams = { ids: logIds }

          const { data } = await deleteOperationLogs(params)

          if (data && data.deletedCount > 0) {
            showSuccess(`已成功删除 ${data.deletedCount} 条日志`)
            await fetchLogList()
          } else {
            showError('批量删除日志失败')
          }
        }
      )
    } catch (error) {
      console.error('批量删除日志失败:', error)
      showError('批量删除日志失败')
    }
  }

  // 清空所有日志
  const handleCleanAll = async (): Promise<void> => {
    if (!isInitialized.value) return

    try {
      await showConfirm(`确定要清空所有操作日志吗？此操作不可恢复！`, '警告', async () => {
        await cleanOperationLogs()
        showSuccess('已成功清空所有操作日志')
        await fetchLogList()
      })
    } catch (error) {
      console.error('清空日志失败:', error)
      showError('清空日志失败')
    }
  }

  // 导出日志
  const handleExport = async (params: OperationLogQueryParams): Promise<void> => {
    if (!isInitialized.value) return

    try {
      const response = await exportOperationLogs(params)
      downloadFile(response, '操作日志.xlsx')
      showSuccess('导出成功')
    } catch (error) {
      console.error('导出日志失败:', error)
      showError('导出日志失败')
    }
  }

  // 初始化
  onMounted(() => {
    nextTick(() => {
      isInitialized.value = true
    })
  })

  return {
    handleViewDetail,
    handleDelete,
    handleBatchDelete,
    handleCleanAll,
    handleExport,
    isInitialized
  }
}
