<template>
  <div class="log-dashboard-container">
    <h1 class="page-title">日志统计分析</h1>

    <el-row :gutter="20">
      <!-- 左侧：时间范围选择器 -->
      <el-col :span="6" :xs="24" :sm="24" :md="8" :lg="6">
        <TimeRangeSelector :time-range="timeRange" :time-granularity="timeGranularity"
          :granularity-options="granularityOptions" :loading="loading" @time-range-change="handleTimeRangeChange"
          @granularity-change="handleGranularityChange" @quick-select="handleQuickSelect" @search="handleSearch" />
      </el-col>

      <!-- 右侧：统计图表 -->
      <el-col :span="18" :xs="24" :sm="24" :md="16" :lg="18">
        <!-- 操作日志统计 -->
        <OperationStats :get-query-params="getQueryParams" />

        <!-- 接口日志统计 -->
        <ApiStats :get-query-params="getQueryParams" />
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import TimeRangeSelector from './components/TimeRangeSelector.vue'
import OperationStats from './components/OperationStats.vue'
import ApiStats from './components/ApiStats.vue'
import useLogDashboard from './hooks/useLogDashboard'

// 初始化日志统计相关状态和方法
const {
  loading,
  timeRange,
  timeGranularity,
  granularityOptions,
  getQueryParams,
  handleTimeRangeChange,
  handleGranularityChange,
  handleQuickSelect
} = useLogDashboard()

// 搜索方法 - 这里实际上不需要做什么，因为数据获取逻辑在子组件中通过watch监听getQueryParams变化来实现
const handleSearch = () => {
  // 这里可以添加一些额外的逻辑，例如记录搜索历史等
  console.log('执行日志统计查询:', getQueryParams())
}

// 组件挂载时初始化
onMounted(() => {
  // 可以在这里添加一些初始化逻辑
})
</script>

<style lang="scss" scoped>
.log-dashboard-container {
  padding: 20px;
}

.page-title {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #303133;
}

@media (max-width: 768px) {
  .log-dashboard-container {
    padding: 15px;
  }

  .page-title {
    font-size: 20px;
    margin-bottom: 15px;
  }
}
</style>
