<template>
  <div class="menu-manage-container">
    <!-- 搜索和操作按钮区域 -->
    <div class="header-actions">
      <SearchPanel @search="onSearch" @reset="onReset" />
      <ActionBar :show-import="true" :show-export="true" :show-add="true" :show-delete="true"
        :import-export-api="menuApi" :query-params="searchParams" export-file-name="菜单数据.xlsx"
        template-file-name="菜单导入模板.xlsx" module-name="菜单" @add="handleAddMenu" @delete="handleBatchDelete"
        @refresh="fetchMenuList" />
    </div>

    <!-- 统一表格组件 -->
    <UniTable :data="menuList ? menuList : []" :columns="columns" :loading="loading" :selection="true"
      @selection-change="handleSelectionChange">
      <template #icon="{ row }">
        <IconDisplay :icon="row.icon" />
      </template>
      <template #status="{ row }">
        <UniSwitch v-model="row.status" :active-value="1" :inactive-value="0" @change="() => handleStatusChange(row)" />
      </template>
      <template #menuType="{ row }">
        <el-tag v-if="row.menuType === 'M'" type="success">目录</el-tag>
        <el-tag v-else-if="row.menuType === 'C'" type="primary">菜单</el-tag>
        <el-tag v-else-if="row.menuType === 'F'" type="warning">按钮</el-tag>
      </template>
      <template #action="{ row }">
        <UniButton type="primary" size="small" @click="handleEdit(row)">编辑</UniButton>
        <UniButton type="primary" size="small" :disabled="row.menuType !== 'M'" @click="handleAddSubMenu(row.id)">新增
        </UniButton>
        <UniButton type="danger" size="small" @click="handleDelete(row)">删除</UniButton>
      </template>
    </UniTable>

    <!-- 菜单表单对话框 -->
    <MenuForm v-model:visible="dialogVisible" :menu="currentMenu" :parent-id="parentId" @success="handleFormSuccess"
      @cancel="dialogVisible = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { MenuItem } from '@/types/menu'
import MenuForm from './components/MenuForm.vue'
import useMenuTable from './hooks/useMenuTable'
import useMenuActions from './hooks/useMenuActions'
// import { usePermission } from './hooks/usePermission'

// 引入统一组件
import SearchPanel from '@/components/common/SearchPanel.vue'
import ActionBar from '@/components/common/ActionBar.vue'
import UniTable from '@/components/common/UniTable.vue'
import UniButton from '@/components/common/UniButton.vue'
import UniSwitch from '@/components/common/UniSwitch.vue'
import IconDisplay from '@/components/common/IconDisplay.vue'

// 权限检查
// const { hasPermission } = usePermission()

// 表格相关逻辑
const {
  loading,
  menuList,
  searchParams,
  columns,
  fetchMenuList,
} = useMenuTable()

// 菜单操作相关逻辑
const {
  handleStatusChange,
  handleDelete,
  handleBatchDelete
} = useMenuActions(fetchMenuList)

// 弹窗控制
const dialogVisible = ref(false)
const currentMenu = ref<MenuItem | null>(null)
const parentId = ref<string | null>(null)

// 多选功能
const selectedRows = ref<MenuItem[]>([])

// API路径定义 - 预留导入导出路径
const menuApi = {
  exportUrl: '/api/v1/menus/export',
  importUrl: '/api/v1/menus/import',
  templateUrl: '/api/v1/menus/import-template'
}

// 初始化
onMounted(() => {
  fetchMenuList()
})

// 搜索和重置
const onSearch = (params: string) => {
  searchParams.menuName = params
  searchParams.page = 1
  fetchMenuList()
}

const onReset = () => {
  // 重置搜索条件
  Object.keys(searchParams).forEach(key => {
    if (key !== 'page' && key !== 'pageSize') {
      (searchParams as Record<string, any>)[key] = undefined
    }
  })
  fetchMenuList()
}

// 多选变化
const handleSelectionChange = (rows: MenuItem[]) => {
  selectedRows.value = rows
}

// 添加菜单
const handleAddMenu = () => {
  currentMenu.value = null
  parentId.value = null
  dialogVisible.value = true
}

// 添加子菜单
const handleAddSubMenu = (id?: string) => {
  currentMenu.value = null
  parentId.value = id || null
  dialogVisible.value = true
}

// 编辑菜单
const handleEdit = (row: MenuItem) => {
  currentMenu.value = { ...row }
  parentId.value = null
  dialogVisible.value = true
}

// 表单提交成功回调
const handleFormSuccess = () => {
  dialogVisible.value = false
  fetchMenuList()
}
</script>

<style lang="scss" scoped>
.menu-manage-container {
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

.el-menu-item.is-active,
.el-submenu.is-active .el-submenu__title {
  text-decoration: none !important;
}
</style>
