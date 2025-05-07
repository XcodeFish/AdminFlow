import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import type { Ref } from 'vue'
import type { EChartsOption } from 'echarts'

export default function useChartInitializer() {
  // 图表实例映射表
  const chartInstances = new Map<HTMLElement, echarts.ECharts>()

  // 窗口大小变化处理
  const handleResize = () => {
    chartInstances.forEach((chart) => {
      chart.resize()
    })
  }

  // 初始化图表
  const initChart = (
    chartRef: Ref<HTMLElement | null>,
    option: Ref<EChartsOption>,
    loading: Ref<boolean> = ref(false)
  ) => {
    if (!chartRef.value) return

    // 如果已存在实例，先销毁
    if (chartInstances.has(chartRef.value)) {
      chartInstances.get(chartRef.value)?.dispose()
    }

    // 创建新实例
    const chart = echarts.init(chartRef.value)
    chartInstances.set(chartRef.value, chart)

    // 设置加载状态
    if (loading.value) {
      chart.showLoading()
    } else {
      chart.hideLoading()
    }

    // 设置配置
    chart.setOption(option.value)

    // 监听配置变化
    watch(
      option,
      (newOption) => {
        if (chartRef.value && chartInstances.has(chartRef.value)) {
          const chartInstance = chartInstances.get(chartRef.value)
          chartInstance?.setOption(newOption, { notMerge: true })
        }
      },
      { deep: true }
    )

    // 监听加载状态变化
    watch(loading, (newLoading) => {
      if (chartRef.value && chartInstances.has(chartRef.value)) {
        const chartInstance = chartInstances.get(chartRef.value)
        if (newLoading) {
          chartInstance?.showLoading()
        } else {
          chartInstance?.hideLoading()
        }
      }
    })

    return chart
  }

  // 销毁所有图表
  const disposeAllCharts = () => {
    chartInstances.forEach((chart) => {
      chart.dispose()
    })
    chartInstances.clear()
  }

  // 组件挂载时添加窗口大小变化监听
  onMounted(() => {
    window.addEventListener('resize', handleResize)
  })

  // 组件卸载时移除监听并销毁图表
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    disposeAllCharts()
  })

  return {
    initChart,
    disposeAllCharts
  }
}
