<template>
  <div class="config-container">
    <div class="config-header">
      <h2>代码生成配置管理</h2>
      <div class="operation-btns">
        <el-button type="primary" @click="openImportDialog">
          <el-icon>
            <plus />
          </el-icon>导入表结构
        </el-button>
      </div>
    </div>

    <div class="config-content">
      <ConfigTable :configList="configList" :total="total" :currentPage="currentPage" :pageSize="pageSize"
        :loading="loading" @view="openDetailDrawer" @generate="generateCode" @preview="previewCode"
        @delete="deleteConfig" @duplicate="duplicateConfig" @export="exportConfig" @page-change="handlePageChange"
        @size-change="handleSizeChange" />
    </div>

    <!-- 详情抽屉 -->
    <ConfigDetail v-model="detailDrawerVisible" :config="currentConfig" @close="closeDetailDrawer"
      @generate="generateCode" />

    <!-- 导入对话框 -->
    <ImportTable v-model="importDialogVisible" @success="handleImportSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ElNotification } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import ConfigTable from './components/ConfigTable.vue'
import ConfigDetail from './components/ConfigDetail.vue'
import ImportTable from './components/ImportTable.vue'
import { useConfigList } from './hooks/useConfigList'

// 使用配置列表逻辑hook
const {
  configList,
  total,
  currentPage,
  pageSize,
  loading,
  currentConfig,
  detailDrawerVisible,
  importDialogVisible,
  fetchConfigList,
  openDetailDrawer,
  closeDetailDrawer,
  openImportDialog,
  closeImportDialog,
  deleteConfig,
  duplicateConfig,
  exportConfig,
  generateCode,
  previewCode,
  handlePageChange,
  handleSizeChange
} = useConfigList()

// 处理导入成功
const handleImportSuccess = () => {
  ElNotification({
    title: '导入成功',
    message: '表结构已成功导入，配置已生成',
    type: 'success'
  })
  fetchConfigList()
}
</script>

<style scoped>
.config-container {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.config-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.operation-btns {
  display: flex;
  gap: 10px;
}

.config-content {
  flex: 1;
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

h2 {
  margin: 0;
  color: #303133;
}
</style>
