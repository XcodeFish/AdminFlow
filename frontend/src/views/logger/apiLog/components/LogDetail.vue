<template>
  <div class="api-log-detail">
    <el-descriptions title="基本信息" :column="3" border>
      <el-descriptions-item label="追踪ID" label-align="right" width="150px">
        <el-tag size="small">{{ logDetail.traceId }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="请求方法" label-align="right" width="150px">
        <el-tag v-if="logDetail.requestMethod" :type="getMethodTagType(logDetail.requestMethod)" size="small">
          {{ logDetail.requestMethod }}
        </el-tag>
        <span v-else>-</span>
      </el-descriptions-item>
      <el-descriptions-item label="响应状态" label-align="right" width="150px">
        <el-tag v-if="logDetail.status" :type="getStatusTagType(logDetail.status)" size="small">
          {{ logDetail.status }}
        </el-tag>
        <span v-else>-</span>
      </el-descriptions-item>
      <el-descriptions-item label="请求URL" label-align="right" :span="3">
        {{ logDetail.requestUrl }}
      </el-descriptions-item>
      <el-descriptions-item label="请求IP" label-align="right">
        {{ logDetail.requestIp }}
      </el-descriptions-item>
      <el-descriptions-item label="用户ID" label-align="right">
        {{ logDetail.userId || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="用户名" label-align="right">
        {{ logDetail.username || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="请求时间" label-align="right">
        {{ formatDateTime(logDetail.requestTime) }}
      </el-descriptions-item>
      <el-descriptions-item label="响应时间" label-align="right">
        {{ formatDateTime(logDetail.responseTime) }}
      </el-descriptions-item>
      <el-descriptions-item label="执行耗时" label-align="right">
        {{ logDetail.duration }} ms
      </el-descriptions-item>
      <el-descriptions-item label="错误级别" label-align="right" v-if="logDetail.errorLevel">
        <el-tag :type="getErrorLevelTagType(logDetail.errorLevel)" size="small">
          {{ logDetail.errorLevel }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="User-Agent" label-align="right" :span="3">
        {{ logDetail.userAgent || '-' }}
      </el-descriptions-item>
    </el-descriptions>

    <el-tabs v-model="activeTab" class="detail-tabs">
      <el-tab-pane label="请求头" name="requestHeaders">
        <JsonViewer v-if="logDetail.requestHeaders" :value="logDetail.requestHeaders" />
        <el-empty v-else description="无请求头信息" />
      </el-tab-pane>
      <el-tab-pane label="请求参数" name="requestParams">
        <JsonViewer v-if="logDetail.requestParams" :value="logDetail.requestParams" />
        <el-empty v-else description="无请求参数" />
      </el-tab-pane>
      <el-tab-pane label="响应头" name="responseHeaders">
        <JsonViewer v-if="logDetail.responseHeaders" :value="logDetail.responseHeaders" />
        <el-empty v-else description="无响应头信息" />
      </el-tab-pane>
      <el-tab-pane label="响应内容" name="responseBody">
        <JsonViewer v-if="logDetail.responseBody" :value="logDetail.responseBody" />
        <el-empty v-else description="无响应内容" />
      </el-tab-pane>
      <el-tab-pane label="错误信息" name="errorInfo" v-if="logDetail.errorMessage">
        <div class="error-message">
          <h4>错误信息：</h4>
          <pre>{{ logDetail.errorMessage }}</pre>

          <h4 v-if="logDetail.stackTrace">堆栈跟踪：</h4>
          <pre v-if="logDetail.stackTrace">{{ logDetail.stackTrace }}</pre>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ApiLog } from '@/types/logger'
import { formatDate } from '@/utils/format'
import JsonViewer from '@/components/common/JsonViewer.vue'

// 组件属性
const props = defineProps<{
  logDetail: ApiLog
}>()

const activeTab = ref('requestParams')

// 格式化日期时间
const formatDateTime = (dateString?: string) => {
  if (!dateString) return '-'
  return formatDate(dateString, 'yyyy-MM-dd HH:mm:ss')
}

// 获取请求方法对应的Tag类型
const getMethodTagType = (method: string): 'success' | 'warning' | 'info' | 'primary' | 'danger' => {
  const map: Record<string, 'success' | 'warning' | 'info' | 'primary' | 'danger'> = {
    GET: 'success',
    POST: 'primary',
    PUT: 'warning',
    DELETE: 'danger',
    PATCH: 'info'
  }
  return map[method] || 'info'
}

// 获取状态码对应的Tag类型
const getStatusTagType = (status: number): 'success' | 'warning' | 'info' | 'primary' | 'danger' => {
  if (status >= 200 && status < 300) return 'success'
  if (status >= 300 && status < 400) return 'warning'
  if (status >= 400) return 'danger'
  return 'info'
}

// 获取错误级别对应的Tag类型
const getErrorLevelTagType = (level: string): 'success' | 'warning' | 'info' | 'primary' | 'danger' => {
  const map: Record<string, 'success' | 'warning' | 'info' | 'primary' | 'danger'> = {
    INFO: 'info',
    WARN: 'warning',
    ERROR: 'danger'
  }
  return map[level] || 'info'
}
</script>

<style lang="scss" scoped>
.api-log-detail {
  .detail-tabs {
    margin-top: 20px;
  }

  .error-message {
    color: #f56c6c;

    pre {
      background-color: #fff5f5;
      padding: 10px;
      border-radius: 4px;
      overflow: auto;
      font-family: monospace;
      font-size: 14px;
      margin-top: 10px;
    }
  }
}
</style>
