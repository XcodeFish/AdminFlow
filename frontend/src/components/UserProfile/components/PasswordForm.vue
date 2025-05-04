<!-- frontend/src/components/UserProfile/components/PasswordForm.vue -->
<template>
  <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
    <el-form-item label="原密码" prop="oldPassword">
      <el-input v-model="formData.oldPassword" type="password" placeholder="请输入原密码" show-password />
    </el-form-item>

    <el-form-item label="新密码" prop="newPassword">
      <el-input v-model="formData.newPassword" type="password" placeholder="请输入新密码" show-password />
    </el-form-item>

    <el-form-item label="确认密码" prop="confirmPassword">
      <el-input v-model="formData.confirmPassword" type="password" placeholder="请确认新密码" show-password />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { FormInstance } from 'element-plus'
import { changeUserPassword } from '@/api/modules/user'

const emit = defineEmits(['passwordChange', 'formData'])
const formRef = ref<FormInstance>()

const formData = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const rules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (value !== formData.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const changePassword = async () => {
  try {
    await formRef.value?.validate()
    //添加调用API修改密码的代码
    const res = await changeUserPassword(formData)
    res && res.code === 200 ? emit('passwordChange', true) : emit('passwordChange', false)
    reset()
    return res && res.code === 200
  } catch (error) {
    console.error('密码表单验证失败', error)
    emit('passwordChange', false)
    return false
  }
}

const reset = () => {
  formRef.value?.resetFields()
}

defineExpose({
  changePassword,
  reset,
  formData
})
</script>
