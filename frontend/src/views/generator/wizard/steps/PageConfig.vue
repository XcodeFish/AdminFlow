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
          <el-radio label="table">表格布局</el-radio>
          <el-radio label="card">卡片布局</el-radio>
          <el-radio label="list">列表布局</el-radio>
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

      <!-- 操作按钮配置 -->
      <el-divider content-position="left">操作按钮配置</el-divider>

      <el-form-item label="显示操作栏">
        <el-switch v-model="formData.showOperation" />
      </el-form-item>

      <el-form-item label="操作栏宽度" v-if="formData.showOperation">
        <el-input v-model="formData.operationWidth" placeholder="如: 180px" />
      </el-form-item>

      <el-form-item label="表格操作按钮" v-if="formData.showOperation">
        <div class="button-config">
          <p class="config-tip">选择需要的按钮并拖动排序</p>

          <draggable v-model="formData.operations" item-key="value" handle=".drag-handle" :animation="150"
            class="button-list">
            <template #item="{ element }">
              <div class="button-item">
                <el-icon class="drag-handle"><d-arrow-left /></el-icon>
                <el-checkbox :model-value="isOperationSelected(element)" @update:model-value="toggleOperation(element)">
                  {{ getOperationLabel(element) }}
                </el-checkbox>
              </div>
            </template>
          </draggable>
        </div>
      </el-form-item>

      <el-form-item label="顶部工具栏按钮">
        <div class="button-config">
          <p class="config-tip">选择需要的按钮并拖动排序</p>

          <draggable v-model="formData.toolbarButtons" item-key="value" handle=".drag-handle" :animation="150"
            class="button-list">
            <template #item="{ element }">
              <div class="button-item">
                <el-icon class="drag-handle"><d-arrow-left /></el-icon>
                <el-checkbox :model-value="isToolbarButtonSelected(element)"
                  @update:model-value="toggleToolbarButton(element)">
                  {{ getToolbarButtonLabel(element) }}
                </el-checkbox>
              </div>
            </template>
          </draggable>
        </div>
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
          <el-radio label="right">右对齐</el-radio>
          <el-radio label="left">左对齐</el-radio>
          <el-radio label="top">顶部对齐</el-radio>
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
import { ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElDivider, ElRadioGroup, ElRadio, ElSwitch, ElInputNumber, ElCheckboxGroup, ElCheckbox, ElIcon } from 'element-plus'
import { DArrowLeft } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import { useWizardState } from '../hooks/useWizardState'
import { useFieldConfig } from '../hooks/useFieldConfig'
import draggable from 'vuedraggable'

// 获取向导状态
const { wizardData, updateStepData } = useWizardState()

// 获取字段配置
const { fields } = useFieldConfig()

// 表单引用
const formRef = ref<FormInstance>()

// 操作按钮映射
const operationLabels = {
  view: '查看',
  edit: '编辑',
  delete: '删除',
  copy: '复制',
  status: '状态切换'
}

// 工具栏按钮映射
const toolbarButtonLabels = {
  add: '新增',
  batchDelete: '批量删除',
  import: '导入',
  export: '导出',
  refresh: '刷新'
}

// 获取操作按钮标签
const getOperationLabel = (key: string) => {
  return operationLabels[key as keyof typeof operationLabels] || key
}

// 获取工具栏按钮标签
const getToolbarButtonLabel = (key: string) => {
  return toolbarButtonLabels[key as keyof typeof toolbarButtonLabels] || key
}

// 默认的操作按钮列表
const defaultOperations = ['view', 'edit', 'delete', 'copy', 'status']

// 默认的工具栏按钮列表
const defaultToolbarButtons = ['add', 'batchDelete', 'import', 'export', 'refresh']

