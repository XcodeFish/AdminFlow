<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-[1440px] mx-auto bg-white rounded-lg shadow-sm">
      <!-- 顶部操作区 -->
      <div class="p-6 border-b border-gray-100">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4 flex-1">
            <div class="relative flex-1 max-w-md">
              <el-input v-model="searchParams.searchKey" placeholder="搜索用户名/ID" class="!rounded-button"
                @keyup.enter="fetchUserList">
                <template #prefix>
                  <el-icon>
                    <Search />
                  </el-icon>
                </template>
              </el-input>
            </div>
            <el-select v-model="searchParams.status" placeholder="用户状态" class="w-32 !rounded-button"
              @change="fetchUserList">
              <!-- <el-option label="全部" :value=" " /> -->
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
            <el-select v-model="searchParams.roleId" placeholder="用户角色" class="w-32 !rounded-button"
              @change="fetchUserList">
              <!-- <el-option label="全部" :value="null" /> -->
              <el-option v-for="role in roleOptions" :key="role.id" :label="role.roleName" :value="role.id" />
            </el-select>
            <el-button @click="advancedSearchVisible = true">
              <el-icon class="mr-1">
                <Filter />
              </el-icon>高级筛选
            </el-button>
          </div>
          <div class="flex items-center gap-2">
            <el-button @click="handleExport" :loading="exporting">
              <el-icon class="mr-1">
                <Download />
              </el-icon>导出
            </el-button>
            <el-button type="primary" class="ml-2 !rounded-button whitespace-nowrap" @click="handleAddUser">
              <el-icon class="mr-1">
                <Plus />
              </el-icon>新增用户
            </el-button>
          </div>
        </div>
      </div>

      <!-- 数据列表 -->
      <div class="p-6">
        <div class="mb-2 flex items-center" v-if="selectedRows.length > 0">
          <el-tag type="info" class="mr-2">已选择 {{ selectedRows.length }} 项</el-tag>
          <el-button size="small" type="primary" @click="handleBatchEnable">批量启用</el-button>
          <el-button size="small" type="warning" class="ml-2" @click="handleBatchDisable">批量禁用</el-button>
          <el-button size="small" type="danger" class="ml-2" @click="handleBatchDelete">批量删除</el-button>
        </div>

        <el-table :data="userList" stripe style="width: 100%" v-loading="loading" @row-click="handleRowClick"
          @selection-change="handleSelectionChange" :row-class-name="tableRowClassName">
          <el-table-column type="selection" width="55" />
          <el-table-column type="index" width="60" />
          <el-table-column prop="username" label="用户名" min-width="120" />
          <el-table-column prop="realName" label="真实姓名" min-width="120" />
          <el-table-column label="角色" min-width="120">
            <template #default="{ row }">
              <el-tag v-for="role in row.roles" :key="role.id" :type="role.roleKey === 'admin' ? 'danger' : 'info'"
                size="small" class="mr-1 mb-1">
                {{ role.roleName }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="120">
            <template #default="{ row }">
              <el-switch v-model="row.status" :active-value="1" :inactive-value="0"
                @change="() => handleStatusChange(row)" />
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" min-width="180">
            <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
          </el-table-column>
          <el-table-column prop="lastLoginTime" label="最后登录" min-width="180">
            <template #default="{ row }">{{ formatDate(row.lastLoginTime) }}</template>
          </el-table-column>
          <el-table-column label="操作" fixed="right" min-width="280">
            <template #default="{ row }">
              <el-button link type="primary" @click.stop="handleEdit(row)">编辑</el-button>
              <el-button link type="warning" @click.stop="handleResetPassword(row)">重置密码</el-button>
              <el-dropdown trigger="click" @click.stop>
                <el-button link type="primary">
                  权限设置<el-icon class="ml-1">
                    <ArrowDown />
                  </el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="handleSetPermission(row, 'view')">数据查看权限</el-dropdown-item>
                    <el-dropdown-item @click="handleSetPermission(row, 'edit')">数据编辑权限</el-dropdown-item>
                    <el-dropdown-item @click="handleSetPermission(row, 'admin')">管理员权限</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              <el-button link type="danger" @click.stop="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="flex justify-end mt-4">
          <el-pagination v-model:current-page="searchParams.page" v-model:page-size="searchParams.pageSize"
            :page-sizes="[10, 20, 50, 100]" :total="total" layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange" @current-change="handleCurrentChange" />
        </div>
      </div>
    </div>

    <!-- 用户表单弹窗 -->
    <user-form v-model:visible="userFormVisible" :user-id="currentUserId" @success="handleFormSuccess" />

    <!-- 用户详情弹窗 -->
    <user-detail v-model:visible="userDetailVisible" :user-id="currentUserId" />

    <!-- 密码重置弹窗 -->
    <reset-password v-model:visible="resetPasswordVisible" :user-id="currentUserId" @success="fetchUserList" />

    <!-- 高级筛选抽屉 -->
    <advanced-search v-model:visible="advancedSearchVisible" :search-params="searchParams" :role-options="roleOptions"
      @search="handleAdvancedSearch" />
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, ArrowDown, Filter, Download } from '@element-plus/icons-vue'
import { formatDate } from '@/utils/format'
import { getUserList, deleteUser, updateUserStatus } from '@/api/modules/user'
import type { User, UserQueryParams } from '@/types/user'
import UserForm from './components/UserForm.vue'
import UserDetail from './components/UserDetail.vue'
import ResetPassword from './components/ResetPassword.vue'
import AdvancedSearch from './components/AdvancedSearch.vue'
import useUserTable from './hooks/useUserTable'
import { useExport } from './hooks/useExport'

