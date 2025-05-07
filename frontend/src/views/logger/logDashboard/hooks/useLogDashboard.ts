import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import type { Ref } from 'vue'
import dayjs from 'dayjs'

export type TimeGranularity = 'hour' | 'day' | 'week' | 'month'

export default function useLogDashboard() {
  // 加载状态
  const loading = ref(false)

  // 时间范围选择
  const timeRange = ref<[Date, Date]>([dayjs().subtract(7, 'day').toDate(), dayjs().toDate()])

  // 时间粒度选择
  const timeGranularity = ref<TimeGranularity>('day')

  // 时间粒度选项
  const granularityOptions = [
    { label: '按小时', value: 'hour' },
    { label: '按天', value: 'day' },
    { label: '按周', value: 'week' },
    { label: '按月', value: 'month' }
  ]

  // 获取查询参数
  const getQueryParams = () => {
    if (!timeRange.value || timeRange.value.length !== 2) {
      ElMessage.warning('请选择有效的时间范围')
      return null
    }

    return {
      startTime: dayjs(timeRange.value[0]).format('YYYY-MM-DD HH:mm:ss'),
      endTime: dayjs(timeRange.value[1]).format('YYYY-MM-DD HH:mm:ss'),
      timeGranularity: timeGranularity.value
    }
  }

  // 时间范围变化
  const handleTimeRangeChange = (dates: [Date, Date]) => {
    if (dates && dates.length === 2) {
      timeRange.value = dates
    }
  }

  // 时间粒度变化
  const handleGranularityChange = (value: TimeGranularity) => {
    timeGranularity.value = value
  }

  // 快捷选择时间范围
  const handleQuickSelect = (days: number) => {
    timeRange.value = [dayjs().subtract(days, 'day').toDate(), dayjs().toDate()]
  }

  return {
    loading,
    timeRange,
    timeGranularity,
    granularityOptions,
    getQueryParams,
    handleTimeRangeChange,
    handleGranularityChange,
    handleQuickSelect
  }
}
