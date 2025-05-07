<template>
  <div class="operation-stats-container">
    <div class="section-title">操作日志统计</div>

    <el-row :gutter="20">
      <!-- 操作类型饼图 -->
      <el-col :span="12" :xs="24" :sm="24" :md="12">
        <el-card class="chart-card" shadow="hover" v-loading="loading">
          <template #header>
            <div class="card-header">
              <span>操作类型分布</span>
            </div>
          </template>
          <div ref="operationTypePieRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 操作状态饼图 -->
      <el-col :span="12" :xs="24" :sm="24" :md="12">
        <el-card class="chart-card" shadow="hover" v-loading="loading">
          <template #header>
            <div class="card-header">
              <span>操作结果统计</span>
            </div>
          </template>
          <div ref="statusPieRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 操作时间分布图 -->
    <el-row>
      <el-col :span="24">
        <el-card class="chart-card" shadow="hover" v-loading="loading">
          <template #header>
            <div class="card-header">
              <span>操作时间分布</span>
            </div>
          </template>
          <div ref="timeLineRef" class="chart-container wider-chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <!-- 热门操作模块 -->
      <el-col :span="12" :xs="24" :sm="24" :md="12">
        <el-card class="chart-card" shadow="hover" v-loading="loading">
          <template #header>
            <div class="card-header">
              <span>热门操作模块</span>
            </div>
          </template>
          <div ref="topModulesChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 活跃用户 -->
      <el-col :span="12" :xs="24" :sm="24" :md="12">
        <el-card class="chart-card" shadow="hover" v-loading="loading">
          <template #header>
            <div class="card-header">
              <span>活跃用户排行</span>
            </div>
          </template>
          <div ref="topUsersChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import useOperationLogStats from '../hooks/useOperationLogStats'
import useChartInitializer from '../hooks/useChartInitializer'

// 定义接收的属性
const props = defineProps<{
  getQueryParams: () => any | null
}>()

// 初始化操作日志统计数据
const {
  loading,
  statsData,
  operationTypePieRef,
  statusPieRef,
  timeLineRef,
  topModulesChartRef,
  topUsersChartRef,
  operationTypePieOption,
  statusPieOption,
  timeLineOption,
  topModulesOption,
  topUsersOption,
  fetchStatsData
} = useOperationLogStats(props.getQueryParams)

// 初始化图表
const { initChart } = useChartInitializer()

// 组件挂载后初始化图表
onMounted(() => {
  // 获取初始数据
  fetchStatsData()

  // 等待DOM更新后初始化图表
  setTimeout(() => {
    initChart(operationTypePieRef, operationTypePieOption, loading)
    initChart(statusPieRef, statusPieOption, loading)
    initChart(timeLineRef, timeLineOption, loading)
    initChart(topModulesChartRef, topModulesOption, loading)
    initChart(topUsersChartRef, topUsersOption, loading)
  }, 0)
})
</script>

<style lang="scss" scoped>
.operation-stats-container {
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 16px;
  padding-left: 10px;
  border-left: 4px solid #409EFF;
}

.chart-card {
  margin-bottom: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.chart-container {
  height: 300px;
  width: 100%;
}

.wider-chart {
  height: 400px;
}

@media (max-width: 768px) {
  .chart-container {
    height: 260px;
  }
}
</style>
