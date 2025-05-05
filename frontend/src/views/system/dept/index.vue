<template>
  <div class="dept-manage-container">
    <el-row :gutter="20" style="height: 100%;">
      <!-- 左侧部门树 -->
      <el-col :span="6" style="height: 100%;">
        <DeptTree :dept-tree-data="deptTreeData" :loading="treeLoading" @node-click="handleNodeClick"
          @add="handleAddDept" @edit="handleEditDept" @delete="handleDeleteDept" />
      </el-col>

      <!-- 右侧部门列表 -->
      <el-col :span="18" style="height: 100%;">
        <DeptTable :loading="listLoading" :table-data="deptList" :columns="columns" :total="total"
          :page="searchParams.page || 1" :page-size="searchParams.pageSize || 10" @search="handleSearch"
          @reset="handleReset" @add="handleAddDept" @add-sub="handleAddDept" @edit="handleEditDept"
          @delete="handleDeleteDept" @batch-delete="handleBatchDelete" @refresh="fetchDeptList"
          @status-change="handleStatusChange" @page-change="handleCurrentChange" @size-change="handleSizeChange"
          @selection-change="handleSelectionChange" />
      </el-col>
    </el-row>

    <!-- 部门表单 -->
    <DeptForm ref="deptFormRef" v-model:visible="dialogVisible" :form-data="formData" :rules="rules"
      :dialog-title="dialogTitle" :dept-options="deptTreeData" @close-dialog="closeDialog" @submit-form="submitForm" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watchEffect } from 'vue'
import DeptTree from './components/DeptTree.vue'
import DeptTable from './components/DeptTable.vue'
import DeptForm from './components/DeptForm.vue'
import type { Department, DeptTree as DeptTreeType } from '@/types/dept'

// 引入钩子函数
import useDeptTree from './hooks/useDeptTree'
import useDeptList from './hooks/useDeptList'
import useDeptActions from './hooks/useDeptActions'
import useDeptForm from './hooks/useDeptForm'

// 当前选中的部门ID
const currentDeptId = ref<string | null>(null)

// 选中的表格行
const selectedRows = ref<Department[]>([])

// 部门树相关逻辑
const {
  deptTreeData,
  loading: treeLoading,
  currentDept,
  fetchDeptTree,
  handleNodeClick: handleTreeNodeClick
} = useDeptTree()

// 部门列表相关逻辑
const {
  deptList,
  loading: listLoading,
  total,
  searchParams,
  columns,
  fetchDeptList,
  handleCurrentChange,
  handleSizeChange,
  handleSearch,
  handleReset
} = useDeptList()

// 部门操作相关逻辑
const {
  handleStatusChange,
  handleDelete,
  handleBatchDelete
} = useDeptActions(fetchDeptList, fetchDeptTree)

// 部门表单相关逻辑
const {
  dialogVisible,
  deptFormRef,
  formData,
  rules,
  dialogTitle,
  openAddDialog,
  openEditDialog,
  closeDialog,
  submitForm
} = useDeptForm(fetchDeptList, fetchDeptTree)

// 处理树节点点击
const handleNodeClick = (data: DeptTreeType) => {
  handleTreeNodeClick(data)
  currentDeptId.value = data.id
  // 更新列表查询条件
  // fetchDeptList(data.id)
}

// 处理添加部门
const handleAddDept = (parentId?: string) => {
  if (parentId) {
    openAddDialog(parentId)
  } else if (currentDeptId.value) {
    openAddDialog(currentDeptId.value)
  } else {
    openAddDialog(undefined)
  }
}

// 处理编辑部门
const handleEditDept = (dept: Department) => {
  openEditDialog(dept)
}

// 处理删除部门
const handleDeleteDept = (dept: Department) => {
  handleDelete(dept)
}

// 处理表格多选
const handleSelectionChange = (rows: Department[]) => {
  selectedRows.value = rows
}

// 初始化
onMounted(async () => {
  await fetchDeptTree()
  await fetchDeptList()
})

// 监听当前部门ID变化，更新列表
watchEffect(() => {
  if (currentDeptId.value !== undefined && currentDeptId.value !== null) {
    fetchDeptList(currentDeptId.value)
  } else if (currentDeptId.value === null) {
    // 如果ID为null，重置为undefined传递给fetchDeptList
    fetchDeptList(undefined)
  }
})
</script>

<style lang="scss" scoped>
.dept-manage-container {
  height: calc(100vh - 120px);
  padding: 20px;
}
</style>
