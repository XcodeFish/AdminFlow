<template>
  <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px" :close-on-click-modal="false" append-to-body
    @close="closeDialog">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px" class="dept-form">
      <el-form-item label="上级部门">
        <TreeSelect :data="deptOptions" :modelValue="formData.parentId === undefined ? null : formData.parentId"
          @update:modelValue="val => formData.parentId = val" labelKey="deptName" valueKey="id" rootLabel="顶级部门"
          :rootValue=null :showRoot=true placeholder="请选择上级部门" />
      </el-form-item>

      <el-form-item label="部门名称" prop="deptName">
        <el-input v-model="formData.deptName" placeholder="请输入部门名称" maxlength="50" show-word-limit />
      </el-form-item>

      <el-form-item label="显示顺序" prop="orderNum">
        <el-input-number v-model="formData.orderNum" :min="0" :max="999" controls-position="right" />
      </el-form-item>

      <el-form-item label="负责人" prop="leader">
        <el-input v-model="formData.leader" placeholder="请输入负责人姓名" maxlength="20" />
      </el-form-item>

      <el-form-item label="联系电话" prop="phone">
        <el-input v-model="formData.phone" placeholder="请输入联系电话" maxlength="11" />
      </el-form-item>

      <el-form-item label="邮箱" prop="email">
        <el-input v-model="formData.email" placeholder="请输入邮箱" maxlength="50" />
      </el-form-item>

      <el-form-item label="部门状态">
        <el-radio-group v-model="formData.status">
          <el-radio :label="1">正常</el-radio>
          <el-radio :label="0">停用</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import TreeSelect from '@/components/common/TreeSelect.vue'
import type { CreateDeptParams } from '@/types/dept'
import type { FormInstance, FormRules } from 'element-plus'
import type { DeptTree } from '@/types/dept'

const formRef = ref<FormInstance>()

const props = defineProps<{
  visible: boolean
  formData: CreateDeptParams
  rules: FormRules
  dialogTitle: string
  deptOptions: DeptTree[]
}>()

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void
  (e: 'closeDialog'): void
  (e: 'submitForm'): void
}>()

// 对话框显示状态
const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

// 关闭对话框
const closeDialog = () => {
  emit('closeDialog')
}

// 提交表单
const submitForm = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      emit('submitForm')
    }
  })
}

defineExpose({
  formRef
})
</script>

<style lang="scss" scoped>
.dept-form {
  .el-input-number {
    width: 100%;
  }
}
</style>
