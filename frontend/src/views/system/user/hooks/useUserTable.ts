import { ref, reactive, computed } from 'vue'
import { getUserList } from '@/api/modules/user'
import { getDeptTree } from '@/api/modules/dept'
import type { User, UserQueryParams, Role } from '@/types/user'
import type { DeptTree } from '@/types/dept'
import { formatDate } from '@/utils/format'

// 定义表格列类型
interface TableColumn {
  title?: string
  label: string
  key?: string
  dataIndex?: string
  slot?: string
  width?: number
  prop: string
}


export default function useUserTable() {
  // 列表数据
  const userList = ref<User[]>([])
  const deptOptions = ref<DeptTree[]>([])
  const loading = ref(false)
  const total = ref(0)
  const roleOptions = ref<Role[]>([])

  // 查询参数
  const searchParams = reactive<UserQueryParams>({
    username: undefined,
    status: undefined,
    deptId: undefined,
    roleId: undefined,
    searchKey: undefined,
    page: 1,
    pageSize: 10
  })

  // 获取用户列表
  const fetchUserList = async () => {
    loading.value = true
    try {
      const res = await getUserList()
      userList.value = res.data.items
      total.value = res.data.total
    } catch (error) {
      console.error('获取用户列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 获取部门树数据
  const fetchDeptTree = async () => {
    try {
      loading.value = true
      const { data } = await getDeptTree()
      console.log('部门树数据', data);
      deptOptions.value = data || []
    } catch (error) {
      console.error('获取部门树失败', error)
      ElMessage.error('获取部门树失败')
    } finally {
      loading.value = false
    }
  }

  // 页码改变
  const handleCurrentChange = (page: number) => {
    searchParams.page = page
    fetchUserList()
  }

  // 每页数量改变
  const handleSizeChange = (size: number) => {
    searchParams.pageSize = size
    searchParams.page = 1
    fetchUserList()
  }

  // 表格行样式
  const tableRowClassName = ({ row }: { row: User }) => {
    // 可以根据状态设置行样式
    if (row.status === 0) {
      return 'opacity-60'
    }
    return ''
  }

  const columns = computed(
    () =>
      [
        { label: '用户名', prop: 'username' },
        { label: '姓名', prop: 'realName' },
        { label: '昵称', prop: 'nickname' },
        { label: '部门', prop: 'deptName' },
        { label: '手机号码', prop: 'phone' },
        { label: '邮箱', prop: 'email' },
        { label: '状态', prop: 'status', slot: 'status' },
        {
          label: '创建时间',
          prop: 'createdAt',
          formatter: (row: User) => {
            if (!row.createdAt) return '-'
            return formatDate(row.createdAt, 'yyyy-MM-dd HH:mm')
          }
        }
      ] as TableColumn[]
  )

  return {
    loading,
    userList,
    total,
    roleOptions,
    searchParams,
    tableRowClassName,
    fetchUserList,
    handleCurrentChange,
    handleSizeChange,
    columns,
    deptOptions,
    fetchDeptTree
  }
}
