import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import generatorApi from '@/api/modules/generator'
import type { GeneratorVersion } from '@/types/generator'

/**
 * 版本列表逻辑 Hook
 */
export function useVersionList(configId: number) {
  // 版本列表状态
  const versionList = ref<GeneratorVersion[]>([])
  const total = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const loading = ref(false)
  const currentVersion = ref<GeneratorVersion | null>(null)

  // 控制对话框的状态
  const detailDialogVisible = ref(false)
  const rollbackDialogVisible = ref(false)

  // 加载版本列表
  const fetchVersionList = async () => {
    loading.value = true
    try {
      const res = await generatorApi.version.getList(configId)
      versionList.value = res.data?.items || []
      total.value = res.data?.total || 0
    } catch (error) {
      ElMessage.error('获取版本列表失败')
      console.error('获取版本列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 获取版本详情
  const fetchVersionDetail = async (id: number) => {
    loading.value = true
    try {
      const res = await generatorApi.version.getById(id)
      currentVersion.value = res.data
      return res.data
    } catch (error) {
      ElMessage.error('获取版本详情失败')
      console.error('获取版本详情失败:', error)
      return null
    } finally {
      loading.value = false
    }
  }

  // 打开详情对话框
  const openDetailDialog = async (id: number) => {
    const version = await fetchVersionDetail(id)
    if (version) {
      detailDialogVisible.value = true
    }
  }

  // 关闭详情对话框
  const closeDetailDialog = () => {
    detailDialogVisible.value = false
    currentVersion.value = null
  }

  // 打开回滚对话框
  const openRollbackDialog = async (id: number) => {
    const version = await fetchVersionDetail(id)
    if (version) {
      rollbackDialogVisible.value = true
    }
  }

  // 关闭回滚对话框
  const closeRollbackDialog = () => {
    rollbackDialogVisible.value = false
  }

  // 删除版本
  const deleteVersion = async (id: number) => {
    try {
      await ElMessageBox.confirm('确定要删除该版本吗？删除后无法恢复', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      await generatorApi.version.delete(id)
      ElMessage.success('删除成功')
      fetchVersionList()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败')
        console.error('删除失败:', error)
      }
    }
  }

  // 创建新版本
  const createVersion = async (note: string) => {
    try {
      await generatorApi.version.create({
        configId,
        note
      })
      ElMessage.success('创建版本成功')
      fetchVersionList()
      return true
    } catch (error) {
      ElMessage.error('创建版本失败')
      console.error('创建版本失败:', error)
      return false
    }
  }

  // 比较版本
  const compareVersions = async (versionId1: number, versionId2: number) => {
    try {
      return await generatorApi.version.compare({
        versionId1,
        versionId2
      })
    } catch (error) {
      ElMessage.error('比较版本失败')
      console.error('比较版本失败:', error)
      return null
    }
  }

  // 处理页面变化
  const handlePageChange = (page: number) => {
    currentPage.value = page
    fetchVersionList()
  }

  // 处理每页显示数量变化
  const handleSizeChange = (size: number) => {
    pageSize.value = size
    fetchVersionList()
  }

  // 初始化加载数据
  onMounted(() => {
    fetchVersionList()
  })

  return {
    versionList,
    total,
    currentPage,
    pageSize,
    loading,
    currentVersion,
    detailDialogVisible,
    rollbackDialogVisible,
    fetchVersionList,
    fetchVersionDetail,
    openDetailDialog,
    closeDetailDialog,
    openRollbackDialog,
    closeRollbackDialog,
    deleteVersion,
    createVersion,
    compareVersions,
    handlePageChange,
    handleSizeChange
  }
}
