<template>
  <div class="todo-list">
    <div class="todo-list__header">
      <h3 class="todo-list__title">{{ title }}</h3>
      <el-button type="primary" size="small" @click="openAddDialog">
        <el-icon>
          <Plus />
        </el-icon>
        添加待办
      </el-button>
    </div>

    <el-empty v-if="!items.length" description="暂无待办事项" />

    <div class="todo-list__content" v-else>
      <el-table :data="items" style="width: 100%" border stripe>
        <el-table-column prop="content" label="内容">
          <template #default="{ row }">
            <div class="todo-item__content" :class="{ 'todo-item__content--done': row.status === 1 }">
              {{ row.content }}
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="deadline" label="截止时间" width="180">
          <template #default="{ row }">
            <div class="todo-item__deadline">
              {{ formatDate(row.deadline) }}
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <div class="todo-item__actions">
              <el-button v-if="row.status === 0" type="success" size="small" circle
                @click="handleUpdateStatus(row.id, 1)">
                <el-icon>
                  <Check />
                </el-icon>
              </el-button>

              <el-button v-if="row.status === 0" type="danger" size="small" circle
                @click="handleUpdateStatus(row.id, 2)">
                <el-icon>
                  <Close />
                </el-icon>
              </el-button>

              <el-button v-if="row.status !== 0" type="primary" size="small" circle
                @click="handleUpdateStatus(row.id, 0)">
                <el-icon>
                  <RefreshLeft />
                </el-icon>
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 添加待办对话框 -->
    <el-dialog v-model="dialogVisible" title="添加待办事项" width="500px" append-to-body destroy-on-close>
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px">
        <el-form-item label="内容" prop="content">
          <el-input v-model="formData.content" placeholder="请输入待办事项内容" />
        </el-form-item>

        <el-form-item label="截止时间" prop="deadline">
          <el-date-picker v-model="formData.deadline" type="datetime" placeholder="选择截止时间" format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm:ss" :default-time="new Date()" style="width: 100%" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAddTodo">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Plus, Check, Close, RefreshLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { TodoItem, TodoItemForm } from '@/types/dashboard'
import { updateTodoStatus, addTodoItem } from '@/api/modules/dashboard'
import dayjs from 'dayjs'

const props = defineProps<{
  title: string
  items: TodoItem[]
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

// 状态相关方法
const getStatusText = (status: number) => {
  const statusMap: Record<number, string> = {
    0: '进行中',
    1: '已完成',
    2: '已取消'
  }
  return statusMap[status] || '未知'
}

const getStatusType = (status: number): 'success' | 'warning' | 'info' | 'danger' | 'primary' => {
  const typeMap: Record<number, 'success' | 'warning' | 'info' | 'danger' | 'primary'> = {
    0: 'warning',
    1: 'success',
    2: 'info'
  }
  return typeMap[status] || 'info'
}

// 格式化日期
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 更新状态
const handleUpdateStatus = async (id: string, status: number) => {
  try {
    await updateTodoStatus(id, status)
    ElMessage.success('状态更新成功')
    emit('refresh')
  } catch (error) {
    console.error('更新状态失败', error)
    ElMessage.error('状态更新失败')
  }
}

// 添加待办相关
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const formData = reactive<TodoItemForm>({
  content: '',
  deadline: ''
})

const formRules: FormRules = {
  content: [
    { required: true, message: '请输入待办事项内容', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  deadline: [
    { required: true, message: '请选择截止时间', trigger: 'change' }
  ]
}

const openAddDialog = () => {
  formData.content = ''
  formData.deadline = ''
  dialogVisible.value = true
}

const handleAddTodo = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await addTodoItem(formData)
        ElMessage.success('添加成功')
        dialogVisible.value = false
        emit('refresh')
      } catch (error) {
        console.error('添加失败', error)
        ElMessage.error('添加失败')
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.todo-list {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1rem;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  &__title {
    font-size: 1.125rem;
    font-weight: 500;
    color: #333;
  }

  &__content {
    max-height: 500px;
    overflow-y: auto;
  }
}

.todo-item {
  &__content {
    &--done {
      text-decoration: line-through;
      color: #999;
    }
  }

  &__deadline {
    font-size: 0.875rem;
    color: #666;
  }

  &__actions {
    display: flex;
    gap: 0.5rem;
  }
}
</style>
