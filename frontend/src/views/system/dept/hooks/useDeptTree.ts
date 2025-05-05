import { ref, onMounted } from 'vue'
import { getDeptTree } from '@/api/modules/dept'
import type { DeptTree, DeptStatus } from '@/types/dept'
import { showError } from '@/utils/message'

export default function useDeptTree() {
  // 部门树数据
  const deptTreeData = ref<DeptTree[]>([])
  const loading = ref(false)

  // 获取部门树数据
  const fetchDeptTree = async (status?: DeptStatus) => {
    try {
      loading.value = true
      const { data } = await getDeptTree(status)
      deptTreeData.value = data || []
    } catch (error) {
      console.error('获取部门树失败', error)
      showError('获取部门树失败')
      deptTreeData.value = []
    } finally {
      loading.value = false
    }
  }

  // 当前选中的部门节点
  const currentDept = ref<DeptTree | null>(null)

  // 处理树节点点击
  const handleNodeClick = (data: DeptTree) => {
    currentDept.value = data
  }

  // 初始化
  onMounted(() => {
    fetchDeptTree()
  })

  return {
    deptTreeData,
    loading,
    currentDept,
    fetchDeptTree,
    handleNodeClick
  }
}
