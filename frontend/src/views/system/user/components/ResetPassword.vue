<template>
  <el-dialog title="重置密码" v-model="dialogVisible" width="400px" destroy-on-close>
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px" @submit.prevent>
      <el-form-item label="新密码" prop="password">
        <el-input v-model="formData.password" placeholder="请输入新密码" type="password" show-password />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input v-model="formData.confirmPassword" placeholder="请再次输入新密码" type="password" show-password />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="flex justify-end">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import { resetUserPassword } from '@/api/modules/user'
import type { ResetPasswordParams } from '@/types/user'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  userId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void
  (e: 'success'): void
}>()

// 弹窗显示控制
const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

// 表单引用
const formRef = ref<FormInstance>()
const submitting = ref(false)

// 表单数据
interface PasswordFormData extends ResetPasswordParams {
  confirmPassword: string
}

const formData = reactive<PasswordFormData>({
  password: '',
  confirmPassword: ''
})

// 表单验证规则
const validateConfirmPassword = (_rule: any, value: string, callback: Function) => {
  if (value !== formData.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules = reactive<FormRules>({
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
})

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid || !props.userId) return

    submitting.value = true
    try {
      await resetUserPassword(props.userId, { password: formData.password })
      ElMessage.success('密码重置成功')
      dialogVisible.value = false
      emit('success')
    } catch (error: any) {
      console.error('密码重置失败:', error)
      ElMessage.error(error.message || '密码重置失败')
    } finally {
      submitting.value = false
    }
  })
}
</script>
