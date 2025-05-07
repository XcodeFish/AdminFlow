import { ref, onMounted, watch, computed } from 'vue'
import { getOperationLogStats } from '@/api/modules/logger'
import { ElMessage } from 'element-plus'
import type { EChartsOption } from 'echarts'
import type { OperationLogStats } from '@/types/logger'

export default function useOperationLogStats(getQueryParams: () => any | null) {
  // 数据加载状态
  const loading = ref(false)

  // 统计数据
  const statsData = ref<OperationLogStats | null>(null)

  // 图表实例和配置
  const operationTypePieRef = ref<HTMLElement | null>(null)
  const statusPieRef = ref<HTMLElement | null>(null)
  const timeLineRef = ref<HTMLElement | null>(null)
  const topModulesChartRef = ref<HTMLElement | null>(null)
  const topUsersChartRef = ref<HTMLElement | null>(null)

  // 获取统计数据
  const fetchStatsData = async () => {
    const params = getQueryParams()
    if (!params) return

    try {
      loading.value = true
      const { data } = await getOperationLogStats(params)

      if (data) {
        statsData.value = data
      } else {
        ElMessage.warning('未获取到操作日志统计数据')
      }
    } catch (error) {
      console.error('获取操作日志统计数据失败', error)
      ElMessage.error('获取操作日志统计数据失败')
    } finally {
      loading.value = false
    }
  }

  // 操作类型饼图配置
  const operationTypePieOption = computed<EChartsOption>(() => {
    if (!statsData.value?.operationTypesCount) return {}

    const data = Object.entries(statsData.value.operationTypesCount).map(([name, value]) => {
      return { name, value }
    })

    return {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: data.map((item) => item.name)
      },
      series: [
        {
          name: '操作类型',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '14',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data
        }
      ]
    }
  })

  // 操作状态饼图配置
  const statusPieOption = computed<EChartsOption>(() => {
    if (!statsData.value?.operationStatusCount) return {}

    const { success, fail } = statsData.value.operationStatusCount

    return {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: ['成功', '失败']
      },
      series: [
        {
          name: '操作状态',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          data: [
            { value: success, name: '成功', itemStyle: { color: '#67C23A' } },
            { value: fail, name: '失败', itemStyle: { color: '#F56C6C' } }
          ]
        }
      ]
    }
  })

  // 操作时间分布图配置
  const timeLineOption = computed<EChartsOption>(() => {
    if (!statsData.value?.timeDistribution) return {}

    const data = statsData.value.timeDistribution

    return {
      tooltip: {
        trigger: 'axis'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data.map((item) => item.time)
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '操作次数',
          type: 'line',
          stack: 'Total',
          data: data.map((item) => item.count),
          areaStyle: {},
          emphasis: {
            focus: 'series'
          },
          smooth: true
        }
      ]
    }
  })

  // 热门模块图表配置
  const topModulesOption = computed<EChartsOption>(() => {
    if (!statsData.value?.topModules) return {}

    const data = statsData.value.topModules.slice(0, 10)

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value'
      },
      yAxis: {
        type: 'category',
        data: data.map((item) => item.name || '未知模块')
      },
      series: [
        {
          name: '操作次数',
          type: 'bar',
          data: data.map((item) => item.count)
        }
      ]
    }
  })

  // 活跃用户图表配置
  const topUsersOption = computed<EChartsOption>(() => {
    if (!statsData.value?.topUsers) return {}

    const data = statsData.value.topUsers.slice(0, 10)

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value'
      },
      yAxis: {
        type: 'category',
        data: data.map((item) => item.username || '未知用户')
      },
      series: [
        {
          name: '操作次数',
          type: 'bar',
          data: data.map((item) => item.count)
        }
      ]
    }
  })

  // 当查询参数变化时重新获取数据
  watch(
    () => getQueryParams(),
    (newVal) => {
      if (newVal) {
        fetchStatsData()
      }
    },
    { deep: true }
  )

  return {
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
  }
}
