<template>
  <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px" class="user-form">
    <FormRow>
      <FormCol :span="12">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" disabled />
        </el-form-item>
      </FormCol>
      <FormCol :span="12">
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="formData.nickname" placeholder="请输入昵称" />
        </el-form-item>
      </FormCol>
    </FormRow>

    <FormRow>
      <FormCol :span="12">
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="formData.realName" placeholder="请输入真实姓名" />
        </el-form-item>
      </FormCol>
      <FormCol :span="12">
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="formData.gender">
            <el-radio label="男" :value="1">男</el-radio>
            <el-radio label="女" :value="2">女</el-radio>
            <el-radio label="保密" :value="0">保密</el-radio>
          </el-radio-group>
        </el-form-item>
      </FormCol>
    </FormRow>

    <FormRow>
      <FormCol :span="12">
        <el-form-item label="手机号码" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号码" />
        </el-form-item>
      </FormCol>
      <FormCol :span="12">
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
      </FormCol>
    </FormRow>

    <el-form-item label="头像" prop="avatar">
      <ImageUploader v-model="formData.avatar" />
    </el-form-item>

    <el-form-item label="备注" prop="remark">
      <el-input v-model="formData.remark" type="textarea" placeholder="请输入备注信息" :rows="3" />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { FormInstance } from 'element-plus'
import type { User, UpdateUserParams } from '@/types/user'
import FormRow from '@/components/common/FormRow.vue'
import FormCol from '@/components/common/FormCol.vue'
import ImageUploader from '@/components/common/ImageUploader.vue'

interface Props {
  userInfo: User
}

const props = defineProps<Props>()
const emit = defineEmits(['formChange'])

const formRef = ref<FormInstance>()
const formData = reactive<UpdateUserParams & { username?: string }>({
  username: '',
  nickname: '',
  realName: '',
  email: '',
  phone: '',
  gender: 0,
  avatar: '',
  remark: ''
})

const rules = {
  nickname: [
    { max: 30, message: '昵称长度不能超过30个字符', trigger: 'blur' }
  ],
  realName: [
    { max: 30, message: '真实姓名长度不能超过30个字符', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    {
      pattern: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
      message: '请输入正确的邮箱地址',
      trigger: 'blur'
    }
  ]
}

watch(
  () => props.userInfo,
  (newVal) => {
    if (newVal) {
      formData.username = newVal.username || ''
      formData.nickname = newVal.nickname || ''
      formData.realName = newVal.realName || ''
      formData.email = newVal.email || ''
      formData.phone = newVal.phone || ''
      formData.gender = newVal.gender || 0
      formData.avatar = newVal.avatar || ''
      formData.remark = newVal.remark || ''
      emit('formChange', formData)
    }
  },
  { immediate: true, deep: true }
)

// 监听表单数据变化
watch(
  formData,
  (newVal) => {
    emit('formChange', newVal)
  },
  { deep: true }
)

// 暴露方法供父组件调用
defineExpose({
  validate: async () => {
    return formRef.value?.validate()
      .then(() => true)
      .catch(() => false)
  }
})
</script>

<style scoped>
.user-form {
  padding: 10px;
}
</style>
