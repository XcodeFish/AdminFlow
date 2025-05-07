import { ref, watch, computed } from 'vue'
import { getApiLogStats } from '@/api/modules/logger'
import { ElMessage } from 'element-plus'
import type { EChartsOption } from 'echarts'
import type { ApiLogStats } from '@/types/logger'

export default function useApiLogStats(getQueryParams: () => any | null) {
  // 数据加载状态
  const loading = ref(false)

  // 统计数据
  const statsData = ref<ApiLogStats | null>(null)

  // 图表实例和配置
  const methodPieRef = ref<HTMLElement | null>(null)
  const statusPieRef = ref<HTMLElement | null>(null)
  const timeLineRef = ref<HTMLElement | null>(null)
  const topSlowApisChartRef = ref<HTMLElement | null>(null)
  const topErrorApisChartRef = ref<HTMLElement | null>(null)

  // 获取统计数据
  const fetchStatsData = async () => {
    const params = getQueryParams()
    if (!params) return

    try {
      loading.value = true
      const { data } = await getApiLogStats(params)

      if (data) {
        statsData.value = data
      } else {
        ElMessage.warning('未获取到接口日志统计数据')
      }
    } catch (error) {
      console.error('获取接口日志统计数据失败', error)
      ElMessage.error('获取接口日志统计数据失败')
    } finally {
      loading.value = false
    }
  }

  // 请求方法饼图配置
  const methodPieOption = computed<EChartsOption>(() => {
    if (!statsData.value?.methodCount) return {}

    const data = Object.entries(statsData.value.methodCount).map(([name, value]) => {
      return { name, value }
    })

    // 定义HTTP方法对应的颜色
    const methodColors = {
      GET: '#409EFF',
      POST: '#67C23A',
      PUT: '#E6A23C',
      DELETE: '#F56C6C',
      PATCH: '#909399',
      HEAD: '#6610f2',
      OPTIONS: '#6f42c1'
    }

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
          name: '请求方法',
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
          data: data.map((item) => ({
            ...item,
            itemStyle: {
              color: methodColors[item.name as keyof typeof methodColors] || '#909399'
            }
          }))
        }
      ]
    }
  })

  // 状态码饼图配置
  const statusPieOption = computed<EChartsOption>(() => {
    if (!statsData.value?.statusCount) return {}

    const data = Object.entries(statsData.value.statusCount).map(([name, value]) => {
      return { name, value }
    })

    // 根据状态码区间确定颜色
    const getStatusColor = (status: string) => {
      const code = parseInt(status, 10)
      if (code < 200) return '#909399' // 信息响应
      if (code < 300) return '#67C23A' // 成功响应
      if (code < 400) return '#E6A23C' // 重定向
      if (code < 500) return '#F56C6C' // 客户端错误
      return '#FF4500' // 服务器错误
    }

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
          name: '状态码',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          data: data.map((item) => ({
            ...item,
            itemStyle: {
              color: getStatusColor(item.name)
            }
          }))
        }
      ]
    }
  })

  // 接口调用时间分布图配置
  const timeLineOption = computed<EChartsOption>(() => {
    if (!statsData.value?.timeDistribution) return {}

    const data = statsData.value.timeDistribution

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
      legend: {
        data: ['调用次数', '平均响应时间']
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
      yAxis: [
        {
          type: 'value',
          name: '调用次数',
          position: 'left'
        },
        {
          type: 'value',
          name: '响应时间(ms)',
          position: 'right'
        }
      ],
      series: [
        {
          name: '调用次数',
          type: 'line',
          data: data.map((item) => item.count),
          smooth: true
        },
        {
          name: '平均响应时间',
          type: 'line',
          yAxisIndex: 1,
          data: data.map((item) => item.avgDuration),
          smooth: true
        }
      ]
    }
  })

  // 最慢接口图表配置
  const topSlowApisOption = computed<EChartsOption>(() => {
    if (!statsData.value?.topSlowApis) return {}

    const data = statsData.value.topSlowApis.slice(0, 10)

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params: any) => {
          const item = params[0]
          const dataIndex = item.dataIndex
          const api = data[dataIndex]
          return `${api.url} (${api.method})<br/>平均响应时间: ${api.avgDuration.toFixed(2)}ms<br/>调用次数: ${api.count}次`
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        name: '平均响应时间(ms)'
      },
      yAxis: {
        type: 'category',
        data: data.map((item) => `${item.method} ${item.url.split('?')[0]}`.slice(0, 30))
      },
      series: [
        {
          name: '响应时间',
          type: 'bar',
          data: data.map((item) => item.avgDuration)
        }
      ]
    }
  })

  // 错误率最高接口图表配置
  const topErrorApisOption = computed<EChartsOption>(() => {
    if (!statsData.value?.topErrorApis) return {}

    const data = statsData.value.topErrorApis.slice(0, 10)

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params: any) => {
          const item = params[0]
          const dataIndex = item.dataIndex
          const api = data[dataIndex]
          const errorRate = ((api.errorCount / api.totalCount) * 100).toFixed(2)
          return `${api.url} (${api.method})<br/>错误次数: ${api.errorCount}次<br/>总调用次数: ${api.totalCount}次<br/>错误率: ${errorRate}%`
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        name: '错误次数'
      },
      yAxis: {
        type: 'category',
        data: data.map((item) => `${item.method} ${item.url.split('?')[0]}`.slice(0, 30))
      },
      series: [
        {
          name: '错误次数',
          type: 'bar',
          data: data.map((item) => item.errorCount),
          itemStyle: {
            color: '#F56C6C'
          }
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
  }
}
