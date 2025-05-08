import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import generatorApi from '@/api/modules/generator'
import type { ImportTableParams, Datasource, TableInfo } from '@/types/generator'

/**
 * 表导入逻辑 Hook
 */
export function useImportTable(onSuccess?: () => void) {
  // 表单数据
  const formData = reactive<ImportTableParams>({
    datasourceId: 0,
    tableName: '',
    templateType: 'default',
    author: ''
  })

  // 状态
  const loading = ref(false)
  const datasourceList = ref<Datasource[]>([])
  const tableList = ref<TableInfo[]>([])
  const loadingTables = ref(false)

  // 表单验证规则
  const rules = {
    datasourceId: [{ required: true, message: '请选择数据源', trigger: 'change' }],
    tableName: [{ required: true, message: '请选择数据表', trigger: 'change' }],
    author: [{ required: true, message: '请填写作者', trigger: 'blur' }]
  }

  // 获取数据源列表
  const fetchDatasourceList = async () => {
    try {
      const res = await generatorApi.datasource.getList()
      datasourceList.value = res.data?.items || []
    } catch (error) {
      ElMessage.error('获取数据源列表失败')
      console.error('获取数据源列表失败:', error)
    }
  }

  // 获取表列表
  const fetchTableList = async (datasourceId: number) => {
    if (!datasourceId) return

    loadingTables.value = true
    try {
      const res = await generatorApi.table.getList(datasourceId)
      tableList.value = res.data?.items || []
    } catch (error) {
      ElMessage.error('获取表列表失败')
      console.error('获取表列表失败:', error)
      tableList.value = []
    } finally {
      loadingTables.value = false
    }
  }

  // 数据源变更时获取对应的表列表
  const handleDatasourceChange = (datasourceId: number) => {
    formData.tableName = ''
    fetchTableList(datasourceId)
  }

  // 提交导入
  const submitImport = async (formEl: any) => {
    if (!formEl) return

    await formEl.validate(async (valid: boolean) => {
      if (!valid) return

      loading.value = true
      try {
        // 直接传递对象参数
        await generatorApi.config.import(formData)
        ElMessage.success('表结构导入成功')
        resetForm(formEl)
        onSuccess?.()
      } catch (error) {
        ElMessage.error('表结构导入失败')
        console.error('表结构导入失败:', error)
      } finally {
        loading.value = false
      }
    })
  }

  // 重置表单
  const resetForm = (formEl: any) => {
    if (!formEl) return
    formEl.resetFields()
    formData.datasourceId = 0
    formData.tableName = ''
    formData.templateType = 'default'
    formData.author = ''
    tableList.value = []
  }

  // 初始化
  const initialize = () => {
    fetchDatasourceList()
  }

  return {
    formData,
    loading,
    datasourceList,
    tableList,
    loadingTables,
    rules,
    fetchDatasourceList,
    fetchTableList,
    handleDatasourceChange,
    submitImport,
    resetForm,
    initialize
  }
}
