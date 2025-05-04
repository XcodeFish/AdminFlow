<template>
  <el-dialog :title="userId ? '编辑用户' : '新增用户'" v-model="dialogVisible" width="580px" destroy-on-close
    @closed="handleDialogClosed">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px" label-position="right" class="mt-4"
      @submit.prevent>
      <el-form-item label="用户名" prop="username">
        <el-input v-model="formData.username" :disabled="!!userId" placeholder="请输入用户名" />
      </el-form-item>

      <el-form-item label="姓名" prop="realName">
        <el-input v-model="formData.realName" placeholder="请输入真实姓名" />
      </el-form-item>

      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="formData.nickname" placeholder="请输入昵称" />
      </el-form-item>

      <el-form-item label="密码" prop="password" v-if="!userId">
        <el-input v-model="formData.password" type="password" show-password placeholder="请输入密码" />
      </el-form-item>

      <el-form-item label="手机号" prop="phone">
        <el-input v-model="formData.phone" placeholder="请输入手机号" />
      </el-form-item>

      <el-form-item label="邮箱" prop="email">
        <el-input v-model="formData.email" placeholder="请输入邮箱" />
      </el-form-item>

      <el-form-item label="所属部门" prop="deptId">
        <el-tree-select v-model="formData.deptId" :data="deptOptions" node-key="id" placeholder="请选择所属部门"
          :props="{ label: 'deptName', children: 'children' }" check-strictly />
      </el-form-item>

      <el-form-item label="角色" prop="roleIds">
        <el-select v-model="formData.roleIds" multiple collapse-tags collapse-tags-tooltip placeholder="请选择角色"
          style="width: 100%;">
          <el-option v-for="item in roleOptions" :key="item.id" :label="item.roleName" :value="item.id" />
        </el-select>
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio :value=(1)>启用</el-radio>
          <el-radio :value=(0)>禁用</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="性别" prop="gender">
        <el-radio-group v-model="formData.gender">
          <el-radio :value=(1)>男</el-radio>
          <el-radio :value=(2)>女</el-radio>
          <el-radio :value=(0)>保密</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" type="textarea" placeholder="请输入备注信息" />
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
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import { createUser, updateUser, getUserById } from '@/api/modules/user'
import type { CreateUserParams, UpdateUserParams, Role } from '@/types/user'

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

console.log('props 弹框', props.userId, props.visible);


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

// 部门和角色选项
const deptOptions = ref([
  {
    id: 1, deptName: '总公司', children: [
      { id: 2, deptName: '研发部' },
      { id: 3, deptName: '市场部' },
      { id: 4, deptName: '运营部' }
    ]
  }
])

const roleOptions = ref<Role[]>([
  { id: '1', roleName: '管理员', roleKey: 'admin', orderNum: 1, status: 1, dataScope: 1, permissions: [] },
  { id: '2', roleName: '普通用户', roleKey: 'user', orderNum: 2, status: 1, dataScope: 5, permissions: [] },
  { id: '3', roleName: '开发人员', roleKey: 'dev', orderNum: 3, status: 1, dataScope: 2, permissions: [] },
])

// 表单数据
const defaultFormData = (): CreateUserParams => ({
  username: '',
  password: '',
  nickname: '',
  realName: '',
  email: '',
  phone: '',
  gender: 0,
  remark: '',
  status: 1,
  deptId: undefined,
  roleIds: []
})

const formData = reactive<CreateUserParams & UpdateUserParams>(defaultFormData())

// 表单验证规则
const rules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度应为2-20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6个字符', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  roleIds: [
    { type: 'array', required: false, message: '请选择角色', trigger: 'change' }
  ]
})

// 监听userId变化获取用户信息
watch(() => props.userId, async (newVal) => {
  if (newVal && dialogVisible.value) {
    await fetchUserInfo(newVal)
  }
}, { immediate: true })

// 获取用户信息
const fetchUserInfo = async (id: string) => {
  try {
    const res = await getUserById(id)
    const user = res.data

    // 重置表单数据
    Object.assign(formData, {
      username: user.username || '',
      nickname: user.nickname || '',
      realName: user.realName || '',
      email: user.email || '',
      phone: user.phone || '',
      gender: user.gender || 0,
      avatar: user.avatar || '',
      remark: user.remark || '',
      status: user.status || 1,
      deptId: user.deptId,
      roleIds: user.roles?.map(role => role.id) || []
    })
  } catch (error) {
    console.error('获取用户信息失败:', error)
    ElMessage.error('获取用户信息失败')
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitting.value = true
    try {
      if (props.userId) {
        // 编辑用户，移除不需要的字段
        const { username, password, ...updateData } = formData
        await updateUser(props.userId, updateData)
        ElMessage.success('更新用户成功')
      } else {
        // 创建用户
        await createUser(formData)
        ElMessage.success('创建用户成功')
      }

      dialogVisible.value = false
      emit('success')
    } catch (error: any) {
      console.error('保存用户失败:', error)
      ElMessage.error(error.message || '操作失败')
    } finally {
      submitting.value = false
    }
  })
}

// 弹窗关闭时重置表单
const handleDialogClosed = () => {
  Object.assign(formData, defaultFormData())
  formRef.value?.resetFields()
}
</script>
