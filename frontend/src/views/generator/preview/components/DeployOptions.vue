<template>
  <div class="deploy-options-container">
    <el-tabs v-model="activeTab" class="deploy-tabs">
      <el-tab-pane label="部署配置" name="settings">
        <div class="tab-content settings-tab">
          <el-form :model="options" label-position="top" class="deploy-form">
            <el-form-item label="部署环境">
              <el-select v-model="options.environment" class="full-width">
                <el-option label="开发环境" value="development"></el-option>
                <el-option label="测试环境" value="testing"></el-option>
                <el-option label="生产环境" value="production"></el-option>
              </el-select>
            </el-form-item>

            <el-form-item>
              <el-checkbox v-model="options.autoMigrate">自动执行数据库迁移</el-checkbox>
            </el-form-item>

            <el-form-item>
              <el-checkbox v-model="options.backup">部署前创建备份</el-checkbox>
            </el-form-item>

            <el-form-item>
              <el-checkbox v-model="options.registerRoutes">自动注册路由</el-checkbox>
            </el-form-item>

            <el-form-item label="自定义部署路径" v-if="options.environment === 'development'">
              <el-input v-model="options.destinationPath" placeholder="可选，默认使用项目路径"></el-input>
            </el-form-item>
          </el-form>

          <div class="action-buttons">
            <el-button type="primary" @click="handleGenerate" :loading="loading">
              生成代码
            </el-button>
            <el-button type="success" @click="handleDeploy" :loading="deploying" :disabled="!canDeploy">
              {{ deployButtonText }}
            </el-button>
            <el-button @click="handleDownload" :loading="loading" :disabled="!canDownload">
              下载代码
            </el-button>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="部署状态" name="status">
        <div class="tab-content status-tab">
          <template v-if="deploying || deployStatus !== 'pending'">
            <div class="deploy-status">
              <div class="status-header">
                <div class="status-title">
                  <el-tag :type="statusTagType">{{ statusText }}</el-tag>
                  <span class="deployment-id" v-if="deploymentId">ID: {{ deploymentId }}</span>
                </div>
                <div v-if="deploying" class="status-actions">
                  <el-button size="small" type="danger" @click="handleCancel">取消</el-button>
                </div>
              </div>

              <el-progress :percentage="deployProgress" :status="progressStatus" :striped="deploying"
                :striped-flow="deploying"></el-progress>

              <div class="status-info" v-if="deployDestination">
                <span>部署路径: {{ deployDestination }}</span>
              </div>

              <div class="deploy-logs">
                <p class="logs-title">部署日志:</p>
                <div class="logs-content">
                  <div v-if="deployLogs.length === 0" class="no-logs">
                    暂无日志信息
                  </div>
                  <div v-else class="log-entries">
                    <div v-for="(log, index) in displayLogs" :key="index" class="log-entry" :class="log.level">
                      <span class="log-time">{{ formatTime(log.timestamp) }}</span>
                      <span class="log-level">{{ log.level.toUpperCase() }}</span>
                      <span class="log-message">{{ log.message }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="deployStatus === 'failed'" class="retry-action">
                <el-button type="warning" @click="handleRetry">重试部署</el-button>
              </div>
            </div>
          </template>

          <div v-else class="no-deployment">
            <el-empty description="暂无部署任务">
              <template #image>
                <i class="el-icon CloudDeployment" style="font-size: 60px; color: var(--el-color-info-light-3);"></i>
              </template>
              <el-button type="primary" @click="activeTab = 'settings'">配置部署</el-button>
            </el-empty>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import type { DeployOptions, DeploymentStatus, DeploymentLog } from '@/types/generator'

// Props
const props = defineProps<{
  configId: number
  loading: boolean
  deploying: boolean
  deploymentId: number | null
  deployStatus: DeploymentStatus
  deployProgress: number
  deployLogs: DeploymentLog[]
  deployDestination: string
  options: DeployOptions
}>()

// Emits
const emit = defineEmits<{
  (e: 'generate'): void
  (e: 'deploy'): void
  (e: 'download'): void
  (e: 'cancel'): void
  (e: 'retry'): void
  (e: 'update:options', options: DeployOptions): void
}>()

// 当前激活的标签页
const activeTab = ref<'settings' | 'status'>('settings')

// 部署按钮文本
const deployButtonText = computed(() => {
  if (props.deploying) return '部署中...'
  return '部署代码'
})

// 状态标签类型
const statusTagType = computed(() => {
  switch (props.deployStatus) {
    case 'running':
      return 'warning'
    case 'success':
      return 'success'
    case 'failed':
      return 'danger'
    case 'canceled':
      return 'info'
    default:
      return 'info'
  }
})

// 状态文本
const statusText = computed(() => {
  switch (props.deployStatus) {
    case 'pending':
      return '等待部署'
    case 'running':
      return '部署中'
    case 'success':
      return '部署成功'
    case 'failed':
      return '部署失败'
    case 'canceled':
      return '已取消'
    default:
      return '未知状态'
  }
})

// 进度条状态
const progressStatus = computed(() => {
  if (props.deployStatus === 'success') return 'success'
  if (props.deployStatus === 'failed') return 'exception'
  if (props.deployStatus === 'canceled') return ''
  return ''
})

// 要显示的日志（最新的10条）
const displayLogs = computed(() => {
  return [...props.deployLogs].reverse().slice(0, 10)
})

// 是否可以部署
const canDeploy = computed(() => {
  return !props.loading && props.configId > 0 && !props.deploying
})

// 是否可以下载
const canDownload = computed(() => {
  return !props.loading && props.configId > 0
})

// 格式化时间
const formatTime = (timestamp: string): string => {
  return dayjs(timestamp).format('HH:mm:ss')
}

// 部署状态改变时自动切换到状态标签页
watch(
  () => props.deploying,
  (newVal) => {
    if (newVal) {
      activeTab.value = 'status'
    }
  }
)

// 处理生成代码
const handleGenerate = () => {
  emit('generate')
}

// 处理部署代码
const handleDeploy = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要部署生成的代码吗？此操作可能会覆盖现有代码。',
      '部署确认',
      {
        confirmButtonText: '确认部署',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    emit('deploy')
  } catch {
    // 用户取消操作
  }
}

