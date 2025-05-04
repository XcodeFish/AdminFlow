<template>
  <div class="menu-button-wrapper">
    <ActionBar :show-add="hasPermission('system:menu:add')" :show-import="hasPermission('system:menu:import')"
      :show-export="hasPermission('system:menu:export')" position="right" @add="handleAdd" @import="handleImport"
      @export="handleExport" />
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import ActionBar from '@/components/common/ActionBar.vue'
import { usePermission } from '../hooks/usePermission'

const emit = defineEmits<{
  (e: 'add'): void
  (e: 'export'): void
  (e: 'import'): void
}>()

// 权限检查
const { hasPermission } = usePermission()

// 新增根菜单
const handleAdd = () => {
  emit('add')
}

// 导出菜单
const handleExport = () => {
  emit('export')
}

// 导入菜单
const handleImport = () => {
  emit('import')
}
</script>

<style lang="scss" scoped>
.menu-button-wrapper {
  display: flex;
  justify-content: flex-end;
}
</style>
