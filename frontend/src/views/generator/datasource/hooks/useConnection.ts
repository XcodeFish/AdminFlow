import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import api from '@/api/modules/generator'
import type { DatasourceTestDto, ConnectionStatus } from '@/types/generator'

/**
 * 数据源连接测试Hook
 * 提供数据库连接测试功能
 */
export function useConnection() {
  // 测试连接加载状态
  const testing = ref(false)
  // 连接状态
  const connectionStatus = ref<ConnectionStatus | null>(null)
  // 测试耗时
  const testDuration = ref<number>(0)

  /**
   * 测试数据源连接
   * @param data 数据源连接参数
   */
  const testConnection = async (data: DatasourceTestDto) => {
    testing.value = true
    connectionStatus.value = null
    testDuration.value = 0

    const startTime = Date.now()

    try {
      const response = await api.datasource.test(data)
      const endTime = Date.now()
      testDuration.value = endTime - startTime

      if (response.data.connected) {
        connectionStatus.value = {
          success: true,
          message: '连接成功',
          details: response.data
        }
        ElMessage.success('连接测试成功')
      } else {
        connectionStatus.value = {
          success: false,
          message: '连接失败',
          details: response.data
        }
        ElMessage.error('连接测试失败')
      }

      return connectionStatus.value
    } catch (error: any) {
      const endTime = Date.now()
      testDuration.value = endTime - startTime

      connectionStatus.value = {
        success: false,
        message: error.message || '连接测试出错',
        details: error
      }

      ElMessage.error(error.message || '连接测试失败')
      return connectionStatus.value
    } finally {
      testing.value = false
    }
  }

  /**
   * 重置连接状态
   */
  const resetConnectionStatus = () => {
    connectionStatus.value = null
    testDuration.value = 0
  }

  return {
    testing,
    connectionStatus,
    testDuration,
    testConnection,
    resetConnectionStatus
  }
}
