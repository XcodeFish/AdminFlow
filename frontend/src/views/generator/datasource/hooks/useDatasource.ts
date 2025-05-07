import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/api/modules/generator'
import type { Datasource, DatasourceCreateDto, DatasourceUpdateDto } from '@/types/generator'

/**
 * 数据源管理Hook
 * 提供数据源的增删改查功能
 */
export function useDatasource() {
  // 数据源列表
  const datasources = ref<Datasource[]>([])
  // 加载状态
  const loading = ref(false)
  // 总数据量
  const total = ref(0)
  // 当前页
  const currentPage = ref(1)
  // 每页显示数量
  const pageSize = ref(10)
  // 当前选中的数据源
  const currentDatasource = ref<Datasource | null>(null)
  // 表单对话框可见性
  const formDialogVisible = ref(false)
  // 表单模式：新增或编辑
  const formMode = ref<'create' | 'edit'>('create')

  /**
   * 获取数据源列表
   */
  const fetchDatasources = async () => {
    loading.value = true
    try {
      const response = await api.datasource.getList()
      datasources.value = response.data.items || []
      total.value = response.data.total || datasources.value.length
      return response
    } catch (error) {
      console.error('获取数据源列表失败:', error)
      ElMessage.error('获取数据源列表失败')
    } finally {
      loading.value = false
    }
  }

  /**
   * 创建数据源
   * @param data 数据源数据
   */
  const createDatasource = async (data: DatasourceCreateDto) => {
    loading.value = true
    try {
      const response = await api.datasource.create(data)
      ElMessage.success('创建数据源成功')
      await fetchDatasources()
      return response
    } catch (error) {
      console.error('创建数据源失败:', error)
      ElMessage.error('创建数据源失败')
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新数据源
   * @param id 数据源ID
   * @param data 更新数据
   */
  const updateDatasource = async (id: number, data: DatasourceUpdateDto) => {
    loading.value = true
    try {
      const response = await api.datasource.update(id, data)
      ElMessage.success('更新数据源成功')
      await fetchDatasources()
      return response
    } catch (error) {
      console.error('更新数据源失败:', error)
      ElMessage.error('更新数据源失败')
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除数据源
   * @param id 数据源ID
   */
  const deleteDatasource = async (id: number) => {
    try {
      await ElMessageBox.confirm('确定要删除该数据源吗？此操作不可恢复', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      loading.value = true
      await api.datasource.delete(id)
      ElMessage.success('删除数据源成功')
      await fetchDatasources()
      return true
    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除数据源失败:', error)
        ElMessage.error('删除数据源失败')
      }
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 打开新增表单对话框
   */
  const openCreateDialog = () => {
    formMode.value = 'create'
    currentDatasource.value = null
    formDialogVisible.value = true
  }

  /**
   * 打开编辑表单对话框
   * @param datasource 数据源对象
   */
  const openEditDialog = (datasource: Datasource) => {
    formMode.value = 'edit'
    currentDatasource.value = { ...datasource }
    formDialogVisible.value = true
  }

  /**
   * 关闭表单对话框
   */
  const closeFormDialog = () => {
    formDialogVisible.value = false
    currentDatasource.value = null
  }

  // 计算属性：判断数据源列表是否为空
  const isEmpty = computed(() => datasources.value.length === 0)

  // 计算属性：表单对话框标题
  const formTitle = computed(() => (formMode.value === 'create' ? '新增数据源' : '编辑数据源'))

  return {
    datasources,
    loading,
    total,
    currentPage,
    pageSize,
    currentDatasource,
    formDialogVisible,
    formMode,
    formTitle,
    isEmpty,
    fetchDatasources,
    createDatasource,
    updateDatasource,
    deleteDatasource,
    openCreateDialog,
    openEditDialog,
    closeFormDialog
  }
}
