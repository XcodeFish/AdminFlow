<template>
  <div class="menu-import-export">
    <!-- 导入对话框 -->
    <el-dialog v-model="importVisible" title="导入菜单数据" width="400px" append-to-body>
      <el-upload class="upload-area" drag action="#" :auto-upload="false" :show-file-list="true" :limit="1"
        :on-change="handleFileChange" :on-exceed="handleExceed" :file-list="fileList" accept=".json,.xlsx">
        <el-icon class="el-icon--upload">
          <Upload />
        </el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持 .json 或 .xlsx 格式文件，大小不超过 5MB
          </div>
        </template>
      </el-upload>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="importVisible = false">取消</el-button>
          <el-button type="primary" @click="submitImport">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload } from '@element-plus/icons-vue'
import type { UploadFile } from 'element-plus'

const emit = defineEmits<{
  (e: 'import-success'): void
}>()

const importVisible = ref(false)
const fileList = ref<UploadFile[]>([])

// 打开导入对话框
const openImportDialog = () => {
  importVisible.value = true
  fileList.value = []
}

// 文件变更处理
const handleFileChange = (file: UploadFile) => {
  if (!file.raw || !file.size) {
    ElMessage.error('文件信息不完整')
    return false
  }

  const isValidType = ['application/json', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'].includes(file.raw.type)
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isValidType) {
    ElMessage.error('只支持 .json 或 .xlsx 格式文件!')
    fileList.value = []
    return false
  }

  if (!isLt5M) {
    ElMessage.error('文件大小不能超过 5MB!')
    fileList.value = []
    return false
  }

  // 限制只有一个文件
  fileList.value = [file]
  return true
}

// 文件超出限制处理
const handleExceed = () => {
  ElMessage.warning('只能上传一个文件')
}

// 提交导入
const submitImport = () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请先选择文件')
    return
  }

  // 这里应该调用API上传文件
  // 示例：模拟上传成功
  ElMessage.success('导入成功')
  importVisible.value = false
  emit('import-success')
}

// 导出菜单
const exportMenu = () => {
  // 示例：调用导出API
  // window.location.href = '/api/v1/system/menu/export'
  ElMessage.success('导出成功')
}

// 向外部暴露方法
defineExpose({
  openImportDialog,
  exportMenu
})
</script>

<style lang="scss" scoped>
.upload-area {
  display: flex;
  justify-content: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
