<template>
  <div class="role-manage-container">
    <!-- 搜索和操作按钮区域 -->
    <div class="header-actions">
      <!-- 使用高级搜索组件 -->
      <AdvancedSearch @search="onSearch" @reset="onReset" />

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button type="primary" @click="handleAddRole">新增角色</el-button>
        <el-button type="danger" @click="handleBatchDelete">批量删除</el-button>
        <el-button @click="fetchRoleList">刷新</el-button>
      </div>
    </div>

    <!-- 统一表格组件 -->
    <UniTable :data="filteredRoleList" :columns="columns" :loading="loading" :selection="true"
      @selection-change="handleSelectionChange" :row-class-name="tableRowClassName">
      <template #dataScope="{ row }">
        <el-tag :type="getDataScopeTag(row.dataScope)">{{ getDataScopeName(row.dataScope) }}</el-tag>
      </template>
      <template #status="{ row }">
        <UniSwitch v-model="row.status" :active-value="1" :inactive-value="0" @change="() => handleStatusChange(row)" />
      </template>
      <template #action="{ row }">
        <UniButton type="primary" size="small" @click="handleAssignPermission(row)">分配权限</UniButton>
        <UniButton type="primary" size="small" @click="handleEdit(row)">编辑</UniButton>
        <UniButton type="danger" size="small" @click="handleDelete(row)">删除</UniButton>
      </template>
    </UniTable>

    <!-- 统一分页组件 -->
    <div class="pagination-container">
      <UniPagination v-model:page="currentPage" v-model:pageSize="currentPageSize" :total="total"
        :page-sizes="[10, 20, 50, 100]" @update:page="handlePageChange" @update:pageSize="handleSizeChange" />
    </div>

    <!-- 角色表单对话框 -->
    <RoleForm v-model:visible="roleFormVisible" :roleId="currentRoleId" @success="handleFormSuccess" />

    <!-- 权限分配对话框 -->
    <PermissionAssign v-model:visible="permissionDialogVisible" :roleId="currentRoleId"
      @success="handlePermissionSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { Role } from '@/types/role'
import RoleForm from './components/RoleForm.vue'
import PermissionAssign from './components/PermissionAssign.vue'
import AdvancedSearch from './components/AdvancedSearch.vue'
import useRoleTable from './hooks/useRoleTable'
import useRoleActions from './hooks/useRoleActions'

// 引入统一组件
import UniTable from '@/components/common/UniTable.vue'
import UniButton from '@/components/common/UniButton.vue'
import UniSwitch from '@/components/common/UniSwitch.vue'
import UniPagination from '@/components/common/UniPagination.vue'

// 表格相关逻辑
const {
  loading,
  roleList,
  total,
  searchParams,
  tableRowClassName,
  fetchRoleList,
  handleSizeChange,
  columns
} = useRoleTable()

// 角色操作相关逻辑
const {
  handleStatusChange,
  handleDelete,
  handleBatchDelete: batchDeleteAction
} = useRoleActions(fetchRoleList)

// 多选功能
const selectedRows = ref<Role[]>([])

// 弹窗控制
const roleFormVisible = ref(false)
const permissionDialogVisible = ref(false)
const currentRoleId = ref<string>('')

// 添加计算属性
const currentPage = computed({
  get: () => searchParams.page || 1,
  set: (val) => handlePageChange(val)
})

const currentPageSize = computed({
  get: () => searchParams.pageSize || 10,
  set: (val) => handleSizeChange(val)
})

// 过滤后的角色列表（用于前端搜索）
const filteredRoleList = computed(() => {
  let result = [...roleList.value]

  // 根据搜索条件过滤
  if (searchParams.roleName) {
    result = result.filter(role =>
      role.roleName.toLowerCase().includes(searchParams.roleName!.toLowerCase())
    )
  }

  if (searchParams.roleKey) {
    result = result.filter(role =>
      role.roleKey.toLowerCase().includes(searchParams.roleKey!.toLowerCase())
    )
  }

  if (searchParams.status !== undefined) {
    result = result.filter(role => role.status === searchParams.status)
  }

  return result
})

// 初始化
onMounted(async () => {
  await fetchRoleList()
})

// 搜索和重置
const onSearch = (params: any) => {
  // 将高级搜索组件的参数应用到搜索参数中
  Object.assign(searchParams, params, { page: 1 })
  // 前端过滤已在计算属性中实现
  // 如果API支持搜索，则在这里调用API
}

const onReset = () => {
  // 重置搜索条件，但保留分页设置
  const { page, pageSize } = searchParams
  Object.keys(searchParams).forEach(key => {
    if (key !== 'page' && key !== 'pageSize') {
      (searchParams as Record<string, any>)[key] = undefined
    }
  })
  searchParams.page = page
  searchParams.pageSize = pageSize
}

// 多选变化
const handleSelectionChange = (rows: Role[]) => {
  selectedRows.value = rows
}

// 分页改变
const handlePageChange = (page: number) => {
  searchParams.page = page
  fetchRoleList()
}

// 数据权限映射
const getDataScopeName = (scope: number) => {
  switch (scope) {
    case 1: return '全部'
    case 2: return '自定义'
    case 3: return '本部门'
    case 4: return '部门及以下'
    case 5: return '仅本人'
    default: return '未知'
  }
}

const getDataScopeTag = (scope: number) => {
  switch (scope) {
    case 1: return 'danger'    // 全部 - 红色
    case 2: return 'warning'   // 自定义 - 黄色
    case 3: return 'success'   // 本部门 - 绿色
    case 4: return 'info'      // 部门及以下 - 灰色
    case 5: return 'primary'   // 仅本人 - 默认
    default: return 'info'
  }
}

// 添加角色
const handleAddRole = () => {
  currentRoleId.value = ''
  roleFormVisible.value = true
}

// 编辑角色
const handleEdit = (row: Role) => {
  currentRoleId.value = row.id
  roleFormVisible.value = true
}

// 分配权限
const handleAssignPermission = (row: Role) => {
  currentRoleId.value = row.id
  permissionDialogVisible.value = true
}

// 表单提交成功回调
const handleFormSuccess = () => {
  roleFormVisible.value = false
  fetchRoleList()
}

// 权限分配成功回调
const handlePermissionSuccess = () => {
  permissionDialogVisible.value = false
  ElMessage.success('权限分配成功')
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要删除的角色')
    return
  }
  batchDeleteAction(selectedRows.value)
}

</script>

<style lang="scss" scoped>
.role-manage-container {
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

.opacity-60 {
  opacity: 0.6;
}
</style>
