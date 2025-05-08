<template>
  <div class="version-table">
    <div class="toolbar">
      <el-button type="primary" @click="handleCreate">
        <el-icon>
          <plus />
        </el-icon>
        创建版本
      </el-button>
    </div>

    <el-table v-loading="loading" :data="versionList" border stripe style="width: 100%" row-key="id">
      <el-table-column label="序号" type="index" width="80" align="center" />
      <el-table-column prop="version" label="版本号" min-width="120" />
      <el-table-column prop="description" label="版本说明" min-width="220" show-overflow-tooltip />
      <el-table-column prop="creator" label="创建人" width="120" />
      <el-table-column prop="createdAt" label="创建时间" width="170">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" width="220">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleView(row.id)">详情</el-button>
          <el-button type="warning" size="small" @click="handleRollback(row.id)">
            回滚
          </el-button>
          <el-button type="danger" size="small" @click="handleDelete(row.id)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination :current-page="currentPage" :page-size="pageSize" :page-sizes="[10, 20, 50, 100]" :total="total"
        layout="total, sizes, prev, pager, next, jumper" background @size-change="handleSizeChange"
        @current-change="handlePageChange" />
    </div>

    <!-- 创建版本对话框 -->
    <el-dialog v-model="createDialogVisible" title="创建版本" width="500px" :close-on-click-modal="false">
      <el-form :model="createForm" :rules="rules" ref="createFormRef" label-width="100px">
        <el-form-item label="版本说明" prop="note">
          <el-input v-model="createForm.note" type="textarea" :rows="4" placeholder="请输入版本说明" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="createDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitCreateForm" :loading="createLoading">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { GeneratorVersion } from '@/types/generator'

// 格式化日期
const formatDate = (date: Date | string | undefined) => {
  if (!date) return '-'

  if (typeof date === 'string') {
    date = new Date(date)
  }

  return date.toLocaleString()
}

// 创建版本对话框
const createDialogVisible = ref(false)
const createLoading = ref(false)
const createFormRef = ref()
const createForm = reactive({
  note: ''
})

// 表单验证规则
const rules = {
  note: [
    { required: true, message: '请输入版本说明', trigger: 'blur' },
    { min: 2, max: 200, message: '长度在 2 到 200 个字符', trigger: 'blur' }
  ]
}

const props = defineProps<{
  versionList: GeneratorVersion[]
  total: number
  currentPage: number
  pageSize: number
  loading: boolean
}>()

const emit = defineEmits<{
  'view': [id: number]
  'rollback': [id: number]
  'delete': [id: number]
  'create': [note: string]
  'page-change': [page: number]
  'size-change': [size: number]
}>()

// 处理详情查看
const handleView = (id: number) => {
  emit('view', id)
}

// 处理回滚
const handleRollback = (id: number) => {
  emit('rollback', id)
}

// 处理删除
const handleDelete = (id: number) => {
  emit('delete', id)
}

// 处理创建
const handleCreate = () => {
  createForm.note = ''
  createDialogVisible.value = true
}

// 提交创建表单
const submitCreateForm = async () => {
  if (!createFormRef.value) return

  try {
    await createFormRef.value.validate()
    createLoading.value = true
    emit('create', createForm.note)
    createDialogVisible.value = false
  } catch (error) {
    ElMessage.error('表单验证失败，请检查输入')
  } finally {
    createLoading.value = false
  }
}

// 处理页码变化
const handlePageChange = (page: number) => {
  emit('page-change', page)
}

// 处理每页条数变化
const handleSizeChange = (size: number) => {
  emit('size-change', size)
}
</script>

<style scoped>
.version-table {
  width: 100%;
}

.toolbar {
  margin-bottom: 16px;
  display: flex;
  justify-content: flex-end;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}
</style>
