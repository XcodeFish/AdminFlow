<template>
  <el-dialog :title="roleId ? '编辑角色' : '新增角色'" v-model="dialogVisible" width="500px" destroy-on-close
    @closed="handleDialogClosed">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px" label-position="right" class="mt-4"
      @submit.prevent>
      <el-form-item label="角色名称" prop="roleName">
        <el-input v-model="formData.roleName" placeholder="请输入角色名称" />
      </el-form-item>

      <el-form-item label="角色标识" prop="roleKey">
        <el-input v-model="formData.roleKey" :disabled="!!roleId" placeholder="请输入角色标识" />
      </el-form-item>

      <el-form-item label="数据权限" prop="dataScope">
        <el-select v-model="formData.dataScope" placeholder="请选择数据权限" style="width: 100%;">
          <el-option :value="1" label="全部" />
          <el-option :value="2" label="自定义" />
          <el-option :value="3" label="本部门" />
          <el-option :value="4" label="部门及以下" />
          <el-option :value="5" label="仅本人" />
        </el-select>
      </el-form-item>

      <el-form-item label="排序" prop="orderNum">
        <el-input-number v-model="formData.orderNum" :min="0" :max="999" />
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio :value="1">启用</el-radio>
          <el-radio :value="0">禁用</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" type="textarea" placeholder="请输入备注" />
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
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { createRole, updateRole, getRoleById } from '@/api/modules/role'
import type { CreateRoleParams, UpdateRoleParams } from '@/types/role'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  roleId: {
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
const defaultFormData = (): CreateRoleParams => ({
  roleName: '',
  roleKey: '',
  dataScope: 5, // 默认仅本人
  orderNum: 0,
  status: 1, // 默认启用
  remark: ''
})

const formData = reactive<CreateRoleParams & UpdateRoleParams>(defaultFormData())

// 表单验证规则
const rules = reactive<FormRules>({
  roleName: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 50, message: '角色名称长度应为2-50个字符', trigger: 'blur' }
  ],
  roleKey: [
    { required: true, message: '请输入角色标识', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '角色标识只能包含字母、数字和下划线', trigger: 'blur' },
    { min: 2, max: 100, message: '角色标识长度应为2-100个字符', trigger: 'blur' }
  ],
  dataScope: [
    { required: true, message: '请选择数据权限', trigger: 'change' }
  ],
  orderNum: [
    { required: true, message: '请设置排序', trigger: 'blur' }
  ]
})

// 监听roleId变化获取角色信息
watch(() => props.roleId, async (newVal) => {
  if (newVal && dialogVisible.value) {
    await fetchRoleInfo(newVal)
  }
}, { immediate: true })

// 获取角色信息
const fetchRoleInfo = async (id: string) => {
  try {
    const res = await getRoleById(id)
    if (res.code === 0) {
      const role = res.data
      // 重置表单数据
      Object.assign(formData, {
        roleName: role.roleName || '',
        roleKey: role.roleKey || '',
        dataScope: role.dataScope || 5,
        orderNum: role.orderNum || 0,
        status: role.status || 1,
        remark: role.remark || ''
      })
    }
  } catch (error) {
    console.error('获取角色信息失败:', error)
    ElMessage.error('获取角色信息失败')
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitting.value = true
    try {
      if (props.roleId) {
        // 编辑角色，移除不需要的字段
        const { roleKey, ...updateData } = formData
        await updateRole(props.roleId, updateData)
        ElMessage.success('更新角色成功')
      } else {
        // 创建角色
        await createRole(formData)
        ElMessage.success('创建角色成功')
      }

      dialogVisible.value = false
      emit('success')
    } catch (error: any) {
      console.error('保存角色失败:', error)
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
