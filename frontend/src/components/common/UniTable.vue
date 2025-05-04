<template>
  <div class="base-table">
    <el-table ref="tableRef" v-bind="tableProps" v-loading="loading" :data="data" :element-loading-text="loadingText"
      :empty-text="emptyText" :border="border" :stripe="stripe" :size="size" :row-key="rowKey"
      :highlight-current-row="highlightCurrentRow" :height="height" :max-height="maxHeight"
      @selection-change="handleSelectionChange" @cell-click="handleCellClick" @row-click="handleRowClick"
      @sort-change="handleSortChange">
      <template v-for="column in validColumns" :key="column.prop || column.label">
        <el-table-column :type="column.type" :label="column.label"
          :prop="column.prop" :width="column.width" :min-width="column.minWidth"
          :fixed="column.fixed" :sortable="column.sortable" :formatter="column.formatter" :align="column.align"
          :header-align="column.headerAlign || column.align" :show-overflow-tooltip="column.showOverflowTooltip"
          :class-name="column.className">
          <!-- 默认插槽，用于自定义单元格内容 -->
          <template #default="scope" v-if="column.slot">
            <slot :name="column.slot" :row="scope.row" :index="scope.$index"></slot>
          </template>

          <!-- 表头插槽 -->
          <template #header v-if="column.prop">
            <slot :name="`${column.prop}-header`" :column="column">
              {{ column.label }}
            </slot>
          </template>
        </el-table-column>
      </template>

      <!-- 操作列插槽 -->
      <slot name="action"></slot>

      <!-- 展开行插槽 -->
      <slot name="expand"></slot>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type {
  TableProps,
  TableEmits,
  TableExpose
} from '@/types/table'

// 扩展TableProps接口
interface EnhancedTableProps extends TableProps {
  /** 加载中文本 */
  loadingText?: string
}

// 定义Props
const props = withDefaults(defineProps<EnhancedTableProps>(), {
  border: true,
  stripe: true,
  size: 'default',
  highlightCurrentRow: false,
  loading: false,
  emptyText: '暂无数据',
  rowKey: 'id',
  loadingText: '正在加载数据，请稍候...'
})

// 合并所有Props，传递给el-table
const tableProps = computed(() => {
  const { data, columns, ...rest } = props
  console.log('columns', data, columns);

  return rest
})

// 过滤掉hidden为true的列
const validColumns = computed(() =>
  props.columns.filter(column => !column.hidden)
)

// 定义Emits
const emit = defineEmits<TableEmits>()

// 表格实例引用
const tableRef = ref()

// 事件处理函数
const handleSelectionChange = (selection: any[]) => {
  emit('selection-change', selection)
}

const handleCellClick = (row: any, column: any, cell: HTMLElement, event: Event) => {
  emit('cell-click', row, column, cell, event)
}

const handleRowClick = (row: any, column: any, event: Event) => {
  emit('row-click', row, column, event)
}

const handleSortChange = (params: { column: any, prop: string, order: string }) => {
  emit('sort-change', params)
}

// 暴露方法
defineExpose<TableExpose>({
  clearSelection: () => tableRef.value?.clearSelection(),
  toggleRowSelection: (row, selected) => tableRef.value?.toggleRowSelection(row, selected),
  toggleAllSelection: () => tableRef.value?.toggleAllSelection(),
  sort: (prop, order) => tableRef.value?.sort(prop, order),
  clearSort: () => tableRef.value?.clearSort()
})
</script>

<style scoped>
.base-table {
  width: 100%;
}

:deep(.el-table) {
  --el-table-header-bg-color: #f7f8fa;
  --el-table-row-hover-bg-color: #f5f7fa;
}

:deep(.el-table__header th) {
  font-weight: 600;
  color: #333;
}

:deep(.el-table__row) {
  transition: background-color 0.2s;
}

:deep(.el-loading-mask) {
  z-index: 1000;
}
</style>
