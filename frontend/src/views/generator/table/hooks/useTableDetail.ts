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
      // 获取表信息
      // 注意: 根据API定义，这里使用正确的参数调用
      const tableId = await getTableId(datasourceId, tableName)
      if (!tableId) {
        throw new Error('未找到表信息')
      }

      const response = await api.table.getColumns(tableId)
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
   * 根据数据源ID和表名获取表ID
   * 这是一个辅助方法，实际可能需要根据API设计调整
   */
  const getTableId = async (datasourceId: number, tableName: string): Promise<number | null> => {
    try {
      // 这里模拟获取表ID的方法
      // 在实际应用中，可能需要先获取表列表，然后根据表名匹配到对应的表ID
      // 或者后端直接提供一个根据数据源ID和表名获取表详情的接口

      // 假设API实际需要传递一个tableId，这里先模拟一个
      // 实际项目中需要根据API设计调整这部分逻辑
      return datasourceId // 暂时用datasourceId代替tableId用于演示
    } catch (error) {
      console.error('获取表ID失败:', error)
      return null
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
