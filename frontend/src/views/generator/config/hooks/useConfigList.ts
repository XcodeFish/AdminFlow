import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import generatorApi from '@/api/modules/generator'
import type { GeneratorConfig } from '@/types/generator'
import { useRouter } from 'vue-router'

/**
 * 配置列表逻辑 Hook
 */
export function useConfigList() {
  // 配置列表状态
  const configList = ref<GeneratorConfig[]>([])
  const total = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const loading = ref(false)
  const currentConfig = ref<GeneratorConfig | null>(null)

  // 控制抽屉和对话框的状态
  const detailDrawerVisible = ref(false)
  const importDialogVisible = ref(false)

  const router = useRouter()

  // 加载配置列表
  const fetchConfigList = async () => {
    loading.value = true
    try {
      const res = await generatorApi.config.getList()
      configList.value = res.data?.items || []
      total.value = res.data?.total || 0
    } catch (error) {
      ElMessage.error('获取配置列表失败')
      console.error('获取配置列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 获取配置详情
  const fetchConfigDetail = async (id: number) => {
    loading.value = true
    try {
      const res = await generatorApi.config.getById(id)
      currentConfig.value = res.data
      return res.data
    } catch (error) {
      ElMessage.error('获取配置详情失败')
      console.error('获取配置详情失败:', error)
      return null
    } finally {
      loading.value = false
    }
  }

  // 打开详情抽屉
  const openDetailDrawer = async (id: number) => {
    const config = await fetchConfigDetail(id)
    if (config) {
      detailDrawerVisible.value = true
    }
  }

  // 关闭详情抽屉
  const closeDetailDrawer = () => {
    detailDrawerVisible.value = false
    currentConfig.value = null
  }

  // 打开导入对话框
  const openImportDialog = () => {
    importDialogVisible.value = true
  }

  // 关闭导入对话框
  const closeImportDialog = () => {
    importDialogVisible.value = false
  }

  // 删除配置
  const deleteConfig = async (id: number) => {
    try {
      await ElMessageBox.confirm('确定要删除该配置吗？删除后无法恢复', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      await generatorApi.config.delete(id)
      ElMessage.success('删除成功')
      fetchConfigList()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败')
        console.error('删除失败:', error)
      }
    }
  }

  // 复制配置
  const duplicateConfig = async (id: number) => {
    try {
      await generatorApi.config.duplicate(id)
      ElMessage.success('复制成功')
      fetchConfigList()
    } catch (error) {
      ElMessage.error('复制失败')
      console.error('复制失败:', error)
    }
  }

  // 导出配置
  const exportConfig = async (id: number) => {
    try {
      const response = await generatorApi.config.export(id)

      // 创建Blob链接并下载
      const url = window.URL.createObjectURL(new Blob([response]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `config_${id}_${new Date().getTime()}.json`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      ElMessage.success('导出成功')
    } catch (error) {
      ElMessage.error('导出失败')
      console.error('导出失败:', error)
    }
  }

  // 生成代码
  const generateCode = async (id: number) => {
    try {
      await generatorApi.code.generate(id)
      ElMessage.success('代码生成任务已提交')
      return true
    } catch (error) {
      ElMessage.error('代码生成失败')
      console.error('代码生成失败:', error)
      return false
    }
  }

  // 预览代码
  const previewCode = (id: number) => {
    // 使用router在当前页面跳转，而不是打开新标签页
    router.push(`/generator/preview/${id}`)
  }

  // 处理页面变化
  const handlePageChange = (page: number) => {
    currentPage.value = page
    fetchConfigList()
  }

  // 处理每页显示数量变化
  const handleSizeChange = (size: number) => {
    pageSize.value = size
    fetchConfigList()
  }

  // 初始化加载数据
  onMounted(() => {
    fetchConfigList()
  })

  return {
    configList,
    total,
    currentPage,
    pageSize,
    loading,
    currentConfig,
    detailDrawerVisible,
    importDialogVisible,
    fetchConfigList,
    fetchConfigDetail,
    openDetailDrawer,
    closeDetailDrawer,
    openImportDialog,
    closeImportDialog,
    deleteConfig,
    duplicateConfig,
    exportConfig,
    generateCode,
    previewCode,
    handlePageChange,
    handleSizeChange
  }
}
