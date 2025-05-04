<template>
  <div class="user-manage-container">
    <!-- 搜索和操作按钮区域 -->
    <div class="header-actions">
      <SearchPanel @search="onSearch" @reset="onReset" />
      <ActionBar :show-import="true" :show-export="true" :show-add="true" :show-delete="true"
        :import-export-api="userApi" :query-params="queryParams" export-file-name="用户数据.xlsx"
        template-file-name="用户导入模板.xlsx" module-name="用户" @add="handleAddUser" @delete="handleBatchDelete"
        @refresh="fetchUserList" />
    </div>

    <!-- 统一表格组件 -->
    <UniTable :data="tableData ? tableData : []" :columns="columns" :loading="loading" :selection="true"
      @selection-change="handleSelectionChange">
      <template #status="{ row }">
        <UniSwitch v-model="row.status" :active-value="1" :inactive-value="0" @change="() => handleStatusChange(row)" />
      </template>
      <template #action="{ row }">
        <UniButton type="primary" size="small" @click="handleEdit(row)">编辑</UniButton>
        <UniButton type="danger" size="small" @click="handleDelete(row)">删除</UniButton>
      </template>
    </UniTable>

    <!-- 统一分页组件 -->
    <div class="pagination-container">
      <UniPagination v-model:page="currentPage" v-model:pageSize="currentPageSize" :total="total"
        :page-sizes="[10, 20, 50, 100]" @update:page="handlePageChange" @update:pageSize="handleSizeChange" />
    </div>

    <!-- 统一对话框组件 -->
    <UserForm v-model:visible="dialogVisible" :userId="currentUserId === null ? undefined : currentUserId"
      @success="handleFormSuccess" @cancel="dialogVisible = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { User, UserQueryParams } from '@/types/user'
import UserForm from './components/UserForm.vue'
import useUserTable from './hooks/useUserTable'
import useUserActions from './hooks/useUserActions'

// 引入统一组件
import SearchPanel from '@/components/common/SearchPanel.vue'
import ActionBar from '@/components/common/ActionBar.vue'
import UniTable from '@/components/common/UniTable.vue'
import UniButton from '@/components/common/UniButton.vue'
import UniSwitch from '@/components/common/UniSwitch.vue'
import UniPagination from '@/components/common/UniPagination.vue'

// 表格相关逻辑
const {
  loading,
  userList: tableData,
  total,
  searchParams: queryParams,
  fetchUserList,
  fetchRoleOptions,
  handleSizeChange,
  columns,
} = useUserTable()

// 用户操作相关逻辑
const {
  handleStatusChange,
  handleDelete
} = useUserActions(fetchUserList)

// 弹窗控制
const dialogVisible = ref(false)
const dialogTitle = ref('新增用户')
const currentUserId = ref<string | null>(null)

// 多选功能
const selectedRows = ref<User[]>([])

// 添加计算属性
const currentPage = computed({
  get: () => queryParams.page || 1,
  set: (val) => handlePageChange(val)
})

const currentPageSize = computed({
  get: () => queryParams.pageSize || 10,
  set: (val) => handleSizeChange(val)
})

// API路径定义 - 预留导入导出路径
const userApi = {
  exportUrl: '/api/v1/users/export',
  importUrl: '/api/v1/users/import',
  templateUrl: '/api/v1/users/import-template'
}

// 初始化
onMounted(async () => {
  await Promise.all([
    fetchUserList(),
    fetchRoleOptions()
  ])
})

// 搜索和重置
const onSearch = (params: Partial<UserQueryParams>) => {
  Object.assign(queryParams, params, { page: 1 })
  fetchUserList()
}

const onReset = () => {
  // 重置搜索条件，但保留分页设置
  // const { page, pageSize } = queryParams
  Object.keys(queryParams).forEach(key => {
    if (key !== 'page' && key !== 'pageSize') {
      (queryParams as Record<string, any>)[key] = undefined
    }
  })
  fetchUserList()
}

// 多选变化
const handleSelectionChange = (rows: User[]) => {
  selectedRows.value = rows
}

// 分页改变
const handlePageChange = (page: number) => {
  queryParams.page = page
  fetchUserList()
}

// 添加用户
const handleAddUser = () => {
  currentUserId.value = null
  dialogTitle.value = '新增用户'
  dialogVisible.value = true
}

// 编辑用户
const handleEdit = (row: User) => {
  currentUserId.value = row.id || null
  dialogTitle.value = '编辑用户'
  dialogVisible.value = true
}

// 表单提交成功回调
const handleFormSuccess = () => {
  dialogVisible.value = false
  fetchUserList()
}

// 预留批量操作函数
const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要删除的用户')
    return
  }
  ElMessage.info('批量删除功能开发中')
}

// 预留导入导出功能
const handleImport = (file: File) => {
  ElMessage.info('导入功能开发中')
  return false
}

const handleExport = () => {
  ElMessage.info('导出功能开发中')
}
</script>

<style lang="scss" scoped>
.user-manage-container {
  padding: 20px;
}

.header-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 16px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
