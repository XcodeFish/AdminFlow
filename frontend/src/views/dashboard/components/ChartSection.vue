<template>
  <div class="chart-section">
    <el-row :gutter="20">
      <el-col :span="16">
        <el-card shadow="hover" class="chart-card">
          <div class="chart-title">近七日用户增长趋势</div>
          <div class="chart-container" id="userGrowthChart"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="chart-card">
          <div class="chart-title">用户分布</div>
          <div class="chart-container" id="userDistributionChart"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useCharts } from '../hooks/useCharts'

// 使用图表hook
const { initCharts, disposeCharts } = useCharts()

onMounted(() => {
  initCharts()
})

onUnmounted(() => {
  disposeCharts()
})
</script>

<style scoped>
.chart-section {
  margin-bottom: 20px;
}

.chart-card {
  padding: 10px;
}

.chart-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 15px;
}

.chart-container {
  height: 300px;
}
</style>
