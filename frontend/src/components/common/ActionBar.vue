<template>
  <div class="action-bar" :class="[`align-${position}`]">
    <slot name="prefix"></slot>
      <el-button v-if="showAdd" type="primary" :icon="ElPlus" @click="$emit('add')">
        新增
      </el-button>

      <el-button v-if="showDelete" type="danger" @click="$emit('delete')">
        <el-icon>
          <component :is="ElDelete" />
        </el-icon>
        批量删除
      </el-button>

      <el-button v-if="showImport" type="success" @click="handleImport">
        <el-icon>
          <component :is="ElUpload" />
        </el-icon>
        导入
      </el-button>

      <el-button v-if="showExport" type="success" @click="handleExport">
        <el-icon>
          <component :is="ElDownload" />
        </el-icon>
        导出
      </el-button>
    <slot name="suffix"></slot>

    <!-- 导入导出组件 -->
    <ActionImportExport v-if="showImport || showExport" ref="importExportRef" :api="importExportApi"
      :query-params="queryParams" :export-file-name="exportFileName" :template-file-name="templateFileName"
      :module-name="moduleName" @refresh="$emit('refresh')" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import ActionImportExport from './ActionImportExport.vue'

// Element Plus 图标
import {
  Plus as ElPlus,
  Delete as ElDelete,
  Upload as ElUpload,
  Download as ElDownload
} from '@element-plus/icons-vue'


const props = defineProps({
  position: {
    type: String,
    default: 'right',
    validator: (value: string) => ['left', 'right', 'center'].includes(value)
  },
  showAdd: {
    type: Boolean,
    default: true
  },
  showDelete: {
    type: Boolean,
    default: true
  },
  showImport: {
    type: Boolean,
    default: false
  },
  showExport: {
    type: Boolean,
    default: false
  },
  importExportApi: {
    type: Object,
    default: () => ({})
  },
  queryParams: {
    type: Object,
    default: () => ({})
  },
  exportFileName: {
    type: String,
    default: 'export-data.xlsx'
  },
  templateFileName: {
    type: String,
    default: 'import-template.xlsx'
  },
  moduleName: {
    type: String,
    default: '数据'
  }
})

console.log('props ===', props);


const emit = defineEmits(['add', 'delete', 'import', 'export', 'refresh'])

const importExportRef = ref<any>(null)

// 处理导入导出
const handleImport = () => {
  emit('import')
  if (importExportRef.value) {
    importExportRef.value.openFileDialog()
  }
}

const handleExport = () => {
  emit('export')
  if (importExportRef.value) {
    importExportRef.value.exportData()
  }
}
</script>

<style lang="scss" scoped>
.action-bar {
  display: flex;
  gap: 8px;
  width: auto;

  &.align-left {
    justify-content: flex-start;
  }

  &.align-right {
    justify-content: flex-end;
  }

  &.align-center {
    justify-content: center;
  }
}
</style>
