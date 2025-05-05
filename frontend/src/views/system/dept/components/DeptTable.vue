<template>
  <div class="dept-table-container">
    <div class="table-toolbar">
      <div class="left">
        <SearchPanel @search="onSearch" @reset="onReset" placeholder="请输入部门名称" />
      </div>
      <div class="right">
        <ActionBar :show-add="true" :show-delete="true" :show-import="false" :show-export="false" module-name="部门"
          @add="onAdd" @delete="onBatchDelete" @refresh="onRefresh" />
      </div>
    </div>

    <UniTable :data="tableData" :columns="columns" :loading="loading" :selection="true"
      @selection-change="onSelectionChange">
      <template #status="{ row }">
        <UniSwitch v-model="row.status" :active-value="1" :inactive-value="0" @change="() => onStatusChange(row)" />
      </template>
      <template #action="{ row }">
        <UniButton type="primary" size="small" @click="onEdit(row)">编辑</UniButton>
        <UniButton type="primary" size="small" @click="onAddSub(row.id)">新增</UniButton>
        <UniButton type="danger" size="small" @click="onDelete(row)" :disabled="hasChildren(row)">删除</UniButton>
      </template>
    </UniTable>

    <div class="pagination-container">
      <el-pagination :current-page="localPage" :page-size="localPageSize" :page-sizes="[10, 20, 50, 100]" :total="total"
        layout="total, sizes, prev, pager, next, jumper" @size-change="onSizeChange" @current-change="onPageChange"
        @update:current-page="onUpdatePage" @update:page-size="onUpdatePageSize" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Department } from '@/types/dept'
import SearchPanel from '@/components/common/SearchPanel.vue'
import ActionBar from '@/components/common/ActionBar.vue'
import UniTable from '@/components/common/UniTable.vue'
import UniButton from '@/components/common/UniButton.vue'
import UniSwitch from '@/components/common/UniSwitch.vue'

// 定义组件属性
const props = defineProps<{
  loading: boolean
  tableData: Department[]
  columns: any[]
  total: number
  page: number
  pageSize: number
}>()

// 定义组件事件
const emit = defineEmits<{
  (e: 'search', keyword: string): void
  (e: 'reset'): void
  (e: 'add'): void
  (e: 'add-sub', parentId: string): void
  (e: 'edit', row: Department): void
  (e: 'delete', row: Department): void
  (e: 'batch-delete', rows: Department[]): void
  (e: 'refresh'): void
  (e: 'status-change', row: Department): void
  (e: 'page-change', page: number): void
  (e: 'size-change', size: number): void
  (e: 'selection-change', rows: Department[]): void
  (e: 'update:page', page: number): void
  (e: 'update:pageSize', size: number): void
}>()

// 选中的行
const selectedRows = ref<Department[]>([])

// 本地页码和每页数量
const localPage = ref(props.page)
const localPageSize = ref(props.pageSize)

// 监听props变化更新本地状态
watch(() => props.page, (val) => {
  localPage.value = val
})

watch(() => props.pageSize, (val) => {
  localPageSize.value = val
})

// 检查是否有子部门
const hasChildren = (row: Department) => {
  return row.children && row.children.length > 0
}

// 搜索
const onSearch = (keyword: string) => {
  emit('search', keyword)
}

// 重置
const onReset = () => {
  emit('reset')
}

// 添加部门
const onAdd = () => {
  emit('add')
}

// 添加子部门
const onAddSub = (parentId: string) => {
  emit('add-sub', parentId)
}

// 编辑部门
const onEdit = (row: Department) => {
  emit('edit', row)
}

// 删除部门
const onDelete = (row: Department) => {
  emit('delete', row)
}

// 批量删除
const onBatchDelete = () => {
  emit('batch-delete', selectedRows.value)
}

// 刷新
const onRefresh = () => {
  emit('refresh')
}

// 状态变更
const onStatusChange = (row: Department) => {
  emit('status-change', row)
}

// 页码变更
const onPageChange = (page: number) => {
  emit('page-change', page)
  emit('update:page', page)
}

// 每页条数变更
const onSizeChange = (size: number) => {
  emit('size-change', size)
  emit('update:pageSize', size)
}

// 选择变更
const onSelectionChange = (rows: Department[]) => {
  selectedRows.value = rows
  emit('selection-change', rows)
}

// 页面更新处理函数
const onUpdatePage = (page: number) => {
  localPage.value = page
  emit('update:page', page)
  onPageChange(page)
}

const onUpdatePageSize = (size: number) => {
  localPageSize.value = size
  emit('update:pageSize', size)
  onSizeChange(size)
}
</script>

<style lang="scss" scoped>
.dept-table-container {
  height: 100%;
  display: flex;
  flex-direction: column;

  .table-toolbar {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    margin-bottom: 16px;
    gap: 16px;

    .left,
    .right {
      display: flex;
      gap: 10px;
    }
  }

  .pagination-container {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
