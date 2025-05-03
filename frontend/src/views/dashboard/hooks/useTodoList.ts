import { ref, reactive } from 'vue'
import type { FormRules } from 'element-plus'
import { showMessage } from '@/utils/request'
import {
  getTodoList,
  createTodo as createTodoApi,
  updateTodoStatus as updateTodoStatusApi
} from '@/api/modules/todo'
import { TodoItem, CreateTodoParams, UpdateTodoStatusParams, TodoStatus } from '@/types/todo'

export function useTodoList() {
  // 待办列表
  const todoList = ref<TodoItem[]>([])

  // 加载状态
  const loading = ref(false)
  const submitting = ref(false)

  // 表单数据
  const todoForm = reactive<CreateTodoParams>({
    content: '',
    startTime: ''
  })

  // 表单验证规则
  const formRules: FormRules = {
    content: [
      { required: true, message: '请输入待办内容', trigger: 'blur' },
      { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
    ],
    startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }]
  }

  // 加载待办列表
  const loadTodoList = async () => {
    try {
      loading.value = true
      const { data } = await getTodoList()
      if (data) {
        todoList.value = data.list
      }
    } catch (error) {
      console.error('获取待办列表失败:', error)
      showMessage({
        type: 'error',
        message: '获取待办列表失败'
      })
    } finally {
      loading.value = false
    }
  }

  // 创建待办事项
  const createTodo = async (): Promise<boolean> => {
    try {
      submitting.value = true
      const { data } = await createTodoApi(todoForm)
      if (data) {
        todoList.value.unshift(data)
        // 重置表单
        todoForm.content = ''
        todoForm.startTime = ''
        return true
      }
      return false
    } catch (error) {
      console.error('创建待办事项失败:', error)
      showMessage({
        type: 'error',
        message: '创建待办事项失败'
      })
      return false
    } finally {
      submitting.value = false
    }
  }

  // 更新待办状态
  const updateStatus = async (id: string, status: TodoStatus): Promise<boolean> => {
    try {
      const updateData: UpdateTodoStatusParams = { status }
      await updateTodoStatusApi(id, updateData)

      // 更新本地数据
      const index = todoList.value.findIndex((item) => item.id === id)
      if (index !== -1) {
        todoList.value[index].status = status
      }
      return true
    } catch (error) {
      console.error('更新待办状态失败:', error)
      showMessage({
        type: 'error',
        message: '更新待办状态失败'
      })
      return false
    }
  }

  return {
    todoList,
    loading,
    submitting,
    todoForm,
    formRules,
    loadTodoList,
    createTodo,
    updateStatus
  }
}
