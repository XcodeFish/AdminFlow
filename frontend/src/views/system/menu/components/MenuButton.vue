<template>
  <div class="menu-button">
    <el-button v-if="hasPermission('system:menu:add')" type="primary" :icon="Plus" @click="handleAddRoot">
      新增
    </el-button>
    <el-button v-if="hasPermission('system:menu:export')" type="success" :icon="Upload" @click="handleExport">
      导出
    </el-button>
    <el-button v-if="hasPermission('system:menu:import')" :icon="Download" @click="handleImport">
      导入
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { Plus, Upload, Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { usePermission } from '../hooks/usePermission'

const emit = defineEmits<{
  (e: 'add'): void
  (e: 'export'): void
  (e: 'import'): void
}>()

// 权限检查
const { hasPermission } = usePermission()

// 新增根菜单
const handleAddRoot = () => {
  emit('add')
}

// 导出菜单
const handleExport = () => {
  ElMessage.info('导出功能开发中')
  emit('export')
}

// 导入菜单
const handleImport = () => {
  ElMessage.info('导入功能开发中')
  emit('import')
}
</script>

<style lang="scss" scoped>
.menu-button {
  display: flex;
  gap: 10px;
}
</style>
