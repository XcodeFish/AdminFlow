ActionImportExport.vue
<template>
  <div>
    <input ref="fileInput" type="file" accept=".xlsx,.xls" style="display: none" @change="handleFileChange" />


    <el-dialog v-if="importDialogVisible" v-model="importDialogVisible" title="导入数据"
      width="400px">
      <el-form label-width="120px">
        <el-form-item label="更新已有数据">
          <el-switch v-model="updateSupport" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleTemplateDownload">下载模板</el-button>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleImport" :loading="importing">确定</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { showSuccess, showError } from '@/utils/message'

const props = defineProps({
  // 接口方法
  api: {
    type: Object,
    required: true
  },
  // 查询参数
  queryParams: {
    type: Object,
    default: () => ({})
  },
  // 导出文件名
  exportFileName: {
    type: String,
    default: 'export-data.xlsx'
  },
  // 导入模板文件名
  templateFileName: {
    type: String,
    default: 'import-template.xlsx'
  },
  // 模块标识（用于显示提示信息）
  moduleName: {
    type: String,
    default: '数据'
  }
})

const emit = defineEmits(['refresh'])

const fileInput = ref<HTMLInputElement | null>(null)
const importDialogVisible = ref(false)
const updateSupport = ref(false)
const selectedFile = ref<File | null>(null)
const importing = ref(false)

// 导出数据
const exportData = async () => {
  try {
    const res = await props.api.export(props.queryParams)
    const blob = new Blob([res.data], { type: 'application/vnd.ms-excel' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = props.exportFileName
    link.click()
    URL.revokeObjectURL(url)
    showSuccess(`${props.moduleName}导出成功`)
  } catch (error) {
    showError(`${props.moduleName}导出失败`)
  }
}

// 打开文件选择框
const openFileDialog = () => {
  importDialogVisible.value = true
}

// 处理文件选择变化
const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0]
  }
}

// 处理导入
const handleImport = async () => {
  if (!selectedFile.value) {
    showError('请选择文件')
    return
  }

  try {
    importing.value = true
    await props.api.import(selectedFile.value, updateSupport.value)
    showSuccess(`${props.moduleName}导入成功`)
    importDialogVisible.value = false
    emit('refresh')
  } catch (error) {
    showError(`${props.moduleName}导入失败`)
  } finally {
    importing.value = false
    selectedFile.value = null
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

// 下载模板
const handleTemplateDownload = async () => {
  try {
    const res = await props.api.getTemplate()
    const blob = new Blob([res.data], { type: 'application/vnd.ms-excel' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = props.templateFileName
    link.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    showError(`${props.moduleName}模板下载失败`)
  }
}

// 暴露方法给父组件
defineExpose({
  exportData,
  openFileDialog
})
</script>
