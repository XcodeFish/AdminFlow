import { ref, reactive, computed } from 'vue'
import { getRoleList } from '@/api/modules/role'
import type { Role, RoleQueryParams } from '@/types/role'
import type { TableColumn } from '@/types/table'
import { formatDate } from '@/utils/format'

export default function useRoleTable() {
  // 列表数据
  const roleList = ref<Role[]>([])
  const loading = ref(false)
  const total = ref(0)

  // 查询参数
  const searchParams = reactive<RoleQueryParams>({
    roleName: '',
    roleKey: '',
    status: undefined,
    page: 1,
    pageSize: 10
  })

  // 表格列配置
  const columns = computed<TableColumn<Role>[]>(() => [
    { type: 'selection', width: 55, label: '', prop: 'selection' as any, align: 'center' },
    { label: '角色名称', prop: 'roleName', minWidth: 120, showOverflowTooltip: true },
    { label: '角色标识', prop: 'roleKey', minWidth: 120, showOverflowTooltip: true },
    { label: '排序', prop: 'orderNum', width: 80, align: 'center' },
    { label: '数据权限', prop: 'dataScope', width: 100, slot: 'dataScope', align: 'center' },
    { label: '状态', prop: 'status', width: 80, slot: 'status', align: 'center' },
    {
      label: '创建时间',
      prop: 'createdAt' as any,
      minWidth: 180,
      align: 'center',
      formatter: (row: Role) => {
        if (!row.createdAt) return '-'
        return formatDate(row.createdAt, 'yyyy-MM-dd HH:mm')
      }
    }
  ])

  // 获取角色列表
  const fetchRoleList = async () => {
    loading.value = true
    try {
      const res = await getRoleList()
      if (res.code === 200) {
        roleList.value = res.data
        // 设置总数，如果API返回的不是分页格式，则使用数组长度
        total.value = res.data.length
      }
    } catch (error) {
      console.error('获取角色列表失败', error)
    } finally {
      loading.value = false
    }
  }

  // 页码改变
  const handleCurrentChange = (page: number) => {
    searchParams.page = page
    fetchRoleList()
  }

  // 每页数量改变
  const handleSizeChange = (size: number) => {
    searchParams.pageSize = size
    searchParams.page = 1
    fetchRoleList()
  }

  // 表格行样式
  const tableRowClassName = ({ row }: { row: Role }) => {
    // 可以根据状态设置行样式
    if (row.status === 0) {
      return 'opacity-60'
    }
    return ''
  }

  return {
    loading,
    roleList,
    total,
    searchParams,
    columns,
    tableRowClassName,
    fetchRoleList,
    handleCurrentChange,
    handleSizeChange
  }
}
