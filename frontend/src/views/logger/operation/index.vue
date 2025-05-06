<template>
  <div class="logger-operation-container">
    <!-- 搜索区域 -->
    <LogSearch @search="handleSearch" @reset="handleReset" />

    <!-- 操作按钮区域 -->
    <div class="action-bar">
      <div class="action-left">
        <el-button type="danger" :disabled="selectedRows.length === 0" @click="handleBatchDeleteClick">批量删除</el-button>
        <el-button type="danger" @click="handleCleanAllClick">清空日志</el-button>
      </div>
      <div class="action-right">
        <el-button type="primary" @click="handleExportClick">导出日志</el-button>
        <el-button type="primary" @click="fetchLogList">刷新</el-button>
      </div>
    </div>

    <!-- 日志表格 -->
    <LogTable :loading="loading" :log-list="logList" :total="total" :current-page="searchParams.page"
      :page-size="searchParams.pageSize" @selection-change="handleSelectionChange" @current-change="handleCurrentChange"
      @size-change="handleSizeChange" @delete="handleDelete" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { OperationLog, OperationLogQueryParams } from '@/types/logger'
import LogSearch from './components/LogSearch.vue'
import LogTable from './components/LogTable.vue'
import useOperationLogTable from './hooks/useOperationLogTable'
import useOperationLogActions from './hooks/useOperationLogActions'

// 表格相关逻辑
const {
  loading,
  logList,
  total,
  searchParams,
  fetchLogList,
  handleCurrentChange,
  handleSizeChange
} = useOperationLogTable()

// 日志操作相关逻辑
const {
  handleDelete,
  handleBatchDelete,
  handleCleanAll,
  handleExport
} = useOperationLogActions(fetchLogList)

// 选中的行
const selectedRows = ref<OperationLog[]>([])

// 初始化
onMounted(() => {
  fetchLogList()
})

// 搜索处理
const handleSearch = (params: OperationLogQueryParams) => {
  // 合并查询参数
  Object.assign(searchParams, params)
  searchParams.page = 1 // 重置到第一页
  fetchLogList()
}

// 重置处理
const handleReset = () => {
  // 重置查询参数
  Object.keys(searchParams).forEach(key => {
    if (key !== 'page' && key !== 'pageSize') {
      (searchParams as any)[key] = undefined
    }
  })
  searchParams.page = 1
  fetchLogList()
}

// 选择行变化
const handleSelectionChange = (rows: OperationLog[]) => {
  selectedRows.value = rows
}

// 操作事件处理函数 - 包装器
const handleBatchDeleteClick = () => {
  handleBatchDelete(selectedRows.value)
}

const handleCleanAllClick = () => {
  handleCleanAll()
}

const handleExportClick = () => {
  handleExport(searchParams)
}
</script>

<style lang="scss" scoped>
.logger-operation-container {
  padding: 20px;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  background-color: #fff;
  padding: 16px;
  border-radius: 4px;

  .action-left {
    display: flex;
    gap: 8px;
  }

  .action-right {
    display: flex;
    gap: 8px;
  }
}
</style>
