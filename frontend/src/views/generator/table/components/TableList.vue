<template>
  <div class="table-list">
    <el-table v-loading="loading" :data="tables" border style="width: 100%" :empty-text="emptyText"
      @row-click="handleRowClick" highlight-current-row>
      <el-table-column prop="tableName" label="表名" min-width="180" show-overflow-tooltip>
        <template #default="{ row }">
          <div class="table-name">
            <el-icon>
              <Document />
            </el-icon>
            <span>{{ row.tableName }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="tableComment" label="表注释" min-width="180" show-overflow-tooltip>
        <template #default="{ row }">
          {{ row.tableComment || '无' }}
        </template>
      </el-table-column>

      <el-table-column prop="engine" label="引擎" width="120">
        <template #default="{ row }">
          <el-tag size="small">{{ row.engine || 'N/A' }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="tableRows" label="行数" width="120" align="right">
        <template #default="{ row }">
          {{ formatNumber(row.tableRows) }}
        </template>
      </el-table-column>

      <el-table-column prop="dataLength" label="大小" width="120" align="right">
        <template #default="{ row }">
          {{ row.dataLength || '0' }}
        </template>
      </el-table-column>

      <el-table-column prop="createTime" label="创建时间" min-width="180">
        <template #default="{ row }">
          {{ formatDateTime(row.createTime) }}
        </template>
      </el-table-column>

      <el-table-column label="操作" fixed="right" width="180" align="center">
        <template #default="{ row }">
          <el-button size="small" type="primary" text @click.stop="handleViewDetail(row)">
            查看结构
          </el-button>
          <el-button size="small" type="success" text @click.stop="handleImport(row)">
            导入
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container" v-if="total > 0">
      <el-pagination background :current-page="currentPage" :page-size="pageSize" :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange"
        @current-change="handleCurrentChange" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, computed } from 'vue'
import { Document } from '@element-plus/icons-vue'
import type { TableInfo } from '@/types/generator'
import { PropType } from 'vue'

const props = defineProps({
  tables: {
    type: Array as () => TableInfo[],
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  total: {
    type: Number,
    default: 0
  },
  currentPage: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 10
  },
  currentDatasourceId: {
    type: [Number, Object] as PropType<number | null>,
    default: null
  }
})

const emit = defineEmits([
  'select',
  'view-detail',
  'import',
  'size-change',
  'current-change'
])

/**
 * 处理行点击
 */
const handleRowClick = (row: TableInfo) => {
  emit('select', row)
}

/**
 * 处理查看详情
 */
const handleViewDetail = (row: TableInfo) => {
  emit('view-detail', row)
}

/**
 * 处理导入
 */
const handleImport = (row: TableInfo) => {
  emit('import', row)
}

/**
 * 处理每页条数变化
 */
const handleSizeChange = (size: number) => {
  emit('size-change', size)
}

/**
 * 处理页码变化
 */
const handleCurrentChange = (page: number) => {
  emit('current-change', page)
}

/**
 * 空数据提示文本
 */
const emptyText = computed(() => {
  if (props.loading) return '加载中...'
  if (!props.currentDatasourceId) return '请先选择数据源'
  return '暂无表数据'
})

/**
 * 格式化数字
 */
const formatNumber = (num: number) => {
  if (num === undefined || num === null) return '0'
  return num.toLocaleString()
}

/**
 * 时间格式化
 */
const formatDateTime = (dateStr?: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString()
}
</script>

<style scoped>
.table-list {
  margin-bottom: 20px;
}

.table-name {
  display: flex;
  align-items: center;
}

.table-name .el-icon {
  margin-right: 5px;
  color: var(--el-color-primary);
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
