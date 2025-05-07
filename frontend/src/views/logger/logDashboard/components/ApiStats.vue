<template>
  <div class="api-stats-container">
    <div class="section-title">接口日志统计</div>

    <el-row :gutter="20">
      <!-- 请求方法饼图 -->
      <el-col :span="12" :xs="24" :sm="24" :md="12">
        <el-card class="chart-card" shadow="hover" v-loading="loading">
          <template #header>
            <div class="card-header">
              <span>请求方法分布</span>
            </div>
          </template>
          <div ref="methodPieRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 状态码饼图 -->
      <el-col :span="12" :xs="24" :sm="24" :md="12">
        <el-card class="chart-card" shadow="hover" v-loading="loading">
          <template #header>
            <div class="card-header">
              <span>状态码分布</span>
            </div>
          </template>
          <div ref="statusPieRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 接口调用时间分布图 -->
    <el-row>
      <el-col :span="24">
        <el-card class="chart-card" shadow="hover" v-loading="loading">
          <template #header>
            <div class="card-header">
              <span>接口调用时间分布</span>
            </div>
          </template>
          <div ref="timeLineRef" class="chart-container wider-chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <!-- 最慢接口 -->
      <el-col :span="12" :xs="24" :sm="24" :md="12">
        <el-card class="chart-card" shadow="hover" v-loading="loading">
          <template #header>
            <div class="card-header">
              <span>响应最慢接口TOP10</span>
            </div>
          </template>
          <div ref="topSlowApisChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 错误率最高接口 -->
      <el-col :span="12" :xs="24" :sm="24" :md="12">
        <el-card class="chart-card" shadow="hover" v-loading="loading">
          <template #header>
            <div class="card-header">
              <span>错误率最高接口TOP10</span>
            </div>
          </template>
          <div ref="topErrorApisChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <div v-if="!hasData" class="no-data">
      <el-empty description="暂无数据" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import useApiLogStats from '../hooks/useApiLogStats'
import useChartInitializer from '../hooks/useChartInitializer'

// 定义接收的属性
const props = defineProps<{
  getQueryParams: () => any | null
}>()

// 初始化接口日志统计数据
const {
  loading,
  statsData,
  methodPieRef,
  statusPieRef,
  timeLineRef,
  topSlowApisChartRef,
  topErrorApisChartRef,
  methodPieOption,
  statusPieOption,
  timeLineOption,
  topSlowApisOption,
  topErrorApisOption,
  fetchStatsData
} = useApiLogStats(props.getQueryParams)

// 判断是否有数据
const hasData = computed(() => !!statsData.value)

// 初始化图表
const { initChart } = useChartInitializer()

// 组件挂载后初始化图表
onMounted(() => {
  // 获取初始数据
  fetchStatsData()

  // 等待DOM更新后初始化图表
  setTimeout(() => {
    initChart(methodPieRef, methodPieOption, loading)
    initChart(statusPieRef, statusPieOption, loading)
    initChart(timeLineRef, timeLineOption, loading)
    initChart(topSlowApisChartRef, topSlowApisOption, loading)
    initChart(topErrorApisChartRef, topErrorApisOption, loading)
  }, 0)
})
</script>

<style lang="scss" scoped>
.api-stats-container {
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

.no-data {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.8);
  z-index: 10;
}

@media (max-width: 768px) {
  .chart-container {
    height: 260px;
  }
}
</style>
