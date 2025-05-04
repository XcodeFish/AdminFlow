import { ref, reactive, computed } from 'vue'
import { getUserList } from '@/api/modules/user'
import type { User, UserQueryParams, Role } from '@/types/user'

export default function useUserTable() {
  // 列表数据
  const userList = ref<User[]>([])
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

  // 获取角色选项
  const fetchRoleOptions = async () => {
    // 实际项目中，这里应该调用获取角色列表的API
    roleOptions.value = [
      { id: '1', roleName: '管理员', roleKey: 'admin', orderNum: 1, status: 1, dataScope: 1 },
      { id: '2', roleName: '普通用户', roleKey: 'user', orderNum: 2, status: 1, dataScope: 5 },
      { id: '3', roleName: '开发人员', roleKey: 'dev', orderNum: 3, status: 1, dataScope: 2 }
    ] as Role[]
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

  return {
    loading,
    userList,
    total,
    roleOptions,
    searchParams,
    tableRowClassName,
    fetchUserList,
    fetchRoleOptions,
    handleCurrentChange,
    handleSizeChange
  }
}
