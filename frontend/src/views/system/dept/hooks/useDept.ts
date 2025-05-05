import { ref } from 'vue'
import useDeptTree from './useDeptTree'
import useDeptList from './useDeptList'
import useDeptForm from './useDeptForm'
import useDeptActions from './useDeptActions'
import type { Department } from '@/types/dept'

// 部门管理主逻辑
export function useDept() {
  // 引入子模块hooks
  const { deptTreeData, loading: treeLoading, fetchDeptTree } = useDeptTree()
  const {
    loading: tableLoading,
    deptList: tableData,
    total,
    searchParams: queryParams,
    handleCurrentChange: handlePageChange,
    handleSizeChange,
    fetchDeptList: getDeptList,
    handleReset: resetQuery
  } = useDeptList()

  // 部门操作相关逻辑
  const { handleStatusChange, handleDelete } = useDeptActions(getDeptList, fetchDeptTree)

  // 部门表单相关逻辑
  const {
    dialogVisible: formVisible,
    dialogTitle: formTitle,
    formData,
    openAddDialog: handleFormOpen,
    submitForm: handleFormSubmit,
    closeDialog: handleFormCancel
  } = useDeptForm(getDeptList, fetchDeptTree)

  const formLoading = ref(false)
  const submitLoading = ref(false)

  // 详情弹窗状态
  const detailVisible = ref(false)
  const detailLoading = ref(false)
  const currentDept = ref<Department | null>(null)

  // 处理树节点点击
  const handleNodeClick = (data: Department) => {
    queryParams.parentId = data.id
    getDeptList()
  }

  // 新增部门
  const handleAdd = () => {
    handleFormOpen(undefined)
  }

  // 编辑部门
  const handleEdit = (row: Department) => {
    openEditDialog(row)
  }

  // 打开编辑部门对话框
  const openEditDialog = (dept: Department) => {
    currentDept.value = dept

    // 填充表单数据
    formData.deptName = dept.deptName
    formData.parentId = dept.parentId
    formData.orderNum = dept.orderNum
    formData.leader = dept.leader
    formData.phone = dept.phone
    formData.email = dept.email
    formData.status = dept.status

    formVisible.value = true
  }

  // 查看部门详情
  const handleView = (row: Department) => {
    currentDept.value = row
    detailVisible.value = true
  }

  // 关闭详情
  const handleDetailClose = () => {
    detailVisible.value = false
    currentDept.value = null
  }

  // 刷新表格数据
  const refreshTable = () => {
    getDeptList()
  }

  // 初始化
  const initPage = () => {
    fetchDeptTree()
    getDeptList()
  }

  return {
    // 状态
    tableLoading,
    tableData,
    total,
    queryParams,
    deptTreeData,
    formVisible,
    formTitle,
    formData,
    formLoading,
    submitLoading,
    detailVisible,
    detailLoading,
    currentDept,

    // 方法
    initPage,
    refreshTable,
    fetchDeptTree,
    resetQuery,
    handleNodeClick,
    handlePageChange,
    handleSizeChange,
    handleAdd,
    handleEdit,
    handleView,
    handleDelete,
    handleStatusChange,
    handleFormSubmit,
    handleFormCancel,
    handleDetailClose
  }
}
