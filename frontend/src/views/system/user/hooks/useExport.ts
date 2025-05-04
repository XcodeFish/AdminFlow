// useExport.ts 重构版
import { ref, reactive, onMounted, nextTick } from 'vue'
import { downloadFile } from '@/utils/download'
import { showSuccess, showError, showInfo } from '@/utils/message'
import type { UserQueryParams } from '@/types/user'

// 导出参数接口
interface ExportOptions {
  filename?: string
  sheetName?: string
  includeHeaders?: boolean
  customColumns?: string[]
}

export function useExport() {
  // 添加初始化标记
  const isInitialized = ref(false)

  // 导出状态
  const exporting = ref(false)
  const exportProgress = ref(0)
  const exportTotal = ref(0)

  /**
   * 导出用户数据
   * @param queryParams 查询参数
   * @param options 导出选项
   */
  const exportUserData = async (
    queryParams: UserQueryParams,
    options: ExportOptions = {}
  ): Promise<void> => {
    if (!isInitialized.value) {
      showError('系统初始化中，请稍后再试')
      return
    }

    const defaultOptions: ExportOptions = {
      filename: '用户数据.xlsx',
      sheetName: '用户列表',
      includeHeaders: true,
      customColumns: []
    }

    const exportOptions = { ...defaultOptions, ...options }

    try {
      exporting.value = true
      exportProgress.value = 0
      showInfo('开始导出用户数据，请稍候...')

      // 模拟进度
      const progressInterval = setInterval(() => {
        if (exportProgress.value < 90) {
          exportProgress.value += 10
        }
      }, 300)

      // 实际API调用 - 这里需要根据实际项目调整
      const response = await downloadFile('/api/v1/users/export', {
        ...queryParams,
        ...exportOptions
      })

      clearInterval(progressInterval)
      exportProgress.value = 100

      // 处理文件下载 - 具体实现取决于后端API和前端下载工具
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })

      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = exportOptions.filename || '用户数据.xlsx'
      link.click()
      URL.revokeObjectURL(link.href)

      showSuccess('用户数据导出成功')
    } catch (error) {
      console.error('导出用户数据失败:', error)
      showError('导出用户数据失败，请重试')
    } finally {
      exporting.value = false
      exportProgress.value = 0
    }
  }

  /**
   * 导入用户数据
   * @param file 要导入的文件
   */
  const importUserData = async (file: File): Promise<boolean> => {
    if (!isInitialized.value) {
      showError('系统初始化中，请稍后再试')
      return false
    }

    if (!file) {
      showError('请选择要导入的文件')
      return false
    }

    // 检查文件类型
    const fileExt = file.name.split('.').pop()?.toLowerCase()
    if (fileExt !== 'xlsx' && fileExt !== 'xls') {
      showError('只支持导入Excel文件(.xlsx/.xls)')
      return false
    }

    try {
      exporting.value = true // 复用状态
      exportProgress.value = 0

      // 创建FormData
      const formData = new FormData()
      formData.append('file', file)

      // 模拟进度
      const progressInterval = setInterval(() => {
        if (exportProgress.value < 90) {
          exportProgress.value += 10
        }
      }, 300)

      // 实际API调用
      const response = await fetch('/api/v1/users/import', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      exportProgress.value = 100

      // 处理响应
      const result = await response.json()

      if (result.success) {
        showSuccess(`成功导入 ${result.data?.successCount || 0} 条数据`)
        return true
      } else {
        showError(`导入失败: ${result.message}`)
        return false
      }
    } catch (error) {
      console.error('导入用户数据失败:', error)
      showError('导入用户数据失败，请重试')
      return false
    } finally {
      exporting.value = false
      exportProgress.value = 0
    }
  }

  /**
   * 下载导入模板
   */
  const downloadImportTemplate = async (): Promise<void> => {
    if (!isInitialized.value) return

    try {
      exporting.value = true

      // 实际API调用
      const response = await downloadFile('/api/v1/users/import-template', {})

      // 处理文件下载
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })

      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = '用户导入模板.xlsx'
      link.click()
      URL.revokeObjectURL(link.href)

      showSuccess('模板下载成功')
    } catch (error) {
      console.error('下载模板失败:', error)
      showError('模板下载失败，请重试')
    } finally {
      exporting.value = false
    }
  }

  // 初始化
  onMounted(() => {
    nextTick(() => {
      isInitialized.value = true
    })
  })

  return {
    exportUserData,
    importUserData,
    downloadImportTemplate,
    exporting,
    exportProgress,
    exportTotal,
    isInitialized
  }
}
