import { ElMessage, ElMessageBox } from 'element-plus'
import type { ApiLog, ApiLogQueryParams } from '@/types/logger'
import { deleteApiLogs, cleanApiLogs, exportApiLogs } from '@/api/modules/logger'

export default function useApiLogActions(refreshCallback: () => void) {
  // 删除单条日志
  const handleDelete = async (row: ApiLog) => {
    try {
      await ElMessageBox.confirm('确定要删除此条日志记录吗？', '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      const { data, code, message } = await deleteApiLogs({ ids: [row.id] })
      if (code === 200) {
        ElMessage.success('删除成功')
        refreshCallback()
      } else {
        ElMessage.error(message || '删除失败')
      }
    } catch (error) {
      // 用户取消操作，不需要处理
      if (error !== 'cancel') {
        console.error('删除日志失败', error)
      }
    }
  }

  // 批量删除日志
  const handleBatchDelete = async (rows: ApiLog[]) => {
    if (!rows.length) {
      ElMessage.warning('请选择要删除的日志记录')
      return
    }

    try {
      await ElMessageBox.confirm(`确定要删除这${rows.length}条日志记录吗？`, '批量删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      const ids = rows.map((row) => row.id)
      const { code, message } = await deleteApiLogs({ ids })
      if (code === 200) {
        ElMessage.success(`成功删除${rows.length}条日志记录`)
        refreshCallback()
      } else {
        ElMessage.error(message || '批量删除失败')
      }
    } catch (error) {
      // 用户取消操作，不需要处理
      if (error !== 'cancel') {
        console.error('批量删除日志失败', error)
      }
    }
  }

  // 清空所有日志
  const handleCleanAll = async () => {
    try {
      await ElMessageBox.confirm('确定要清空所有接口日志吗？此操作不可恢复！', '清空确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      const { code, message } = await cleanApiLogs()
      if (code === 200) {
        ElMessage.success('所有接口日志已清空')
        refreshCallback()
      } else {
        ElMessage.error(message || '清空日志失败')
      }
    } catch (error) {
      // 用户取消操作，不需要处理
      if (error !== 'cancel') {
        console.error('清空日志失败', error)
      }
    }
  }

  // 导出日志
  const handleExport = async (params: ApiLogQueryParams) => {
    try {
      ElMessage.info('正在导出日志，请稍候...')
      const response = await exportApiLogs(params)

      // 处理blob响应
      const blob = new Blob([response.data], { type: 'application/vnd.ms-excel' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)

      // 获取文件名
      const contentDisposition = response.headers['content-disposition']
      let filename = '接口日志.xlsx'
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename=(.+)/)
        if (filenameMatch && filenameMatch.length > 1) {
          filename = decodeURIComponent(filenameMatch[1])
        }
      }

      link.download = filename
      link.click()
      URL.revokeObjectURL(link.href)
      ElMessage.success('导出成功')
    } catch (error) {
      console.error('导出日志失败', error)
      ElMessage.error('导出日志失败')
    }
  }

  return {
    handleDelete,
    handleBatchDelete,
    handleCleanAll,
    handleExport
  }
}
