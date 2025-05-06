<template>
  <div class="log-detail">
    <div class="detail-header">
      <h2>操作日志详情</h2>
      <el-button @click="handleBack">返回</el-button>
    </div>

    <el-card v-loading="loading" class="detail-card">
      <el-descriptions title="基本信息" :column="3" border>
        <el-descriptions-item label="用户名">{{ logDetail.username }}</el-descriptions-item>
        <el-descriptions-item label="用户昵称">{{ logDetail.nickname }}</el-descriptions-item>
        <el-descriptions-item label="操作类型">
          <el-tag
            :type="getOperationTypeTag(logDetail.operationType) as 'success' | 'warning' | 'info' | 'primary' | 'danger'">
            {{ getOperationTypeLabel(logDetail.operationType) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作模块">{{ logDetail.module }}</el-descriptions-item>
        <el-descriptions-item label="操作状态">
          <el-tag :type="logDetail.status === 1 ? 'success' : 'danger'">
            {{ logDetail.status === 1 ? '成功' : '失败' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="耗时">{{ logDetail.duration }}ms</el-descriptions-item>
        <el-descriptions-item label="操作内容" :span="3">{{ logDetail.content }}</el-descriptions-item>
        <el-descriptions-item label="操作URL" :span="3">{{ logDetail.requestUrl }}</el-descriptions-item>
        <el-descriptions-item label="操作方法">{{ logDetail.requestMethod }}</el-descriptions-item>
        <el-descriptions-item label="IP地址">{{ logDetail.ip }}</el-descriptions-item>
        <el-descriptions-item label="IP归属地">{{ logDetail.location }}</el-descriptions-item>
        <el-descriptions-item label="用户代理" :span="3">{{ logDetail.userAgent }}</el-descriptions-item>
        <el-descriptions-item label="操作时间">{{ formatDateTime(logDetail.operationTime) }}</el-descriptions-item>
        <el-descriptions-item label="创建时间" v-if="logDetail.createTime">{{ formatDateTime(logDetail.createTime)
        }}</el-descriptions-item>
        <el-descriptions-item label="创建人" v-if="logDetail.createBy">{{ logDetail.createBy }}</el-descriptions-item>
      </el-descriptions>

      <!-- 请求参数与响应结果 -->
      <div class="detail-section" v-if="logDetail.requestParams || logDetail.responseResult">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="请求参数" name="request" v-if="logDetail.requestParams">
            <div class="json-viewer">
              <JsonViewer :value="logDetail.requestParams" />
            </div>
          </el-tab-pane>
          <el-tab-pane label="响应结果" name="response" v-if="logDetail.responseResult">
            <div class="json-viewer">
              <JsonViewer :value="logDetail.responseResult" />
            </div>
          </el-tab-pane>
          <el-tab-pane label="错误信息" name="error" v-if="logDetail.errorMessage">
            <div class="error-message">{{ logDetail.errorMessage }}</div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getOperationLogDetail } from '@/api/modules/logger'
import type { OperationLog } from '@/types/logger'
import { OperationType } from '@/types/logger'
import { formatDate } from '@/utils/format'
import JsonViewer from '@/components/common/JsonViewer.vue'

const router = useRouter()
const route = useRoute()

// 日志ID
const logId = computed(() => Number(route.params.id))

// 日志详情
const logDetail = ref<OperationLog>({} as OperationLog)
const loading = ref(false)
const activeTab = ref('request')

// 操作类型映射
const operationTypeMap: Record<string, { label: string, type: string }> = {
  [OperationType.LOGIN]: { label: '登录', type: 'info' },
  [OperationType.LOGOUT]: { label: '登出', type: 'info' },
  [OperationType.INSERT]: { label: '新增', type: 'success' },
  [OperationType.UPDATE]: { label: '修改', type: 'warning' },
  [OperationType.DELETE]: { label: '删除', type: 'danger' },
  [OperationType.EXPORT]: { label: '导出', type: 'primary' },
  [OperationType.IMPORT]: { label: '导入', type: 'primary' },
  [OperationType.OTHER]: { label: '其他', type: '' }
}

// 获取操作类型标签
const getOperationTypeLabel = (type: string) => {
  return operationTypeMap[type as OperationType]?.label || type
}

// 获取操作类型标签样式
const getOperationTypeTag = (type: string) => {
  return operationTypeMap[type as OperationType]?.type || ''
}

// 格式化日期时间
const formatDateTime = (dateTime?: string) => {
  if (!dateTime) return '-'
  return formatDate(dateTime, 'yyyy-MM-dd HH:mm:ss')
}

// 获取日志详情
const fetchLogDetail = async () => {
  if (!logId.value) return

  try {
    loading.value = true
    const { data } = await getOperationLogDetail(logId.value)
    if (data) {
      logDetail.value = data

      // 默认选择第一个有内容的标签页
      if (data.requestParams) {
        activeTab.value = 'request'
      } else if (data.responseResult) {
        activeTab.value = 'response'
      } else if (data.errorMessage) {
        activeTab.value = 'error'
      }
    }
  } catch (error) {
    console.error('获取日志详情失败', error)
  } finally {
    loading.value = false
  }
}

// 返回列表
const handleBack = () => {
  router.push('/logger/operation')
}

// 初始化
onMounted(() => {
  fetchLogDetail()
})
</script>

<style lang="scss" scoped>
.log-detail {
  padding: 20px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h2 {
    margin: 0;
  }
}

.detail-card {
  margin-bottom: 20px;
}

.detail-section {
  margin-top: 20px;
}

.json-viewer {
  margin-top: 10px;
  padding: 10px;
  background-color: #f8f8f8;
  border-radius: 4px;
  max-height: 500px;
  overflow: auto;
}

.error-message {
  margin-top: 10px;
  padding: 10px;
  background-color: var(--el-color-danger-light-9);
  color: var(--el-color-danger);
  border-radius: 4px;
  line-height: 1.5;
  white-space: pre-wrap;
}
</style>
