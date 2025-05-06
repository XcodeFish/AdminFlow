<template>
  <div class="todo-section">
    <div class="section-header">
      <h2>待办事项</h2>
      <el-button type="primary" size="small" @click="openAddTodoDialog">
        <el-icon>
          <plus />
        </el-icon>添加待办
      </el-button>
    </div>

    <el-table :data="todoList" style="width: 100%" v-loading="loading">
      <el-table-column label="内容" prop="content" min-width="220" />
      <el-table-column label="开始时间" width="180" align="center">
        <template #default="{ row }">
          {{ formatTime(row.startTime) }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="120" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.status === TodoStatus.PENDING" type="info" effect="plain">未完成</el-tag>
          <el-tag v-else-if="row.status === TodoStatus.COMPLETED" type="success" effect="plain">已完成</el-tag>
          <el-tag v-else-if="row.status === TodoStatus.CANCELLED" type="info" effect="plain">已取消</el-tag>
          <el-tag v-else-if="row.status === TodoStatus.EXPIRED" type="warning" effect="plain">已过期</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" align="center">
        <template #default="{ row }">
          <template v-if="row.status === TodoStatus.PENDING">
            <el-button size="small" type="success"
              @click="handleUpdateStatus(row.id, TodoStatus.COMPLETED)">完成</el-button>
            <el-button size="small" plain @click="handleUpdateStatus(row.id, TodoStatus.CANCELLED)">取消</el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加待办对话框 -->
    <el-dialog v-model="dialogVisible" title="添加待办事项" width="500px">
      <el-form :model="todoForm" ref="formRef" :rules="formRules" label-width="100px">
        <el-form-item label="待办内容" prop="content">
          <el-input v-model="todoForm.content" placeholder="请输入待办内容"></el-input>
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker v-model="todoForm.startTime" type="datetime" placeholder="选择开始时间" format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm:ss.sssZ">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitForm" :loading="submitting">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, FormInstance } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { TodoStatus } from '@/types/todo'
import { useTodoList } from '../hooks/useTodoList'

// 使用todo hook
const {
  todoList,
  loading,
  todoForm,
  formRules,
  updateStatus,
  createTodo,
  loadTodoList,
  submitting
} = useTodoList()

// 表单ref
const formRef = ref<FormInstance>()
const dialogVisible = ref(false)

// 打开添加对话框
const openAddTodoDialog = () => {
  dialogVisible.value = true
}

// 提交表单
const handleSubmitForm = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      const success = await createTodo()
      if (success) {
        dialogVisible.value = false
        ElMessage.success('添加待办事项成功')
      }
    }
  })
}

// 更新状态
const handleUpdateStatus = async (id: string, status: TodoStatus) => {
  const success = await updateStatus(id, status)
  if (success) {
    ElMessage.success(
      status === TodoStatus.COMPLETED ? '已完成待办事项' : '已取消待办事项'
    )
  }
}

// 格式化时间
const formatTime = (time: string) => {
  const date = new Date(time)
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`
}

// 初始加载数据
loadTodoList()
</script>

<style scoped>
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.todo-section {
  margin-bottom: 20px;
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}
</style>
