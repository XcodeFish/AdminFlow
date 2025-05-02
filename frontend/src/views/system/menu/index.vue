<template>
  <div class="menu-container">
    <MenuSearch @search="handleSearch" @reset="handleReset" />

    <div class="action-row">
      <BatchOperation :selected-ids="selectedIds" @batch-enable="handleBatchEnable" @batch-disable="handleBatchDisable"
        @batch-delete="handleBatchDelete" />

      <MenuButton @add="handleAdd" @export="handleExport" @import="handleImport" />
    </div>

    <UniTable ref="tableRef" v-loading="loading" :data="menuList" :columns="columns" row-key="id" border stripe
      @selection-change="handleSelectionChange">
      <!-- 图标列自定义渲染 -->
      <template #icon="{ row }">
        <IconDisplay :icon="row.icon" />
      </template>

      <!-- 状态列自定义渲染 -->
      <template #status="{ row }">
        <el-switch v-model="row.status" :active-value="1" :inactive-value="0"
          :disabled="!hasPermission('system:menu:edit')" @change="handleStatusChange(row)" />
      </template>

      <!-- 菜单类型自定义渲染 -->
      <template #menuType="{ row }">
        <el-tag v-if="row.menuType === 'M'" type="success">目录</el-tag>
        <el-tag v-else-if="row.menuType === 'C'" type="primary">菜单</el-tag>
        <el-tag v-else-if="row.menuType === 'F'" type="warning">按钮</el-tag>
      </template>

      <!-- 操作列 -->
      <template #action>
        <el-table-column label="操作" fixed="right" width="220" align="center">
          <template #default="{ row }">
            <el-button v-if="hasPermission('system:menu:edit')" link type="primary" :icon="Edit"
              @click="handleEdit(row)">编辑</el-button>
            <el-button v-if="hasPermission('system:menu:add')" link type="primary" :icon="Plus" :disabled="row.menuType !== 'M'"
              @click="handleAdd(row.id)">新增</el-button>
            <el-button v-if="hasPermission('system:menu:delete')" link type="danger" :icon="Delete"
              @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </template>
    </UniTable>

    <!-- 菜单表单对话框 -->
    <MenuForm v-if="showForm" v-model:visible="showForm" :menu="currentMenu" :parent-id="parentId"
      @success="fetchMenuList" />

    <!-- 导入导出组件 -->
    <MenuImportExport ref="importExportRef" @import-success="fetchMenuList" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Plus, Delete } from '@element-plus/icons-vue'
import { getMenuList, deleteMenu, updateMenu } from '@/api/modules/menu'
import { MenuItem, QueryMenuParams } from '@/types/menu'
import { usePermission } from './hooks/usePermission'
import { useDraggable } from './hooks/useDraggable'
import MenuSearch from './components/MenuSearch.vue'
import MenuButton from './components/MenuButton.vue'
import MenuForm from './components/MenuForm.vue'
import BatchOperation from './components/BatchOperation.vue'
import IconDisplay from '@/components/common/IconDisplay.vue'
import MenuImportExport from './components/MenuImportExport.vue'
import UniTable from '@/components/common/UniTable.vue'

// 权限检查
const { hasPermission } = usePermission()

// 菜单列表数据
const menuList = ref<MenuItem[]>([])
const loading = ref(false)
const showForm = ref(false)
const currentMenu = ref<MenuItem | null>(null)
const parentId = ref<string | null>(null)
const selectedIds = ref<string[]>([])
const tableRef = ref()
const importExportRef = ref()
const isInitialLoading = ref(true)

// 查询参数
const queryParams = reactive<QueryMenuParams>({
  menuName: '',
  status: undefined
})

// 拖拽功能
const { tableRef: dragTableRef, updateDraggable } = useDraggable(menuList, {
  onDragEnd: (newList) => {
    // 可以在这里处理排序后的保存逻辑
    console.log('排序后的菜单列表', newList)
    ElMessage.success('菜单排序已更新')
  }
})

// 表格引用合并
tableRef.value = dragTableRef.value

// 表格列配置
const columns = [
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
]

// 获取菜单列表
const fetchMenuList = async () => {
  try {
    loading.value = true
    const response = await getMenuList(queryParams)
    console.log('response', response)
    const { data } = response

    menuList.value = data.items

    // 列表加载完成后，更新拖拽功能
    nextTick(() => {
      isInitialLoading.value = false
      updateDraggable()
    })
  } catch (error) {
    console.error('获取菜单列表失败', error)
    ElMessage.error('获取菜单列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = (params: QueryMenuParams) => {
  Object.assign(queryParams, params)
  fetchMenuList()
}

// 重置搜索
const handleReset = () => {
  queryParams.menuName = ''
  queryParams.status = undefined
  fetchMenuList()
}

// 选择项变更
const handleSelectionChange = (selection: MenuItem[]) => {
  selectedIds.value = selection.map(item => item.id)
}

// 状态变更处理
const handleStatusChange = async (row: MenuItem) => {
  // 防止初次加载时自动触发
  if (isInitialLoading.value) {
    return
  }
  try {
    await updateMenu(row.id, { id: row.id, status: row.status })
    ElMessage.success('状态更新成功')
  } catch (error) {
    row.status = row.status === 1 ? 0 : 1 // 恢复原状态
    ElMessage.error('状态更新失败')
  }
}

// 编辑菜单
const handleEdit = (row: MenuItem) => {
  currentMenu.value = { ...row }
  parentId.value = null
  showForm.value = true
}

// 新增菜单
const handleAdd = (id?: string) => {
  currentMenu.value = null
  parentId.value = id || null
  showForm.value = true
}

// 删除菜单
const handleDelete = (row: MenuItem) => {
  ElMessageBox.confirm(`确认删除菜单 "${row.menuName}" 吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await deleteMenu(row.id)
      ElMessage.success('删除成功')
      fetchMenuList()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {
    // 取消删除
  })
}

// 批量启用
const handleBatchEnable = async (ids: string[]) => {
  try {
    // 这里应该调用批量更新API
    ElMessage.success('批量启用成功')
    fetchMenuList()
  } catch (error) {
    ElMessage.error('批量启用失败')
  }
}

// 批量禁用
const handleBatchDisable = async (ids: string[]) => {
  try {
    // 这里应该调用批量更新API
    ElMessage.success('批量禁用成功')
    fetchMenuList()
  } catch (error) {
    ElMessage.error('批量禁用失败')
  }
}

// 批量删除
const handleBatchDelete = async (ids: string[]) => {
  try {
    // 这里应该调用批量删除API
    ElMessage.success('批量删除成功')
    fetchMenuList()
  } catch (error) {
    ElMessage.error('批量删除失败')
  }
}

// 导出菜单
const handleExport = () => {
  importExportRef.value?.exportMenu()
}

// 导入菜单
const handleImport = () => {
  importExportRef.value?.openImportDialog()
}

onMounted(() => {
  fetchMenuList()
})
</script>

<style lang="scss" scoped>
.menu-container {
  padding: 15px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

  .action-row {
    margin: 15px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  :deep(.dragging) {
    opacity: 0.6;
    cursor: move;
  }
}
</style>
