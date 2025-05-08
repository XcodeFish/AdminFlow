<template>
  <div class="datasource-table">
    <el-table v-loading="loading" :data="datasources" border style="width: 100%" :empty-text="emptyText" row-key="id">
      <el-table-column prop="name" label="数据源名称" min-width="150" show-overflow-tooltip />
      <el-table-column prop="type" label="数据库类型" min-width="120">
        <template #default="{ row }">
          <el-tag :type="getDatabaseTypeTag(row.type) || 'info'">
            {{ formatDatabaseType(row.type) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="连接信息" min-width="200" show-overflow-tooltip>
        <template #default="{ row }">
          {{ row.host }}:{{ row.port }}/{{ row.database }}
        </template>
      </el-table-column>
      <el-table-column prop="isActive" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.isActive ? 'success' : 'danger'">
            {{ row.isActive ? '正常' : '异常' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createdAt" min-width="180"
        :formatter="(row) => formatDateTime(row.createdAt)" />
      <el-table-column label="操作" fixed="right" width="200" align="center">
        <template #default="{ row }">
          <el-button size="small" type="primary" text @click="handleTest(row)" :loading="props.testingId === row.id">
            测试连接
          </el-button>
          <el-button size="small" type="primary" text @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button size="small" type="danger" text @click="handleDelete(row)" :loading="deletingId === row.id">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container" v-if="total > 0">
      <el-pagination background :current-page="currentPage" :page-size="pageSize" :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange"
        @current-change="handleCurrentChange" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue'
import { ElMessageBox } from 'element-plus'
import type { Datasource } from '@/types/generator'

const props = defineProps({
  datasources: {
    type: Array as () => Datasource[],
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
  testingId: {
    type: Number,
    default: null
  }
})

const emit = defineEmits([
  'edit',
  'delete',
  'test',
  'size-change',
  'current-change'
])

// 删除中的数据源ID
const deletingId = ref<number | null>(null)

/**
 * 数据库类型格式化
 */
const formatDatabaseType = (type: string) => {
  const typeMap: Record<string, string> = {
    mysql: 'MySQL',
    postgresql: 'PostgreSQL',
    oracle: 'Oracle',
    sqlserver: 'SQL Server',
    mongodb: 'MongoDB',
    sqlite: 'SQLite'
  }
  return typeMap[type] || type
}

/**
 * 获取数据库类型对应的Tag类型
 */
const getDatabaseTypeTag = (type: string) => {
  const tagMap: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'info' | ''> = {
    mysql: 'primary',
    postgresql: 'success',
    oracle: 'warning',
    sqlserver: 'danger',
    mongodb: 'info',
    sqlite: ''
  }
  return tagMap[type] || ''
}

/**
 * 时间格式化
 */
const formatDateTime = (dateStr?: Date) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString()
}

/**
 * 处理编辑操作
 */
const handleEdit = (row: Datasource) => {
  emit('edit', row)
}

/**
 * 处理删除操作
 */
const handleDelete = async (row: Datasource) => {
  try {
    await ElMessageBox.confirm(`确定要删除数据源"${row.name}"吗？`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    deletingId.value = row.id
    emit('delete', row.id)
  } catch {
    // 用户取消删除
  } finally {
    deletingId.value = null
  }
}

/**
 * 处理测试连接操作
 */
const handleTest = (row: Datasource) => {
  emit('test', row)
  // 由父组件控制测试结束状态
}

/**
 * 处理每页数量变化
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
const emptyText = props.loading ? '加载中...' : '暂无数据源，请点击上方按钮新增'
</script>

<style scoped>
.datasource-table {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
