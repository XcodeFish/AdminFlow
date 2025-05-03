import * as echarts from 'echarts'

export function useCharts() {
  // 图表实例
  let userGrowthChart: echarts.ECharts | null = null
  let userDistributionChart: echarts.ECharts | null = null

  // 初始化图表
  const initCharts = () => {
    initUserGrowthChart()
    initUserDistributionChart()

    // 监听窗口大小变化
    window.addEventListener('resize', handleResize)
  }

  // 处理窗口大小变化
  const handleResize = () => {
    userGrowthChart?.resize()
    userDistributionChart?.resize()
  }

  // 初始化用户增长趋势图表
  const initUserGrowthChart = () => {
    const chartDom = document.getElementById('userGrowthChart')
    if (!chartDom) return

    userGrowthChart = echarts.init(chartDom)

    // 示例数据
    const xAxisData = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    const seriesData = [850, 930, 900, 930, 1250, 1300, 1290]

    // 配置图表
    userGrowthChart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        boundaryGap: false,
        axisLine: {
          lineStyle: {
            color: '#e0e0e0'
          }
        },
        axisTick: {
          show: false
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
        axisLabel: {
          color: '#666'
        },
        splitLine: {
          lineStyle: {
            color: '#f0f0f0'
          }
        },
        min: 0,
        max: 1500,
        interval: 300
      },
      series: [
        {
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          data: seriesData,
          itemStyle: {
            color: '#6366f1'
          },
          lineStyle: {
            width: 3,
            color: '#6366f1'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(99, 102, 241, 0.3)' },
              { offset: 1, color: 'rgba(99, 102, 241, 0.05)' }
            ])
          }
        }
      ]
    })
  }

  // 初始化用户分布图表
  const initUserDistributionChart = () => {
    const chartDom = document.getElementById('userDistributionChart')
    if (!chartDom) return

    userDistributionChart = echarts.init(chartDom)

    // 示例数据
    const pieData = [
      { name: '企业用户', value: 1250 },
      { name: '个人用户', value: 1050 },
      { name: 'VIP用户', value: 860 },
      { name: '试用用户', value: 501 }
    ]

    // 配置图表
    userDistributionChart.setOption({
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'horizontal',
        right: 'center',
        bottom: 0,
        itemWidth: 12,
        itemHeight: 12,
        textStyle: {
          color: '#666'
        },
        data: pieData.map((item) => item.name)
      },
      series: [
        {
          name: '用户分布',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '40%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 4,
            borderWidth: 2,
            borderColor: '#fff'
          },
          label: {
            show: false
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
          data: pieData
        }
      ]
    })
  }

  // 销毁图表
  const disposeCharts = () => {
    window.removeEventListener('resize', handleResize)

    if (userGrowthChart) {
      userGrowthChart.dispose()
      userGrowthChart = null
    }

    if (userDistributionChart) {
      userDistributionChart.dispose()
      userDistributionChart = null
    }
  }

  return {
    initCharts,
    disposeCharts
  }
}
