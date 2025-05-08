import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import api from '@/api/modules/generator'
import type { TableDetail, ImportTableParams } from '@/types/generator'

/**
 * 表详情Hook
 * 提供数据库表详情的获取和处理功能
 */
export function useTableDetail() {
  // 表详情
  const tableDetail = ref<TableDetail | null>(null)
  // 加载状态
  const loading = ref(false)
  // 详情抽屉可见性
  const detailDrawerVisible = ref(false)

  /**
   * 获取表详情
   * @param datasourceId 数据源ID
   * @param tableName 表名
   */
  const fetchTableDetail = async (datasourceId: number, tableName: string) => {
    if (!datasourceId || !tableName) {
      ElMessage.warning('数据源ID和表名不能为空')
      return null
    }

    loading.value = true

    try {
      // 直接使用更新后的API调用，传入datasourceId和tableName
      const response = await api.table.getColumns(datasourceId, tableName)
      tableDetail.value = response.data
      return response.data
    } catch (error) {
      console.error('获取表详情失败:', error)
      ElMessage.error('获取表详情失败')
      tableDetail.value = null
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * 打开详情抽屉
   * @param datasourceId 数据源ID
   * @param tableName A表名
   */
  const openDetailDrawer = async (datasourceId: number, tableName: string) => {
    detailDrawerVisible.value = true
    await fetchTableDetail(datasourceId, tableName)
  }

  /**
   * 关闭详情抽屉
   */
  const closeDetailDrawer = () => {
    detailDrawerVisible.value = false
    // 可选择是否要清空详情数据
    // tableDetail.value = null
  }

  /**
   * 导入表结构到生成配置
   * @param datasourceId 数据源ID
   * @param tableName 表名
   */
  const importTableToConfig = async (datasourceId: number, tableName: string) => {
    loading.value = true

    try {
      // 调用导入表结构的API
      const importParams: ImportTableParams = {
        datasourceId,
        tableName,
        templateType: 'default', // 默认模板类型
        author: '系统默认' // 默认作者
      }

      // 修正API调用方法，使用import而非importTable
      const formData = new FormData()
      formData.append('data', JSON.stringify(importParams))
      const response = await api.config.import(formData)

      ElMessage.success(`表 ${tableName} 已成功导入到生成配置`)
      return true
    } catch (error) {
      console.error('导入表结构失败:', error)
      ElMessage.error('导入表结构失败')
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 清空表详情
   */
  const clearTableDetail = () => {
    tableDetail.value = null
  }

  return {
    tableDetail,
    loading,
    detailDrawerVisible,
    fetchTableDetail,
    openDetailDrawer,
    closeDetailDrawer,
    importTableToConfig,
    clearTableDetail
  }
}
