import { ref, reactive, computed } from 'vue'
import { getOperationLogList } from '@/api/modules/logger'
import type { OperationLog, OperationLogQueryParams } from '@/types/logger'
import { formatDate } from '@/utils/format'

export default function useOperationLogTable() {
  // 列表数据
  const logList = ref<OperationLog[]>([])
  const loading = ref(false)
  const total = ref(0)

  // 查询参数
  const searchParams = reactive<OperationLogQueryParams>({
    page: 1,
    pageSize: 10,
    username: '',
    operationType: '',
    module: '',
    status: undefined,
    startTime: '',
    endTime: ''
  })

  // 表格列配置
  const columns = computed(() => [
    { type: 'selection' as const, width: 50, label: '' },
    { prop: 'username', label: '用户名', width: 120 },
    { prop: 'nickname', label: '用户昵称', width: 120 },
    { prop: 'operationType', label: '操作类型', width: 100 },
    { prop: 'module', label: '操作模块', width: 120 },
    { prop: 'content', label: '操作内容', minWidth: 200 },
    {
      prop: 'status',
      label: '状态',
      width: 80,
      slot: 'status'
    },
    { prop: 'ip', label: 'IP地址', width: 130 },
    { prop: 'location', label: 'IP归属地', width: 150 },
    {
      prop: 'duration',
      label: '耗时(ms)',
      width: 100,
      formatter: (row: OperationLog) => row.duration || '-'
    },
    {
      prop: 'operationTime',
      label: '操作时间',
      width: 180,
      formatter: (row: OperationLog) => {
        if (!row.operationTime) return '-'
        return formatDate(row.operationTime, 'yyyy-MM-dd HH:mm:ss')
      }
    }
  ])

  // 获取操作日志列表
  const fetchLogList = async () => {
    try {
      loading.value = true
      const { data } = await getOperationLogList(searchParams)

      if (!data) {
        logList.value = []
        total.value = 0
        return
      }

      logList.value = data.list || []
      total.value = data.total || 0
    } catch (error) {
      console.error('获取操作日志列表失败', error)
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
  const tableRowClassName = ({ row }: { row: OperationLog }) => {
    if (row.status === 0) {
      return 'error-row'
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
