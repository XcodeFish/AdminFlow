<template>
  <div class="trend-chart">
    <div class="trend-chart__header">
      <h3 class="trend-chart__title">{{ title }}</h3>
      <div class="trend-chart__actions" v-if="$slots.actions">
        <slot name="actions"></slot>
      </div>
    </div>
    <div ref="chartRef" class="trend-chart__content"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps<{
  title: string
  xAxis: string[]
  series: {
    name: string
    data: number[]
    color?: string
  }[]
}>()

const chartRef = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)
  updateChart()

  // 添加窗口大小变化的监听，用于自适应
  window.addEventListener('resize', handleResize)
}

// 更新图表
const updateChart = () => {
  if (!chartInstance) return

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderWidth: 1,
      borderColor: '#e2e8f0',
      padding: [8, 12],
      textStyle: {
        color: '#475569'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '5%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: props.xAxis,
      axisLine: {
        lineStyle: {
          color: '#e2e8f0'
        }
      },
      axisLabel: {
        color: '#64748b'
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      splitLine: {
        lineStyle: {
          color: '#e2e8f0'
        }
      },
      axisLabel: {
        color: '#64748b'
      }
    },
    series: props.series.map(item => ({
      name: item.name,
      type: 'line',
      data: item.data,
      smooth: true,
      showSymbol: false,
      itemStyle: {
        color: item.color
      },
      lineStyle: {
        width: 3
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: item.color ? item.color + '33' : 'rgba(59, 130, 246, 0.2)'
          },
          {
            offset: 1,
            color: item.color ? item.color + '05' : 'rgba(59, 130, 246, 0.01)'
          }
        ])
      }
    }))
  }

  chartInstance.setOption(option)
}

// 处理窗口大小变化
const handleResize = () => {
  chartInstance?.resize()
}

// 监听数据变化
watch(
  () => props.series,
  () => {
    updateChart()
  },
  { deep: true }
)

watch(
  () => props.xAxis,
  () => {
    updateChart()
  }
)

onMounted(() => {
  initChart()
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="scss" scoped>
.trend-chart {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1rem;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  &__title {
    font-size: 1.125rem;
    font-weight: 500;
    color: #333;
  }

  &__content {
    width: 100%;
    height: 20rem;
  }
}
</style>
