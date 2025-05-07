<template>
  <div class="column-list">
    <el-table :data="columns" border style="width: 100%" :empty-text="emptyText" :max-height="500" stripe>
      <el-table-column type="index" width="50" label="#" align="center" />

      <el-table-column prop="name" label="字段名" min-width="180" show-overflow-tooltip>
        <template #default="{ row }">
          <div class="column-name">
            <el-icon v-if="row.isPrimary">
              <Key />
            </el-icon>
            <span :class="{ 'is-primary': row.isPrimary }">{{ row.name }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="type" label="数据类型" min-width="150">
        <template #default="{ row }">
          <el-tag size="small" type="info">
            {{ formatColumnType(row) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="nullable" label="可为空" width="80" align="center">
        <template #default="{ row }">
          <el-tag size="small" :type="row.nullable ? 'warning' : 'success'">
            {{ row.nullable ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="isPrimary" label="主键" width="80" align="center">
        <template #default="{ row }">
          <el-tag size="small" :type="row.isPrimary ? 'danger' : 'info'" v-if="row.isPrimary">
            主键
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>

      <el-table-column prop="isAutoIncrement" label="自增" width="80" align="center">
        <template #default="{ row }">
          <el-tag size="small" :type="row.isAutoIncrement ? 'warning' : 'info'" v-if="row.isAutoIncrement">
            自增
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>

      <el-table-column prop="defaultValue" label="默认值" min-width="120">
        <template #default="{ row }">
          <el-text type="info">{{ formatDefaultValue(row.defaultValue) }}</el-text>
        </template>
      </el-table-column>

      <el-table-column prop="comment" label="注释" min-width="180" show-overflow-tooltip>
        <template #default="{ row }">
          {{ row.comment || '-' }}
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { defineProps, computed } from 'vue'
import { Key } from '@element-plus/icons-vue'
import type { ColumnInfo } from '@/types/generator'

const props = defineProps({
  columns: {
    type: Array as () => ColumnInfo[],
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

/**
 * 空数据提示文本
 */
const emptyText = computed(() => {
  if (props.loading) return '加载中...'
  return '暂无字段数据'
})

/**
 * 格式化字段类型
 */
const formatColumnType = (column: ColumnInfo) => {
  if (!column.type) return 'unknown'

  if (column.length) {
    return `${column.type}(${column.length})`
  }

  return column.type
}

/**
 * 格式化默认值
 */
const formatDefaultValue = (defaultValue: any) => {
  if (defaultValue === undefined || defaultValue === null) return 'NULL'
  if (defaultValue === '') return 'EMPTY'
  return defaultValue
}
</script>

<style scoped>
.column-list {
  margin-bottom: 20px;
}

.column-name {
  display: flex;
  align-items: center;
}

.column-name .el-icon {
  margin-right: 5px;
  color: #e6a23c;
}

.is-primary {
  font-weight: bold;
  color: #e6a23c;
}
</style>
