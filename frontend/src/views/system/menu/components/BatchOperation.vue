<template>
  <div class="batch-operation">
    <div v-if="selectedIds.length > 0" class="selected-info">
      已选择 <span class="selected-count">{{ selectedIds.length }}</span> 项
    </div>
    <el-button-group v-if="selectedIds.length > 0">
      <el-button v-if="hasPermission('system:menu:edit')" type="primary" :icon="Edit"
        @click="handleBatchEnable">批量启用</el-button>
      <el-button v-if="hasPermission('system:menu:edit')" type="info" :icon="CircleClose"
        @click="handleBatchDisable">批量禁用</el-button>
      <el-button v-if="hasPermission('system:menu:delete')" type="danger" :icon="Delete"
        @click="handleBatchDelete">批量删除</el-button>
    </el-button-group>
  </div>
</template>

<script setup lang="ts">
import { Edit, CircleClose, Delete } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { usePermission } from '../hooks/usePermission'

const props = defineProps<{
  selectedIds: string[]
}>()

const emit = defineEmits<{
  (e: 'batch-enable', ids: string[]): void
  (e: 'batch-disable', ids: string[]): void
  (e: 'batch-delete', ids: string[]): void
}>()

// 权限检查
const { hasPermission } = usePermission()

// 批量启用
const handleBatchEnable = () => {
  ElMessageBox.confirm('确认要启用选中的菜单吗？', '提示', {
    type: 'warning'
  }).then(() => {
    emit('batch-enable', props.selectedIds)
  }).catch(() => {
    // 取消操作
  })
}

// 批量禁用
const handleBatchDisable = () => {
  ElMessageBox.confirm('确认要禁用选中的菜单吗？', '提示', {
    type: 'warning'
  }).then(() => {
    emit('batch-disable', props.selectedIds)
  }).catch(() => {
    // 取消操作
  })
}

// 批量删除
const handleBatchDelete = () => {
  ElMessageBox.confirm('确认要删除选中的菜单吗？此操作不可恢复！', '警告', {
    type: 'error'
  }).then(() => {
    emit('batch-delete', props.selectedIds)
  }).catch(() => {
    // 取消操作
  })
}
</script>

<style lang="scss" scoped>
.batch-operation {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;

  .selected-info {
    font-size: 14px;
    color: #606266;

    .selected-count {
      color: #409eff;
      font-weight: bold;
      margin: 0 3px;
    }
  }
}
</style>
