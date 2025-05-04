<template>
  <div class="batch-operation-wrapper">
    <div v-if="selectedIds.length > 0" class="selected-info">
      已选择 <span class="selected-count">{{ selectedIds.length }}</span> 项
    </div>
    <UniButton v-if="selectedIds.length > 0 && hasPermission('system:menu:edit')" type="primary" size="small"
      @click="handleBatchEnable">批量启用</UniButton>
    <UniButton v-if="selectedIds.length > 0 && hasPermission('system:menu:edit')" type="info" size="small"
      @click="handleBatchDisable">批量禁用</UniButton>
    <UniButton v-if="selectedIds.length > 0 && hasPermission('system:menu:delete')" type="danger" size="small"
      @click="handleBatchDelete">批量删除</UniButton>
  </div>
</template>

<script setup lang="ts">
import { ElMessageBox } from 'element-plus'
import UniButton from '@/components/common/UniButton.vue'
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
.batch-operation-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;

  .selected-info {
    font-size: 14px;
    color: #606266;
    margin-right: 8px;

    .selected-count {
      color: #409eff;
      font-weight: bold;
      margin: 0 3px;
    }
  }
}
</style>