// 表单数据
const formData = reactive({
  // 列表配置
  listTitle: '',
  listStyle: 'table',
  showCheckbox: true,
  showPagination: true,
  pageSize: 10,
  listColumns: [] as string[],

  // 操作按钮配置
  showOperation: true,
  operationWidth: '180px',
  operations: [...defaultOperations],
  selectedOperations: ['view', 'edit', 'delete'] as string[],
  toolbarButtons: [...defaultToolbarButtons],
  selectedToolbarButtons: ['add', 'refresh', 'export'] as string[],

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

// 检查操作按钮是否被选中
const isOperationSelected = (operation: string) => {
  return formData.selectedOperations.includes(operation)
}

// 切换操作按钮选中状态
const toggleOperation = (operation: string) => {
  const index = formData.selectedOperations.indexOf(operation)
  if (index === -1) {
    formData.selectedOperations.push(operation)
  } else {
    formData.selectedOperations.splice(index, 1)
  }
}

// 检查工具栏按钮是否被选中
const isToolbarButtonSelected = (button: string) => {
  return formData.selectedToolbarButtons.includes(button)
}

// 切换工具栏按钮选中状态
const toggleToolbarButton = (button: string) => {
  const index = formData.selectedToolbarButtons.indexOf(button)
  if (index === -1) {
    formData.selectedToolbarButtons.push(button)
  } else {
    formData.selectedToolbarButtons.splice(index, 1)
  }
}

// 初始化
onMounted(() => {
  // 从向导数据中恢复表单数据
  if (wizardData.pageConfig) {
    // 恢复基本字段
    formData.listStyle = wizardData.pageConfig.listStyle || 'table'
    formData.listTitle = wizardData.pageConfig.listTitle || ''
    formData.listColumns = [...(wizardData.pageConfig.listColumns || [])]
    formData.searchColumns = [...(wizardData.pageConfig.searchColumns || [])]
    formData.formColumns = [...(wizardData.pageConfig.formColumns || [])]

    // 恢复布局设置
    if (wizardData.pageConfig.showCheckbox !== undefined) {
      formData.showCheckbox = wizardData.pageConfig.showCheckbox
    }
    if (wizardData.pageConfig.showPagination !== undefined) {
      formData.showPagination = wizardData.pageConfig.showPagination
    }
    if (wizardData.pageConfig.pageSize !== undefined) {
      formData.pageSize = wizardData.pageConfig.pageSize
    }

    // 恢复表单设置
    if (wizardData.pageConfig.formWidth) {
      formData.formWidth = wizardData.pageConfig.formWidth
    }
    if (wizardData.pageConfig.labelWidth) {
      formData.labelWidth = wizardData.pageConfig.labelWidth
    }
    if (wizardData.pageConfig.labelPosition) {
      formData.labelPosition = wizardData.pageConfig.labelPosition
    }

    // 恢复操作按钮配置
    if (wizardData.pageConfig.showOperation !== undefined) {
      formData.showOperation = wizardData.pageConfig.showOperation
    }
    if (wizardData.pageConfig.operationWidth) {
      formData.operationWidth = wizardData.pageConfig.operationWidth
    }
    if (wizardData.pageConfig.selectedOperations && Array.isArray(wizardData.pageConfig.selectedOperations)) {
      formData.selectedOperations = [...wizardData.pageConfig.selectedOperations]
    }
    if (wizardData.pageConfig.selectedToolbarButtons && Array.isArray(wizardData.pageConfig.selectedToolbarButtons)) {
      formData.selectedToolbarButtons = [...wizardData.pageConfig.selectedToolbarButtons]
    }

    // 恢复操作按钮和工具栏按钮顺序
    if (wizardData.pageConfig.operations && Array.isArray(wizardData.pageConfig.operations)) {
      formData.operations = [...wizardData.pageConfig.operations]
    } else {
      // 如果没有保存操作按钮顺序，但有选中的按钮，则创建一个新的顺序
      if (wizardData.pageConfig.selectedOperations && Array.isArray(wizardData.pageConfig.selectedOperations)) {
        const selectedOps = [...wizardData.pageConfig.selectedOperations]
        const unselectedOps = defaultOperations.filter(op => !selectedOps.includes(op))
        formData.operations = [...selectedOps, ...unselectedOps]
      }
    }

    if (wizardData.pageConfig.toolbarButtons && Array.isArray(wizardData.pageConfig.toolbarButtons)) {
      formData.toolbarButtons = [...wizardData.pageConfig.toolbarButtons]
    } else {
      // 如果没有保存工具栏按钮顺序，但有选中的按钮，则创建一个新的顺序
      if (wizardData.pageConfig.selectedToolbarButtons && Array.isArray(wizardData.pageConfig.selectedToolbarButtons)) {
        const selectedButtons = [...wizardData.pageConfig.selectedToolbarButtons]
        const unselectedButtons = defaultToolbarButtons.filter(btn => !selectedButtons.includes(btn))
        formData.toolbarButtons = [...selectedButtons, ...unselectedButtons]
      }
    }
  }

  // 设置默认权限前缀
  const moduleName = wizardData.basicInfo?.moduleName
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
  let valid = true

  await formRef.value?.validate((isValid) => {
    valid = isValid
    if (isValid) {
      // 更新向导状态
      updateStepData('pageConfig', {
        listStyle: formData.listStyle,
        showCheckbox: formData.showCheckbox,
        showPagination: formData.showPagination,
        pageSize: formData.pageSize,
        listTitle: formData.listTitle,
        listColumns: formData.listColumns,
        searchColumns: formData.searchColumns,
        formColumns: formData.formColumns,
        showOperation: formData.showOperation,
        operationWidth: formData.operationWidth,
        operations: formData.operations,
        selectedOperations: formData.selectedOperations,
        toolbarButtons: formData.toolbarButtons,
        selectedToolbarButtons: formData.selectedToolbarButtons,
        formWidth: formData.formWidth,
        labelWidth: formData.labelWidth,
        labelPosition: formData.labelPosition
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

  return valid
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

  .button-config {
    width: 100%;

    .config-tip {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      margin-bottom: 8px;
    }

    .button-list {
      border: 1px solid var(--el-border-color);
      border-radius: 4px;
      padding: 8px;
      background-color: var(--el-fill-color-light);
      min-height: 100px;
    }

    .button-item {
      display: flex;
      align-items: center;
      padding: 8px;
      margin-bottom: 4px;
      background-color: white;
      border-radius: 4px;
      border: 1px solid var(--el-border-color-lighter);

      &:last-child {
        margin-bottom: 0;
      }

      .drag-handle {
        cursor: move;
        margin-right: 8px;
        color: var(--el-text-color-secondary);
      }
    }
  }
}
</style>
