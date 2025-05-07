<template>
  <div class="api-log-table">
    <el-table v-loading="loading" :data="logList" border style="width: 100%" @selection-change="handleSelectionChange"
      :row-class-name="tableRowClassName">
      <el-table-column type="selection" width="50" />
      <el-table-column prop="traceId" label="追踪ID" width="100" show-overflow-tooltip />
      <el-table-column prop="requestMethod" label="请求方法" width="100" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.requestMethod" :type="getMethodTagType(row.requestMethod)" effect="plain">
            {{ row.requestMethod }}
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="requestUrl" label="请求路径" min-width="250" show-overflow-tooltip />
      <el-table-column prop="status" label="状态码" width="100" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.status" :type="getStatusTagType(row.status)" effect="plain">
            {{ row.status }}
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="errorLevel" label="错误级别" width="100" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.errorLevel" :type="getErrorLevelTagType(row.errorLevel)" effect="plain">
            {{ row.errorLevel }}
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="duration" label="耗时(ms)" width="100" align="center" sortable />
      <el-table-column prop="requestIp" label="IP地址" width="130" />
      <el-table-column prop="username" label="用户名" width="120" show-overflow-tooltip />
      <el-table-column prop="requestTime" label="请求时间" width="180" sortable>
        <template #default="{ row }">
          {{ formatDateTime(row.requestTime) }}
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="120">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleDetail(row)">详情</el-button>
          <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination :current-page="currentPage" :page-size="pageSize" :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange"
        @current-change="handleCurrentChange" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { ApiLog } from '@/types/logger'
import { formatDate } from '@/utils/format'

// 组件属性
const props = defineProps<{
  loading: boolean
  logList: ApiLog[]
  total: number
  currentPage: number
  pageSize: number
}>()

// 组件事件
const emit = defineEmits<{
  (e: 'selection-change', rows: ApiLog[]): void
  (e: 'current-change', page: number): void
  (e: 'size-change', size: number): void
  (e: 'delete', row: ApiLog): void
}>()

const router = useRouter()

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

// 表格行样式
const tableRowClassName = ({ row }: { row: ApiLog }) => {
  if (row.status >= 500 || row.errorLevel === 'ERROR') {
    return 'error-row'
  }
  if (row.status >= 400 || row.errorLevel === 'WARN') {
    return 'warning-row'
  }
  return ''
}

// 选择行变化
const handleSelectionChange = (rows: ApiLog[]) => {
  emit('selection-change', rows)
}

// 页码变化
const handleCurrentChange = (page: number) => {
  emit('current-change', page)
}

// 每页数量变化
const handleSizeChange = (size: number) => {
  emit('size-change', size)
}

// 查看详情
const handleDetail = (row: ApiLog) => {
  router.push({ path: `/logger/apiLog/detail/${row.id}` })
}

// 删除
const handleDelete = (row: ApiLog) => {
  emit('delete', row)
}
</script>

<style lang="scss" scoped>
.api-log-table {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;

  :deep(.error-row) {
    background-color: #fff0f0;
  }

  :deep(.warning-row) {
    background-color: #fdf6ec;
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
