import { ref, reactive, computed, nextTick } from 'vue'
import { getMenuList } from '@/api/modules/menu'
import type { MenuItem, QueryMenuParams } from '@/types/menu'

export default function useMenuTable() {
  // 列表数据
  const menuList = ref<MenuItem[]>([])
  const loading = ref(false)
  const isInitialLoading = ref(true)
  const tableRef = ref()

  // 查询参数
  const searchParams = reactive<QueryMenuParams>({
    menuName: '',
    status: undefined
  })

  // 表格列配置
  const columns = computed(() => [
    { type: 'selection' as const, width: 50, label: '' },
    { prop: 'menuName', label: '菜单名称', minWidth: 180 },
    {
      prop: 'icon',
      label: '图标',
      width: 80,
      slot: 'icon'
    },
    { prop: 'perms', label: '权限标识', minWidth: 150 },
    { prop: 'path', label: '路由地址', minWidth: 150 },
    {
      prop: 'menuType',
      label: '菜单类型',
      width: 100,
      slot: 'menuType'
    },
    {
      prop: 'status',
      label: '状态',
      width: 80,
      slot: 'status'
    },
    { prop: 'orderNum', label: '排序', width: 80 },
    {
      prop: 'createdAt',
      label: '创建时间',
      minWidth: 180,
      formatter: (row: MenuItem) => {
        return new Date(row.createdAt).toLocaleString()
      }
    }
  ])

  // 获取菜单列表
  const fetchMenuList = async () => {
    try {
      loading.value = true
      console.log('searchParams menu', searchParams)
      const { data } = await getMenuList(searchParams)

      if (!data) {
        menuList.value = []
        return
      }
      menuList.value = data.items && data.items.length ? data.items : []

      // 列表加载完成后
      nextTick(() => {
        isInitialLoading.value = false
      })
    } catch (error) {
      console.error('获取菜单列表失败', error)
    } finally {
      loading.value = false
    }
  }

  // 页码改变
  const handleCurrentChange = (page: number) => {
    searchParams.page = page
    fetchMenuList()
  }

  // 每页数量改变
  const handleSizeChange = (size: number) => {
    searchParams.limit = size
    searchParams.page = 1
    fetchMenuList()
  }

  // 表格行样式
  const tableRowClassName = ({ row }: { row: MenuItem }) => {
    // 可以根据状态设置行样式
    if (row.status === 0) {
      return 'opacity-60'
    }
    return ''
  }

  return {
    loading,
    menuList,
    isInitialLoading,
    searchParams,
    tableRef,
    columns,
    tableRowClassName,
    fetchMenuList,
    handleCurrentChange,
    handleSizeChange
  }
}
