import { ref, reactive, computed } from 'vue'
import { getApiLogList } from '@/api/modules/logger'
import type { ApiLog, ApiLogQueryParams } from '@/types/logger'
import { formatDate } from '@/utils/format'

export default function useApiLogTable() {
  // 列表数据
  const logList = ref<ApiLog[]>([])
  const loading = ref(false)
  const total = ref(0)

  // 查询参数
  const searchParams = reactive<ApiLogQueryParams>({
    page: 1,
    pageSize: 10,
    requestUrl: '',
    requestMethod: '',
    status: undefined,
    errorLevel: '',
    startTime: '',
    endTime: '',
    minDuration: undefined
  })

  // 表格列配置
  const columns = computed(() => [
    { type: 'selection' as const, width: 50, label: '' },
    { prop: 'traceId', label: '追踪ID', width: 120 },
    { prop: 'requestMethod', label: '请求方法', width: 100 },
    { prop: 'requestUrl', label: '请求路径', minWidth: 200 },
    {
      prop: 'status',
      label: '状态码',
      width: 80,
      slot: 'status'
    },
    {
      prop: 'errorLevel',
      label: '错误级别',
      width: 100,
      slot: 'errorLevel'
    },
    { prop: 'requestIp', label: 'IP地址', width: 130 },
    { prop: 'username', label: '用户名', width: 120 },
    {
      prop: 'duration',
      label: '耗时(ms)',
      width: 100,
      formatter: (row: ApiLog) => row.duration || '-'
    },
    {
      prop: 'requestTime',
      label: '请求时间',
      width: 180,
      formatter: (row: ApiLog) => {
        if (!row.requestTime) return '-'
        return formatDate(row.requestTime, 'yyyy-MM-dd HH:mm:ss')
      }
    }
  ])

  // 获取接口日志列表
  const fetchLogList = async () => {
    try {
      loading.value = true
      const { data } = await getApiLogList(searchParams)

      if (!data) {
        logList.value = []
        total.value = 0
        return
      }

      logList.value = data.list || []
      total.value = data.total || 0
    } catch (error) {
      console.error('获取接口日志列表失败', error)
    } finally {
      loading.value = false
    }
  }

  // 页码改变
  const handleCurrentChange = (page: number) => {
    searchParams.page = page
    fetchLogList()
  }

  // 每页数量改变
  const handleSizeChange = (size: number) => {
    searchParams.pageSize = size
    searchParams.page = 1
    fetchLogList()
  }

  // 表格行样式
  const tableRowClassName = ({ row }: { row: ApiLog }) => {
    if (row.status >= 400) {
      return 'error-row'
    }
    if (row.errorLevel === 'WARN') {
      return 'warning-row'
    }
    return ''
  }

  return {
    loading,
    logList,
    total,
    searchParams,
    columns,
    tableRowClassName,
    fetchLogList,
    handleCurrentChange,
    handleSizeChange
  }
}
