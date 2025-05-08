<template>
  <div class="page-config-step">
    <div class="step-header">
      <h3>页面配置</h3>
      <p class="description">
        配置生成页面的布局和功能选项，包括列表样式、表单样式和按钮权限等。
      </p>
    </div>

    <el-form ref="formRef" :model="formData" label-width="120px" class="page-config-form">
      <!-- 列表配置 -->
      <el-divider content-position="left">列表页配置</el-divider>

      <el-form-item label="列表标题">
        <el-input v-model="formData.listTitle" placeholder="请输入列表页标题" />
      </el-form-item>

      <el-form-item label="列表样式">
        <el-radio-group v-model="formData.listStyle">
          <el-radio label="表格布局" value="table">表格布局</el-radio>
          <el-radio label="卡片布局" value="card">卡片布局</el-radio>
          <el-radio label="列表布局" value="list">列表布局</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="显示选择框">
        <el-switch v-model="formData.showCheckbox" />
      </el-form-item>

      <el-form-item label="分页设置">
        <div class="flex-row">
          <el-switch v-model="formData.showPagination" class="mr-3" />
          <el-input-number v-model="formData.pageSize" :min="5" :max="100" :step="5"
            :disabled="!formData.showPagination" />
        </div>
      </el-form-item>

      <el-form-item label="列表显示字段">
        <el-select v-model="formData.listColumns" multiple filterable placeholder="请选择要在列表中显示的字段" style="width: 100%">
          <el-option v-for="field in fields" :key="field.name" :label="field.comment || field.name" :value="field.name"
            :disabled="!field.showInList" />
        </el-select>
      </el-form-item>

      <!-- 表单配置 -->
      <el-divider content-position="left">表单配置</el-divider>

      <el-form-item label="表单宽度">
        <el-input v-model="formData.formWidth" placeholder="如: 600px 或 80%" />
      </el-form-item>

      <el-form-item label="标签宽度">
        <el-input v-model="formData.labelWidth" placeholder="如: 120px" />
      </el-form-item>

      <el-form-item label="标签位置">
        <el-radio-group v-model="formData.labelPosition">
          <el-radio label="右对齐" value="right">右对齐</el-radio>
          <el-radio label="左对齐" value="left">左对齐</el-radio>
          <el-radio label="顶部对齐" value="top">顶部对齐</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="表单显示字段">
        <el-select v-model="formData.formColumns" multiple filterable placeholder="请选择要在表单中显示的字段" style="width: 100%">
          <el-option v-for="field in fields" :key="field.name" :label="field.comment || field.name" :value="field.name"
            :disabled="!field.showInForm" />
        </el-select>
      </el-form-item>

      <!-- 查询配置 -->
      <el-divider content-position="left">查询条件配置</el-divider>

      <el-form-item label="查询显示字段">
        <el-select v-model="formData.searchColumns" multiple filterable placeholder="请选择要在查询中显示的字段" style="width: 100%">
          <el-option v-for="field in fields" :key="field.name" :label="field.comment || field.name" :value="field.name"
            :disabled="!field.showInSearch" />
        </el-select>
      </el-form-item>

      <!-- 权限配置 -->
      <el-divider content-position="left">权限配置</el-divider>

      <el-form-item label="列表权限码">
        <el-input v-model="formData.listPermission" placeholder="如: system:user:list" />
      </el-form-item>

      <el-form-item label="新增权限码">
        <el-input v-model="formData.createPermission" placeholder="如: system:user:create" />
      </el-form-item>

      <el-form-item label="修改权限码">
        <el-input v-model="formData.updatePermission" placeholder="如: system:user:update" />
      </el-form-item>

      <el-form-item label="删除权限码">
        <el-input v-model="formData.deletePermission" placeholder="如: system:user:delete" />
      </el-form-item>

      <el-form-item label="导出权限码">
        <el-input v-model="formData.exportPermission" placeholder="如: system:user:export" />
      </el-form-item>

      <el-form-item label="导入权限码">
        <el-input v-model="formData.importPermission" placeholder="如: system:user:import" />
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElDivider, ElRadioGroup, ElRadio, ElSwitch, ElInputNumber } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { useWizardState } from '../hooks/useWizardState'
import { useFieldConfig } from '../hooks/useFieldConfig'

// 获取向导状态
const { wizardData, updateStepData } = useWizardState()

// 获取字段配置
const { fields } = useFieldConfig()

// 表单引用
const formRef = ref<FormInstance>()

// 表单数据
const formData = reactive({
  // 列表配置
  listTitle: '',
  listStyle: 'table',
  showCheckbox: true,
  showPagination: true,
  pageSize: 10,
  listColumns: [] as string[],

  // 表单配置
  formWidth: '600px',
  labelWidth: '120px',
  labelPosition: 'right',
  formColumns: [] as string[],

  // 查询配置
  searchColumns: [] as string[],

  // 权限配置
  listPermission: '',
  createPermission: '',
  updatePermission: '',
  deletePermission: '',
  exportPermission: '',
  importPermission: ''
})

// 初始化
onMounted(() => {
  // 从向导数据中恢复表单数据
  if (wizardData.pageConfig) {
    formData.listStyle = wizardData.pageConfig.listStyle || 'table'
    formData.listColumns = [...wizardData.pageConfig.listColumns]
    formData.searchColumns = [...wizardData.pageConfig.searchColumns]
    formData.formColumns = [...wizardData.pageConfig.formColumns]
  }

  // 设置默认权限前缀
  const moduleName = wizardData.basicInfo.moduleName
  if (moduleName && !formData.listPermission) {
    const permissionPrefix = `system:${moduleName}:`
    formData.listPermission = `${permissionPrefix}list`
    formData.createPermission = `${permissionPrefix}create`
    formData.updatePermission = `${permissionPrefix}update`
    formData.deletePermission = `${permissionPrefix}delete`
    formData.exportPermission = `${permissionPrefix}export`
    formData.importPermission = `${permissionPrefix}import`
  }
})

// 保存表单数据
const saveFormData = async () => {
  await formRef.value?.validate((valid) => {
    if (valid) {
      // 更新向导状态
      updateStepData('pageConfig', {
        listStyle: formData.listStyle,
        listColumns: formData.listColumns,
        searchColumns: formData.searchColumns,
        formColumns: formData.formColumns
      })

      // 更新权限配置
      updateStepData('permissions', {
        list: formData.listPermission,
        create: formData.createPermission,
        update: formData.updatePermission,
        delete: formData.deletePermission,
        export: formData.exportPermission,
        import: formData.importPermission
      })
    }
  })
}

// 暴露方法给父组件
defineExpose({
  saveFormData
})
</script>

<style lang="scss" scoped>
.page-config-step {
  padding: 16px;

  .step-header {
    margin-bottom: 24px;

    h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
    }

    .description {
      margin: 0;
      color: var(--el-text-color-secondary);
    }
  }

  .page-config-form {
    max-width: 700px;
  }

  .flex-row {
    display: flex;
    align-items: center;
  }

  .mr-3 {
    margin-right: 12px;
  }
}
</style>
