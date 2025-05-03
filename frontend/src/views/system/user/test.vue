<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-[1440px] mx-auto bg-white rounded-lg shadow-sm">
      <!-- 顶部操作区 -->
      <div class="p-6 border-b border-gray-100">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4 flex-1">
            <div class="relative flex-1 max-w-md">
              <el-input v-model="searchKeyword" placeholder="搜索用户名/ID" class="!rounded-button">
                <template #prefix>
                  <el-icon>
                    <Search />
                  </el-icon>
                </template>
              </el-input>
            </div>
            <el-select v-model="statusFilter" placeholder="用户状态" class="w-32 !rounded-button">
              <el-option label="全部" value="" />
              <el-option label="启用" value="active" />
              <el-option label="禁用" value="inactive" />
            </el-select>
            <el-select v-model="roleFilter" placeholder="用户角色" class="w-32 !rounded-button">
              <el-option label="全部" value="" />
              <el-option label="管理员" value="admin" />
              <el-option label="普通用户" value="user" />
            </el-select>
          </div>
          <el-button type="primary" class="ml-4 !rounded-button whitespace-nowrap">
            <el-icon class="mr-1">
              <Plus />
            </el-icon>新增用户
          </el-button>
        </div>
      </div>

      <!-- 数据列表 -->
      <div class="p-6">
        <el-table :data="userList" stripe style="width: 100%" v-loading="loading" @row-click="handleRowClick">
          <el-table-column type="index" width="60" />
          <el-table-column prop="username" label="用户名" width="180" />
          <el-table-column prop="role" label="角色" width="120">
            <template #default="{ row }">
              <el-tag :type="row.role === 'admin' ? 'danger' : 'info'" size="small">
                {{ row.role === 'admin' ? '管理员' : '普通用户' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="120">
            <template #default="{ row }">
              <el-switch v-model="row.status" :active-value="'active'" :inactive-value="'inactive'"
                @change="handleStatusChange(row)" />
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="180" />
          <el-table-column prop="lastLogin" label="最后登录" width="180" />
          <el-table-column label="操作" fixed="right" width="200">
            <template #default="{ row }">
              <el-button link type="primary" @click.stop="handleEdit(row)">编辑</el-button>
              <el-dropdown trigger="click" @click.stop>
                <el-button link type="primary">
                  权限设置<el-icon class="ml-1">
                    <ArrowDown />
                  </el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item>数据查看权限</el-dropdown-item>
                    <el-dropdown-item>数据编辑权限</el-dropdown-item>
                    <el-dropdown-item>管理员权限</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              <el-button link type="danger" @click.stop="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="flex justify-end mt-4">
          <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]"
            :total="total" layout="total, sizes, prev, pager, next, jumper" />
        </div>
      </div>
    </div>

    <!-- 用户详情弹窗 -->
    <el-dialog v-model="detailVisible" title="用户详情" width="500px">
      <div v-if="currentUser" class="space-y-4">
        <div class="flex items-center gap-4">
          <div class="w-20 text-gray-500">用户名：</div>
          <div>{{ currentUser.username }}</div>
        </div>
        <div class="flex items-center gap-4">
          <div class="w-20 text-gray-500">角色：</div>
          <div>{{ currentUser.role === 'admin' ? '管理员' : '普通用户' }}</div>
        </div>
        <div class="flex items-center gap-4">
          <div class="w-20 text-gray-500">状态：</div>
          <div>{{ currentUser.status === 'active' ? '启用' : '禁用' }}</div>
        </div>
        <div class="flex items-center gap-4">
          <div class="w-20 text-gray-500">创建时间：</div>
          <div>{{ currentUser.createTime }}</div>
        </div>
        <div class="flex items-center gap-4">
          <div class="w-20 text-gray-500">最后登录：</div>
          <div>{{ currentUser.lastLogin }}</div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, ArrowDown } from '@element-plus/icons-vue'

interface User {
  id: number
  username: string
  role: 'admin' | 'user'
  status: 'active' | 'inactive'
  createTime: string
  lastLogin: string
}

const searchKeyword = ref('')
const statusFilter = ref('')
const roleFilter = ref('')
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)
const detailVisible = ref(false)
const currentUser = ref<User | null>(null)

// 模拟用户数据
const userList = ref<User[]>([
  {
    id: 1,
    username: '陈思远',
    role: 'admin',
    status: 'active',
    createTime: '2023-12-01 10:00:00',
    lastLogin: '2023-12-15 15:30:00'
  },
  {
    id: 2,
    username: '林雨晴',
    role: 'user',
    status: 'active',
    createTime: '2023-12-02 11:20:00',
    lastLogin: '2023-12-15 14:20:00'
  },
  {
    id: 3,
    username: '张云帆',
    role: 'user',
    status: 'inactive',
    createTime: '2023-12-03 09:15:00',
    lastLogin: '2023-12-14 16:45:00'
  },
  {
    id: 4,
    username: '王梓涵',
    role: 'user',
    status: 'active',
    createTime: '2023-12-04 14:30:00',
    lastLogin: '2023-12-15 11:10:00'
  },
  {
    id: 5,
    username: '刘明轩',
    role: 'admin',
    status: 'active',
    createTime: '2023-12-05 16:40:00',
    lastLogin: '2023-12-15 09:20:00'
  }
])

const handleRowClick = (row: User) => {
  currentUser.value = row
  detailVisible.value = true
}

const handleStatusChange = (row: User) => {
  ElMessage.success(`已${row.status === 'active' ? '启用' : '禁用'}用户：${row.username}`)
}

const handleEdit = (row: User) => {
  ElMessage.info(`编辑用户：${row.username}`)
}

const handleDelete = (row: User) => {
  ElMessageBox.confirm(
    `确定要删除用户 ${row.username} 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    ElMessage.success(`已删除用户：${row.username}`)
  })
}
</script>
