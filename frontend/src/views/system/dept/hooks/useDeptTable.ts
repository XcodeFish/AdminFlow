import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { getDeptList as fetchDeptList } from '@/api/modules/dept'
import { Department, QueryDeptParams } from '@/types/dept'
import useTablePagination from '@/hooks/useTablePagination'

export function useDeptTable() {
  // 使用通用分页hook
  const {
    currentPage,
    pageSize,
    handleCurrentChange,
    handleSizeChange: onSizeChange
  } = useTablePagination()

  // 表格数据
  const tableData = ref<Department[]>([])
  const loading = ref(false)
  const total = ref(0)

  // 查询参数
  const queryParams = reactive<QueryDeptParams>({
    deptName: '',
    status: undefined,
    parentId: null,
    page: 1,
    pageSize: 10
  })

  // 获取部门列表
  // 获取部门列表
  const getDeptList = async () => {
    loading.value = true
    try {
      // 确保分页参数同步
      queryParams.page = currentPage.value
      queryParams.pageSize = pageSize.value
      console.log('queryParams', queryParams)

      // 使用已定义的API函数
      const res = await fetchDeptList(queryParams)
      if (res.data) {
        tableData.value = res.data.items || []
        total.value = res.data.total || 0
      }
    } catch (error) {
      console.error('获取部门列表失败', error)
      ElMessage.error('获取部门列表失败')
    } finally {
      loading.value = false
    }
  }

  // 处理分页变化
  const handlePageChange = (page: number) => {
    handleCurrentChange(page)
    getDeptList()
  }

  // 处理每页数量变化
  const handleSizeChange = (size: number) => {
    onSizeChange(size)
    getDeptList()
  }

  // 重置查询参数
  const resetQuery = () => {
    Object.assign(queryParams, {
      deptName: '',
      status: undefined,
      parentId: undefined,
      page: 1,
      pageSize: 10
    })
    getDeptList()
  }

  return {
    tableData,
    loading,
    total,
    queryParams,
    currentPage,
    pageSize,
    getDeptList,
    handlePageChange,
    handleSizeChange,
    resetQuery
  }
}
