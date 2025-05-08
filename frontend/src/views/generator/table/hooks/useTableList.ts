import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import api from '@/api/modules/generator'
import type { TableInfo } from '@/types/generator'

/**
 * 表列表Hook
 * 提供数据库表列表的获取和处理功能
 */
export function useTableList() {
  // 表列表
  const tables = ref<TableInfo[]>([])
  // 加载状态
  const loading = ref(false)
  // 总数据量
  const total = ref(0)
  // 当前页
  const currentPage = ref(1)
  // 每页显示数量
  const pageSize = ref(10)
  // 当前选中的数据源ID
  const currentDatasourceId = ref<number | null>(null)
  // 当前选中的表
  const currentTable = ref<TableInfo | null>(null)

  /**
   * 获取表列表
   * @param datasourceId 数据源ID
   */
  const fetchTables = async (datasourceId: number) => {
    if (!datasourceId) {
      ElMessage.warning('请先选择数据源')
      return
    }

    currentDatasourceId.value = datasourceId
    loading.value = true

    try {
      const response = await api.table.getList(datasourceId)
      tables.value = response.data.items || []
      total.value = response.data.total || tables.value.length
      return response
    } catch (error) {
      console.error('获取表列表失败:', error)
      ElMessage.error('获取表列表失败')
      tables.value = []
      total.value = 0
    } finally {
      loading.value = false
    }
  }

  /**
   * 刷新表结构
   * @param tableId 表ID
   */
  // const refreshTable = async (tableId: number) => {
  //   loading.value = true
  //   try {
  //     await api.table.refresh(tableId)
  //     ElMessage.success('刷新表结构成功')
  //     if (currentDatasourceId.value) {
  //       await fetchTables(currentDatasourceId.value)
  //     }
  //     return true
  //   } catch (error) {
  //     console.error('刷新表结构失败:', error)
  //     ElMessage.error('刷新表结构失败')
  //     return false
  //   } finally {
  //     loading.value = false
  //   }
  // }

  /**
   * 选择表
   * @param table 表信息
   */
  const selectTable = (table: TableInfo) => {
    currentTable.value = table
  }

  /**
   * 清除选择
   */
  const clearSelection = () => {
    currentTable.value = null
  }

  // 计算属性：判断表列表是否为空
  const isEmpty = computed(() => tables.value.length === 0)

  // 计算属性：是否有选中的表
  const hasSelectedTable = computed(() => currentTable.value !== null)

  return {
    tables,
    loading,
    total,
    currentPage,
    pageSize,
    currentDatasourceId,
    currentTable,
    isEmpty,
    hasSelectedTable,
    fetchTables,
    // refreshTable,
    selectTable,
    clearSelection
  }
}
