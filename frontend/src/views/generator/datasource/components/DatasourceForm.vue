<template>
  <el-dialog :title="title" :model-value="modelValue" width="650px" @close="handleClose" destroy-on-close>
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" label-position="right"
      :disabled="formDisabled">
      <!-- 基础信息 -->
      <el-divider>基础信息</el-divider>
      <el-form-item label="数据源名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入数据源名称" />
      </el-form-item>

      <el-form-item label="数据库类型" prop="type">
        <el-select v-model="form.type" placeholder="请选择数据库类型" style="width: 100%">
          <el-option label="MySQL" value="mysql" />
          <el-option label="PostgreSQL" value="postgresql" />
          <el-option label="Oracle" value="oracle" />
          <el-option label="SQL Server" value="sqlserver" />
          <el-option label="MongoDB" value="mongodb" />
          <el-option label="SQLite" value="sqlite" />
        </el-select>
      </el-form-item>

      <!-- 连接信息 -->
      <el-divider>连接信息</el-divider>
      <el-form-item label="主机地址" prop="host">
        <el-input v-model="form.host" placeholder="请输入主机地址" />
      </el-form-item>

      <el-form-item label="端口" prop="port">
        <el-input-number v-model="form.port" :min="0" :max="65535" style="width: 100%" placeholder="请输入端口号" />
      </el-form-item>

      <el-form-item label="数据库名" prop="database">
        <el-input v-model="form.database" placeholder="请输入数据库名" />
      </el-form-item>

      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" placeholder="请输入用户名" />
      </el-form-item>

      <el-form-item label="密码" prop="password">
        <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
      </el-form-item>

      <!-- 高级选项 -->
      <el-divider>高级选项</el-divider>
      <el-form-item label="字符集">
        <el-select v-model="form.options.charset" placeholder="请选择字符集" style="width: 100%" clearable>
          <el-option label="UTF-8" value="utf8" />
          <el-option label="UTF-8mb4" value="utf8mb4" />
          <el-option label="GBK" value="gbk" />
          <el-option label="Latin1" value="latin1" />
        </el-select>
      </el-form-item>

      <el-form-item label="超时(秒)">
        <el-input-number v-model="form.options.timeout" :min="1" :max="300" style="width: 100%" placeholder="连接超时时间" />
      </el-form-item>

      <!-- 测试连接区域 -->
      <ConnectionTest :formData="testConnectionData" :testing="testing" :connectionStatus="connectionStatus"
        :testDuration="testDuration" @test="handleTestConnection" />
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">
        {{ submitting ? '提交中...' : '确认' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, defineProps, defineEmits } from 'vue'
import { ElMessage } from 'element-plus'
import ConnectionTest from './ConnectionTest.vue'
import { useConnection } from '../hooks/useConnection'
import type { DatasourceCreateDto, DatasourceUpdateDto, Datasource, ConnectionStatus } from '@/types/generator'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '新增数据源'
  },
  mode: {
    type: String as () => 'create' | 'edit',
    default: 'create'
  },
  loading: {
    type: Boolean,
    default: false
  },
  datasource: {
    type: Object as () => Datasource | null,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'submit', 'close'])

const formRef = ref()
const submitting = ref(false)

// 表单数据
const form = reactive<DatasourceCreateDto>({
  name: '',
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  database: '',
  username: '',
  password: '',
  options: {
    charset: 'utf8mb4',
    timeout: 30
  }
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入数据源名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  type: [{ required: true, message: '请选择数据库类型', trigger: 'change' }],
  host: [{ required: true, message: '请输入主机地址', trigger: 'blur' }],
  port: [{ required: true, message: '请输入端口号', trigger: 'blur' }],
  database: [{ required: true, message: '请输入数据库名', trigger: 'blur' }],
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

// 引入连接测试hook
const { testing, connectionStatus, testDuration, testConnection, resetConnectionStatus } = useConnection()

// 重置表单
const resetForm = () => {
  form.name = ''
  form.type = 'mysql'
  form.host = 'localhost'
  form.port = 3306
  form.database = ''
  form.username = ''
  form.password = ''
  form.options = { charset: 'utf8mb4', timeout: 30 }

  // 重置连接测试状态
  resetConnectionStatus()

  // 重置表单验证
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 监听数据源属性变化，填充表单
watch(
  () => props.datasource,
  (newVal) => {
    if (newVal) {
      form.name = newVal.name
      form.type = newVal.type
      form.host = newVal.host
      form.port = newVal.port
      form.database = newVal.database
      form.username = newVal.username
      form.password = '' // 密码不回显
      form.options = newVal.options || { charset: 'utf8mb4', timeout: 30 }
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

// 表单是否禁用
const formDisabled = computed(() => {
  return props.loading || submitting.value
})

// 测试连接数据
const testConnectionData = computed(() => {
  return {
    type: form.type,
    host: form.host,
    port: form.port,
    database: form.database,
    username: form.username,
    password: form.password,
    options: form.options
  }
})

// 处理测试连接
const handleTestConnection = async (data: any) => {
  await testConnection(data)
}

// 处理提交
const handleSubmit = async () => {
  if (formDisabled.value) return

  try {
    // 表单验证
    await formRef.value.validate()

    submitting.value = true

    let formData: DatasourceCreateDto | DatasourceUpdateDto = { ...form }

    // 提交表单
    emit('submit', {
      mode: props.mode,
      id: props.datasource?.id,
      data: formData
    })

  } catch (error) {
    console.error('表单验证失败:', error)
    ElMessage.error('请检查表单填写是否正确')
  } finally {
    submitting.value = false
  }
}

// 处理关闭
const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
  resetConnectionStatus()
}
</script>

<style scoped>
.el-divider {
  margin: 15px 0;
}

.el-input-number {
  width: 100%;
}
</style>
