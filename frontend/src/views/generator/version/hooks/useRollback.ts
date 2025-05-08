import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import generatorApi from '@/api/modules/generator'
import type { GeneratorVersion } from '@/types/generator'

/**
 * 版本回滚逻辑 Hook
 */
export function useRollback(onSuccess?: () => void) {
  // 状态
  const loading = ref(false)
  const rollbackProgress = ref(0)
  const rollbackStatus = ref<'idle' | 'processing' | 'success' | 'error'>('idle')

  // 回滚操作
  const rollbackToVersion = async (versionId: number) => {
    if (!versionId) return false

    loading.value = true
    rollbackStatus.value = 'processing'
    rollbackProgress.value = 0

    try {
      // 模拟回滚进度
      const progressInterval = setInterval(() => {
        if (rollbackProgress.value < 90) {
          rollbackProgress.value += 10
        }
      }, 300)

      // 执行回滚
      await generatorApi.version.rollback(versionId)

      // 清除进度模拟定时器
      clearInterval(progressInterval)
      rollbackProgress.value = 100
      rollbackStatus.value = 'success'

      ElMessage.success('回滚成功')

      // 回调
      setTimeout(() => {
        onSuccess?.()
      }, 1000)

      return true
    } catch (error) {
      rollbackStatus.value = 'error'
      ElMessage.error('回滚失败')
      console.error('回滚失败:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  // 重置状态
  const resetRollbackStatus = () => {
    rollbackProgress.value = 0
    rollbackStatus.value = 'idle'
  }

  return {
    loading,
    rollbackProgress,
    rollbackStatus,
    rollbackToVersion,
    resetRollbackStatus
  }
}