// 处理下载代码
const handleDownload = () => {
  emit('download')
}

// 处理取消部署
const handleCancel = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要取消正在进行的部署吗？',
      '取消部署',
      {
        confirmButtonText: '确认取消',
        cancelButtonText: '返回',
        type: 'warning'
      }
    )
    emit('cancel')
  } catch {
    // 用户取消操作
  }
}

// 处理重试部署
const handleRetry = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要重试部署吗？',
      '重试部署',
      {
        confirmButtonText: '确认重试',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    emit('retry')
  } catch {
    // 用户取消操作
  }
}

// 更新选项
watch(
  () => props.options,
  (newVal) => {
    emit('update:options', newVal)
  },
  { deep: true }
)
</script>

<style scoped>
.deploy-options-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.deploy-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.el-tabs__content) {
  flex: 1;
  overflow: auto;
}

.tab-content {
  padding: 15px;
  height: 100%;
}

.settings-tab {
  display: flex;
  flex-direction: column;
}

.deploy-form {
  flex: 1;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  justify-content: center;
}

.full-width {
  width: 100%;
}

.status-tab {
  display: flex;
  flex-direction: column;
}

.deploy-status {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.deployment-id {
  font-size: 0.8rem;
  color: var(--el-text-color-secondary);
}

.status-info {
  font-size: 0.9rem;
  color: var(--el-text-color-regular);
  margin-top: 5px;
}

.deploy-logs {
  margin-top: 15px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  max-height: 300px;
  overflow-y: auto;
  background-color: var(--el-bg-color-page);
}

.logs-title {
  font-weight: bold;
  padding: 10px;
  border-bottom: 1px solid var(--el-border-color-light);
  margin: 0;
  background-color: var(--el-bg-color);
}

.logs-content {
  padding: 10px;
}

.no-logs {
  color: var(--el-text-color-secondary);
  font-style: italic;
  text-align: center;
  padding: 20px 0;
}

.log-entries {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.log-entry {
  font-family: monospace;
  font-size: 0.85rem;
  display: flex;
  gap: 10px;
  padding: 5px;
  border-radius: 3px;
}

.log-entry.info {
  background-color: var(--el-color-info-light-9);
}

.log-entry.warning {
  background-color: var(--el-color-warning-light-9);
}

.log-entry.error {
  background-color: var(--el-color-danger-light-9);
}

.log-time {
  color: var(--el-text-color-secondary);
  min-width: 80px;
}

.log-level {
  font-weight: bold;
  min-width: 70px;
}

.log-level.info {
  color: var(--el-color-info);
}

.log-level.warning {
  color: var(--el-color-warning);
}

.log-level.error {
  color: var(--el-color-danger);
}

.log-message {
  flex: 1;
  word-break: break-word;
}

.retry-action {
  margin-top: 15px;
  display: flex;
  justify-content: center;
}

.no-deployment {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
</style>
