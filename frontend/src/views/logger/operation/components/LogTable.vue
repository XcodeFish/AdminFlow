<template>
  <div class="log-table">
    <el-table v-loading="loading" :data="logList" border stripe style="width: 100%"
      @selection-change="handleSelectionChange" :row-class-name="tableRowClassName">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="username" label="用户名" width="120" />
      <el-table-column prop="nickname" label="用户昵称" width="120" />
      <el-table-column prop="operationType" label="操作类型" width="100">
        <template #default="{ row }">
          <el-tag
            :type="getOperationTypeTag(row.operationType) as 'success' | 'warning' | 'info' | 'primary' | 'danger' | ''">
            {{ getOperationTypeLabel(row.operationType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="module" label="操作模块" width="120" />
      <el-table-column prop="content" label="操作内容" min-width="200" show-overflow-tooltip />
      <el-table-column prop="status" label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '成功' : '失败' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="ip" label="IP地址" width="130" />
      <el-table-column prop="location" label="IP归属地" width="150" show-overflow-tooltip />
      <el-table-column prop="duration" label="耗时(ms)" width="100" />
      <el-table-column prop="operationTime" label="操作时间" width="180" />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleView(row)">详情</el-button>
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页器 -->
    <div class="pagination-container">
      <el-pagination :current-page="currentPage" :page-size="pageSize" :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper" :total="total" @update:current-page="handleCurrentChange"
        @update:page-size="handleSizeChange" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { OperationLog } from '@/types/logger'
import { OperationType } from '@/types/logger'

const router = useRouter()

const props = defineProps({
  logList: {
    type: Array as () => OperationLog[],
    default: () => []
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
  }
})

// 操作类型映射
const operationTypeMap: Record<string, { label: string, type: string }> = {
  [OperationType.LOGIN]: { label: '登录', type: 'info' },
  [OperationType.LOGOUT]: { label: '登出', type: 'info' },
  [OperationType.INSERT]: { label: '新增', type: 'success' },
  [OperationType.UPDATE]: { label: '修改', type: 'warning' },
  [OperationType.DELETE]: { label: '删除', type: 'danger' },
  [OperationType.EXPORT]: { label: '导出', type: 'primary' },
  [OperationType.IMPORT]: { label: '导入', type: 'primary' },
  [OperationType.OTHER]: { label: '其他', type: '' }
}

// 获取操作类型标签
const getOperationTypeLabel = (type: string) => {
  return operationTypeMap[type as OperationType]?.label || type
}

// 获取操作类型标签样式
const getOperationTypeTag = (type: string) => {
  return operationTypeMap[type as OperationType]?.type || ''
}

// 行样式
const tableRowClassName = ({ row }: { row: OperationLog }) => {
  if (row.status === 0) {
    return 'error-row'
  }
  return ''
}

// 选中行事件
const selectedRows = ref<OperationLog[]>([])
const handleSelectionChange = (rows: OperationLog[]) => {
  selectedRows.value = rows
  emit('selection-change', rows)
}

// 分页事件
const handleSizeChange = (size: number) => {
  emit('size-change', size)
}

const handleCurrentChange = (page: number) => {
  emit('current-change', page)
}

// 行操作事件
const handleView = (row: OperationLog) => {
  router.push({
    path: `/logger/operation/detail/${row.id}`
  })
}

// 事件
const emit = defineEmits(['selection-change', 'size-change', 'current-change', 'delete'])

const handleDelete = (row: OperationLog) => {
  emit('delete', row)
}
</script>

<style lang="scss" scoped>
.log-table {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;

  .error-row {
    --el-table-tr-bg-color: var(--el-color-danger-light-9);
  }
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