// 表格相关逻辑
const {
  loading,
  userList,
  total,
  roleOptions,
  searchParams,
  tableRowClassName,
  fetchUserList,
  fetchRoleOptions,
  handleSizeChange,
  handleCurrentChange
} = useUserTable()

// 弹窗控制
const userFormVisible = ref(false)
const userDetailVisible = ref(false)
const resetPasswordVisible = ref(false)
const advancedSearchVisible = ref(false)
const currentUserId = ref<string>('')

// 导出功能
const { exportUserData } = useExport()
const exporting = ref(false)

// 多选功能
const selectedRows = ref<User[]>([])

// 初始化
onMounted(async () => {
  await Promise.all([
    fetchUserList(),
    fetchRoleOptions()
  ])
})

// 行点击事件
const handleRowClick = (row: User) => {
  currentUserId.value = row.id || ''
  userDetailVisible.value = true
}

// 多选变化
const handleSelectionChange = (rows: User[]) => {
  selectedRows.value = rows
}

// 导出数据
const handleExport = async () => {
  exporting.value = true
  try {
    await exportUserData(searchParams)
  } finally {
    exporting.value = false
  }
}

// 高级筛选
const handleAdvancedSearch = (params: UserQueryParams) => {
  // 合并参数，保留分页
  const currentPage = searchParams.page
  const currentPageSize = searchParams.pageSize

  // 重置后赋值新参数
  Object.assign(searchParams, params, {
    page: currentPage,
    pageSize: currentPageSize
  })

  fetchUserList()
}

// 添加用户
const handleAddUser = () => {
  currentUserId.value = ''
  userFormVisible.value = true
}

// 编辑用户
const handleEdit = (row: User) => {
  currentUserId.value = row.id || ''
  userFormVisible.value = true
}

// 重置密码
const handleResetPassword = (row: User) => {
  currentUserId.value = row.id || ''
  resetPasswordVisible.value = true
}

// 更改用户状态
const handleStatusChange = async (row: User) => {
  if (!row.id) return

  try {
    await updateUserStatus(row.id, row.status || 0)
    ElMessage.success(`已${row.status === 1 ? '启用' : '禁用'}用户：${row.username}`)
  } catch (error) {
    // 恢复原状态
    row.status = row.status === 1 ? 0 : 1
    ElMessage.error('修改用户状态失败')
  }
}

// 设置权限
const handleSetPermission = (row: User, type: string) => {
  ElMessage.info(`设置用户 ${row.username} 的${type === 'view' ? '查看' : type === 'edit' ? '编辑' : '管理员'}权限`)
  // 在实际项目中实现权限设置逻辑
}

// 删除用户
const handleDelete = (row: User) => {
  if (!row.id) return

  ElMessageBox.confirm(
    `确定要删除用户 ${row.username} 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      await deleteUser(row.id as string)
      ElMessage.success(`已删除用户：${row.username}`)
      fetchUserList()
    } catch (error) {
      ElMessage.error('删除用户失败')
    }
  })
}

// 批量启用
const handleBatchEnable = async () => {
  if (selectedRows.value.length === 0) return

  try {
    await ElMessageBox.confirm('确定要批量启用选中的用户吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    })

    const userIds = selectedRows.value.map(row => row.id).filter(Boolean) as string[]

    // 实际项目中应该有批量接口，这里模拟为多次调用
    await Promise.all(userIds.map(id => updateUserStatus(id, 1)))

    ElMessage.success(`已成功启用 ${userIds.length} 个用户`)
    await fetchUserList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量启用失败')
    }
  }
}

// 批量禁用
const handleBatchDisable = async () => {
  if (selectedRows.value.length === 0) return

  try {
    await ElMessageBox.confirm('确定要批量禁用选中的用户吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const userIds = selectedRows.value.map(row => row.id).filter(Boolean) as string[]

    await Promise.all(userIds.map(id => updateUserStatus(id, 0)))

    ElMessage.success(`已成功禁用 ${userIds.length} 个用户`)
    await fetchUserList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量禁用失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) return

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 个用户吗？此操作不可恢复！`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }
    )

    const userIds = selectedRows.value.map(row => row.id).filter(Boolean) as string[]

    await Promise.all(userIds.map(id => deleteUser(id)))

    ElMessage.success(`已成功删除 ${userIds.length} 个用户`)
    await fetchUserList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
    }
  }
}

// 表单提交成功回调
const handleFormSuccess = () => {
  fetchUserList()
}
</script>

<style scoped>
/* 按钮圆角样式 */
.el-button.rounded-button {
  border-radius: 4px;
}

/* 表格中的标签样式 */
.el-tag+.el-tag {
  margin-left: 4px;
}

/* 表格行样式 */
:deep(.el-table .opacity-60) {
  opacity: 0.6;
}

/* 表格hover样式 */
:deep(.el-table tbody tr:hover > td) {
  background-color: var(--el-table-row-hover-bg-color);
  cursor: pointer;
}

/* 多选标签样式 */
.el-tag.mr-2 {
  margin-right: 8px;
}

/* 批量操作按钮间距 */
.el-button+.el-button {
  margin-left: 8px;
}

/* 表格内按钮样式 */
:deep(.el-button--text) {
  padding: 0 4px;
}

/* 下拉菜单样式 */
:deep(.el-dropdown-menu__item) {
  line-height: 30px;
  padding: 0 16px;
  font-size: 14px;
}

/* 分页样式 */
.el-pagination {
  margin-top: 16px;
  justify-content: flex-end;
}
</style>
