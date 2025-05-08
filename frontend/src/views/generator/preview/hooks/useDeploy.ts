import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import api from '@/api/modules/generator'
import type { DeployOptions, DeploymentStatus, DeploymentLog } from '@/types/generator'

/**
 * 部署和下载功能Hook
 * 提供代码生成、部署、下载等功能
 */
export function useDeploy() {
  // 部署状态
  const loading = ref(false)
  const deploying = ref(false)
  const deploymentId = ref<number | null>(null)
  const deployStatus = ref<DeploymentStatus>('pending')
  const deployProgress = ref(0)
  const deployLogs = ref<DeploymentLog[]>([])
  const deployDestination = ref('')
  const deployOptions = ref<DeployOptions>({
    environment: 'development',
    autoMigrate: false,
    backup: true,
    registerRoutes: true
  })

  /**
   * 生成代码
   * @param configId 配置ID
   */
  const generateCode = async (configId: number) => {
    loading.value = true
    try {
      const response = await api.code.generate(configId)
      ElMessage.success('代码生成成功')
      return response
    } catch (error) {
      console.error('代码生成失败:', error)
      ElMessage.error('代码生成失败')
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * 下载生成的代码
   * @param configId 配置ID
   */
  const downloadCode = async (configId: number) => {
    loading.value = true
    try {
      const response = await api.code.download(configId)

      // 创建下载链接
      const url = window.URL.createObjectURL(new Blob([response]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `generated-code-${configId}.zip`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      ElMessage.success('下载成功')
    } catch (error) {
      console.error('下载失败:', error)
      ElMessage.error('下载失败')
    } finally {
      loading.value = false
    }
  }

  /**
   * 部署代码
   * @param configId 配置ID
   */
  const deployCode = async (configId: number) => {
    deploying.value = true
    deployStatus.value = 'pending'
    deployProgress.value = 0
    deployLogs.value = []

    try {
      const response = await api.deploy.deploy({
        configId,
        options: deployOptions.value
      })

      deploymentId.value = response.data.id
      deployDestination.value = response.data.destination

      // 开始轮询部署状态
      startPollingDeployStatus()

      return response
    } catch (error) {
      console.error('部署请求失败:', error)
      ElMessage.error('部署请求失败')
      deploying.value = false
      return null
    }
  }

  // 轮询状态的定时器
  let statusPollingInterval: number | null = null

  /**
   * 开始轮询部署状态
   */
  const startPollingDeployStatus = () => {
    if (statusPollingInterval) {
      clearInterval(statusPollingInterval)
    }

    // 设置2秒轮询一次
    statusPollingInterval = window.setInterval(async () => {
      if (!deploymentId.value) {
        stopPolling()
        return
      }

      try {
        // 获取部署状态
        const statusResponse = await api.deploy.status(deploymentId.value)
        const status = statusResponse.data.status
        const progress = statusResponse.data.progress || 0

        deployStatus.value = status
        deployProgress.value = progress

        // 如果部署完成或失败，停止轮询
        if (status === 'success' || status === 'failed' || status === 'canceled') {
          if (status === 'success') {
            ElMessage.success('部署成功')
          } else if (status === 'failed') {
            ElMessage.error('部署失败')
          } else {
            ElMessage.warning('部署已取消')
          }

          // 获取日志
          await fetchDeployLogs()

          // 停止轮询
          stopPolling()
          deploying.value = false
        }
      } catch (error) {
        console.error('获取部署状态失败:', error)
        stopPolling()
        deploying.value = false
      }
    }, 2000)
  }

  /**
   * 停止轮询
   */
  const stopPolling = () => {
    if (statusPollingInterval) {
      clearInterval(statusPollingInterval)
      statusPollingInterval = null
    }
  }

  /**
   * 获取部署日志
   */
  const fetchDeployLogs = async () => {
    if (!deploymentId.value) return

    try {
      const response = await api.deploy.logs(deploymentId.value)
      deployLogs.value = response.data || []
    } catch (error) {
      console.error('获取部署日志失败:', error)
    }
  }

  /**
   * 取消部署
   */
  const cancelDeploy = async () => {
    if (!deploymentId.value || !deploying.value) return

    try {
      await api.deploy.cancel(deploymentId.value)
      ElMessage.info('已发送取消部署请求')
    } catch (error) {
      console.error('取消部署失败:', error)
      ElMessage.error('取消部署失败')
    }
  }

  /**
   * 重试部署
   */
  const retryDeploy = async () => {
    if (!deploymentId.value) return

    deploying.value = true
    deployStatus.value = 'pending'
    deployProgress.value = 0

    try {
      await api.deploy.retry(deploymentId.value)
      ElMessage.info('已发送重试部署请求')

      // 开始轮询状态
      startPollingDeployStatus()
    } catch (error) {
      console.error('重试部署失败:', error)
      ElMessage.error('重试部署失败')
      deploying.value = false
    }
  }

  /**
   * 重置部署状态
   */
  const resetDeployState = () => {
    stopPolling()
    deploying.value = false
    deploymentId.value = null
    deployStatus.value = 'pending'
    deployProgress.value = 0
    deployLogs.value = []
    deployDestination.value = ''
  }

  /**
   * 更新部署选项
   */
  const updateDeployOptions = (options: Partial<DeployOptions>) => {
    deployOptions.value = {
      ...deployOptions.value,
      ...options
    }
  }

  return {
    loading,
    deploying,
    deploymentId,
    deployStatus,
    deployProgress,
    deployLogs,
    deployDestination,
    deployOptions,
    generateCode,
    downloadCode,
    deployCode,
    cancelDeploy,
    retryDeploy,
    resetDeployState,
    updateDeployOptions
  }
}
