<template>
  <div class="advanced-config-step">
    <div class="step-header">
      <h3>高级配置</h3>
      <p class="description">
        配置高级选项和生成方式，包括代码模板、生成选项等。
      </p>
    </div>

    <el-form ref="formRef" :model="formData" label-width="120px" class="advanced-config-form">
      <!-- 模板选择 -->
      <el-divider content-position="left">模板选择</el-divider>

      <el-form-item label="模板类型">
        <el-radio-group v-model="formData.templateType">
          <el-radio label="默认模板" value="default">默认模板</el-radio>
          <el-radio label="简单模板" value="simple">简单模板</el-radio>
          <el-radio label="详细模板" value="detailed">详细模板</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 生成选项 -->
      <el-divider content-position="left">生成选项</el-divider>

      <el-form-item label="启用导入">
        <el-switch v-model="formData.enableImport" />
      </el-form-item>

      <el-form-item label="启用导出">
        <el-switch v-model="formData.enableExport" />
      </el-form-item>

      <el-form-item label="批量操作">
        <el-switch v-model="formData.batchOperations" />
      </el-form-item>

      <el-form-item label="可打印">
        <el-switch v-model="formData.enablePrint" />
      </el-form-item>

      <!-- 前端配置 -->
      <el-divider content-position="left">前端配置</el-divider>

      <el-form-item label="生成前端代码">
        <el-switch v-model="formData.generateFrontend" />
      </el-form-item>

      <el-form-item label="注册菜单">
        <el-switch v-model="formData.registerMenu" :disabled="!formData.generateFrontend" />
      </el-form-item>

      <el-form-item label="菜单图标" v-if="formData.registerMenu">
        <el-input v-model="formData.menuIcon" placeholder="菜单图标，如: UserFilled" />
      </el-form-item>

      <!-- 后端配置 -->
      <el-divider content-position="left">后端配置</el-divider>

      <el-form-item label="生成后端代码">
        <el-switch v-model="formData.generateBackend" />
      </el-form-item>

      <el-form-item label="生成SQL">
        <el-switch v-model="formData.generateSql" :disabled="!formData.generateBackend" />
      </el-form-item>

      <el-form-item label="注册权限">
        <el-switch v-model="formData.registerPermission" :disabled="!formData.generateBackend" />
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { ElForm, ElFormItem, ElInput, ElSwitch, ElDivider, ElRadioGroup, ElRadio } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { useWizardState } from '../hooks/useWizardState'

// 获取向导状态
const { wizardData, updateStepData } = useWizardState()

// 表单引用
const formRef = ref<FormInstance>()

// 表单数据
const formData = reactive({
  // 模板选择
  templateType: 'default',

  // 生成选项
  enableImport: false,
  enableExport: false,
  batchOperations: false,
  enablePrint: false,

  // 前端配置
  generateFrontend: true,
  registerMenu: true,
  menuIcon: 'List',

  // 后端配置
  generateBackend: true,
  generateSql: true,
  registerPermission: true
})

// 初始化
onMounted(() => {
  // 从向导数据中恢复表单数据
  if (wizardData.advancedConfig) {
    formData.enableImport = wizardData.advancedConfig.enableImport || false
    formData.enableExport = wizardData.advancedConfig.enableExport || false
    formData.batchOperations = wizardData.advancedConfig.batchOperations || false

    // 其他选项从自定义选项中恢复
    if (wizardData.advancedConfig.customOptions) {
      const { customOptions } = wizardData.advancedConfig
      formData.enablePrint = customOptions.enablePrint || false
      formData.generateFrontend = customOptions.generateFrontend !== false
      formData.registerMenu = customOptions.registerMenu !== false
      formData.menuIcon = customOptions.menuIcon || 'List'
      formData.generateBackend = customOptions.generateBackend !== false
      formData.generateSql = customOptions.generateSql !== false
      formData.registerPermission = customOptions.registerPermission !== false
      formData.templateType = customOptions.templateType || 'default'
    }
  }
})

// 保存表单数据
const saveFormData = async () => {
  await formRef.value?.validate((valid) => {
    if (valid) {
      // 更新高级配置
      updateStepData('advancedConfig', {
        enableImport: formData.enableImport,
        enableExport: formData.enableExport,
        batchOperations: formData.batchOperations,
        customOptions: {
          enablePrint: formData.enablePrint,
          generateFrontend: formData.generateFrontend,
          registerMenu: formData.registerMenu,
          menuIcon: formData.menuIcon,
          generateBackend: formData.generateBackend,
          generateSql: formData.generateSql,
          registerPermission: formData.registerPermission,
          templateType: formData.templateType
        }
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
.advanced-config-step {
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

  .advanced-config-form {
    max-width: 700px;
  }
}
</style>
