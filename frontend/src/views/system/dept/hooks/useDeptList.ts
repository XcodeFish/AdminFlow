import { ref, reactive, computed } from 'vue'
import { getDeptList } from '@/api/modules/dept'
import type { Department, QueryDeptParams } from '@/types/dept'
import { showError } from '@/utils/message'

export default function useDeptList() {
  // 列表数据
  const deptList = ref<Department[]>([])
  const loading = ref(false)
  const total = ref(0)

  // 查询参数
  const searchParams = reactive<QueryDeptParams>({
    deptName: '',
    status: undefined,
    page: 1,
    pageSize: 10,
    parentId: null
  })

  // 表格列配置
  const columns = computed(() => [
    { type: 'selection' as const, width: 50, label: '' },
    { prop: 'deptName', label: '部门名称', minWidth: 150 },
    { prop: 'orderNum', label: '排序', width: 80 },
    { prop: 'leader', label: '负责人', width: 100 },
    { prop: 'phone', label: '联系电话', width: 120 },
    { prop: 'email', label: '邮箱', width: 150 },
    {
      prop: 'status',
      label: '状态',
      width: 80,
      slot: 'status'
    },
    {
      prop: 'createdAt',
      label: '创建时间',
      minWidth: 180,
      formatter: (row: Department) => {
        return row.createdAt ? new Date(row.createdAt).toLocaleString() : '-'
      }
    },
    // {
    //   prop: 'action',
    //   label: '操作',
    //   width: 200,
    //   fixed: 'right' as const,
    //   slot: 'action'
    // }
  ])

  // 获取部门列表
  const fetchDeptList = async (parentId?: string) => {
    try {
      loading.value = true

      // 更新父部门ID查询条件
      if (parentId !== undefined) {
        searchParams.parentId = parentId
      }
      console.log('searchParams dept', searchParams)

      const { data } = await getDeptList(searchParams)
      if (data) {
        deptList.value = data.items || []
        total.value = data.total || 0
      } else {
        deptList.value = []
        total.value = 0
      }
    } catch (error) {
      console.error('获取部门列表失败', error)
      showError('获取部门列表失败')
      deptList.value = []
      total.value = 0
    } finally {
      loading.value = false
    }
  }

  // 页码改变
  const handleCurrentChange = (page: number) => {
    searchParams.page = page
    fetchDeptList()
  }

  // 每页数量改变
  const handleSizeChange = (size: number) => {
    searchParams.pageSize = size
    searchParams.page = 1
    fetchDeptList()
  }

  // 搜索部门
  const handleSearch = () => {
    searchParams.page = 1
    fetchDeptList()
  }

  // 重置搜索条件
  const handleReset = () => {
    // 重置搜索参数，但保持当前的parentId
    const currentParentId = searchParams.parentId
    Object.keys(searchParams).forEach((key) => {
      if (key !== 'page' && key !== 'pageSize' && key !== 'parentId') {
        ;(searchParams as Record<string, any>)[key] = undefined
      }
    })
    searchParams.parentId = currentParentId
    searchParams.page = 1
    fetchDeptList()
  }

  return {
    deptList,
    loading,
    total,
    searchParams,
    columns,
    fetchDeptList,
    handleCurrentChange,
    handleSizeChange,
    handleSearch,
    handleReset
  }
}
