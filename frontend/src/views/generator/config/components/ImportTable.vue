<template>
  <el-dialog
    v-model="visible"
    title="导入表结构"
    width="600px"
    :close-on-click-modal="false"
    destroy-on-close
    :before-close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      label-position="right"
      v-loading="loading"
    >
      <el-form-item label="数据源" prop="datasourceId">
        <el-select
          v-model="formData.datasourceId"
          placeholder="请选择数据源"
          style="width: 100%"
          @change="handleDatasourceChange"
        >
          <el-option
            v-for="item in datasourceList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="数据表" prop="tableName">
        <el-select
          v-model="formData.tableName"
          placeholder="请选择数据表"
          style="width: 100%"
          :loading="loadingTables"
          :disabled="!formData.datasourceId || loadingTables"
        >
          <el-option
            v-for="item in tableList"
            :key="item.tableName"
            :label="`${item.tableName}${item.tableComment ? ' (' + item.tableComment + ')' : ''}`"
            :value="item.tableName"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="模板类型" prop="templateType">
        <el-select
          v-model="formData.templateType"
          placeholder="请选择模板类型"
          style="width: 100%"
        >
          <el-option label="默认模板" value="default" />
          <el-option label="树形结构" value="tree" />
          <el-option label="主子表" value="master-slave" />
        </el-select>
      </el-form-item>

      <el-form-item label="作者" prop="author">
        <el-input v-model="formData.author" placeholder="请输入作者" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="loading">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, computed, watch, onMounted } from 'vue'
import type { ImportTableParams } from '@/types/generator'
import { useImportTable } from '../hooks/useImportTable'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'success': []
}>()

// 表单引用
const formRef = ref()

// 使用自定义hook处理导入逻辑
const {
  formData,
  loading,
  datasourceList,
  tableList,
  loadingTables,
  rules,
  fetchDatasourceList,
  handleDatasourceChange,
  submitImport,
  resetForm,
  initialize
} = useImportTable(() => {
  emit('success')
  handleClose()
})

// 对话框可见性的计算属性
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 关闭对话框
const handleClose = () => {
  resetForm(formRef.value)
  visible.value = false
}

// 提交表单
const submitForm = () => {
  submitImport(formRef.value)
}

// 监听对话框打开，初始化数据
watch(
  () => visible.value,
  (val) => {
    if (val) {
      initialize()
    }
  }
)

// 组件挂载时初始化
onMounted(() => {
  if (visible.value) {
    initialize()
  }
})
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
