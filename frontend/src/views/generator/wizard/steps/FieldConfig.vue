<template>
  <div class="field-config-step">
    <div class="step-header">
      <h3>字段配置</h3>
      <p class="description">
        配置数据库字段在前端的显示方式和验证规则。您可以调整字段在列表、表单和查询条件中的展示。
      </p>
    </div>

    <div v-if="isLoading" class="loading-container">
      <el-skeleton :rows="6" animated />
    </div>

    <template v-else>
      <!-- 字段列表 -->
      <el-table :data="fields" border stripe class="field-table" size="default" highlight-current-row
        @current-change="handleCurrentChange">
        <!-- 基础信息 -->
        <el-table-column label="字段名称" min-width="180">
          <template #default="{ row }">
            <div class="field-name">
              <span :class="{ 'primary-key': row.isPrimary }">{{ row.name }}</span>
              <span v-if="row.isPrimary" class="field-tag">主键</span>
              <span v-if="row.isAutoIncrement" class="field-tag auto">自增</span>
            </div>
            <div class="field-comment">{{ row.comment || row.name }}</div>
          </template>
        </el-table-column>

        <el-table-column label="字段类型" width="120">
          <template #default="{ row }">
            <el-tooltip :content="getFullTypeInfo(row)" placement="top">
              <span>{{ row.type }}</span>
            </el-tooltip>
          </template>
        </el-table-column>

        <!-- 展示选项 -->
        <el-table-column label="列表" width="80" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.showInList" @change="() => toggleListDisplay(row.name)" :disabled="row.isPrimary" />
          </template>
        </el-table-column>

        <el-table-column label="表单" width="80" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.showInForm" @change="() => toggleFormDisplay(row.name)"
              :disabled="row.isAutoIncrement" />
          </template>
        </el-table-column>

        <el-table-column label="查询" width="80" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.showInSearch" @change="() => toggleSearchDisplay(row.name)" />
          </template>
        </el-table-column>

        <!-- 控件类型 -->
        <el-table-column label="控件类型" width="150">
          <template #default="{ row }">
            <el-select v-model="row.component" size="small" @change="(val) => updateFieldComponent(row.name, val)">
              <el-option v-for="item in componentOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </template>
        </el-table-column>

        <!-- 查询方式 -->
        <el-table-column label="查询方式" width="150">
          <template #default="{ row }">
            <el-select v-model="row.queryType" size="small" :disabled="!row.showInSearch"
              @change="(val) => updateFieldQueryType(row.name, val)">
              <el-option v-for="item in queryTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </template>
        </el-table-column>

        <!-- 操作 -->
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="openFieldEditor(row)">
              编辑
            </el-button>

            <template v-if="row.validate && row.validate.length">
              <el-tooltip content="已配置验证规则" placement="top">
                <el-icon class="validate-icon">
                  <Check />
                </el-icon>
              </el-tooltip>
            </template>
          </template>
        </el-table-column>
      </el-table>

      <!-- 快捷操作 -->
      <div class="quick-actions">
        <el-button-group>
          <el-button type="primary" @click="selectAllFields">全选</el-button>
          <el-button type="info" @click="unselectAllFields">取消全选</el-button>
        </el-button-group>

        <el-button-group>
          <el-tooltip content="将所有非主键字段添加到列表显示">
            <el-button @click="selectAllList">全部列表显示</el-button>
          </el-tooltip>
          <el-tooltip content="将所有非自增字段添加到表单显示">
            <el-button @click="selectAllForm">全部表单显示</el-button>
          </el-tooltip>
          <el-tooltip content="清除所有查询条件">
            <el-button @click="clearAllSearch">清除全部查询条件</el-button>
          </el-tooltip>
        </el-button-group>
      </div>
    </template>

    <!-- 字段编辑对话框 -->
    <el-dialog v-model="dialogVisible" title="字段配置" width="600px" :close-on-click-modal="false"
      @closed="handleDialogClosed">
      <el-form v-if="editingField" ref="editFormRef" :model="editingField" label-width="100px" size="default">
        <el-form-item label="字段名称">
          <el-input v-model="editingField.name" disabled />
        </el-form-item>

        <el-form-item label="显示名称">
          <el-input v-model="editingField.comment" placeholder="请输入在界面上显示的名称" />
        </el-form-item>

        <el-form-item label="控件类型">
          <el-select v-model="editingField.component" class="w-full">
            <el-option v-for="item in componentOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="显示位置">
          <el-checkbox-group v-model="displayLocations">
            <el-checkbox label="list" :disabled="editingField.isPrimary">列表</el-checkbox>
            <el-checkbox label="form" :disabled="editingField.isAutoIncrement">表单</el-checkbox>
            <el-checkbox label="search">查询</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="查询方式" v-if="displayLocations.includes('search')">
          <el-select v-model="editingField.queryType" class="w-full">
            <el-option v-for="item in queryTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-divider content-position="center">验证规则</el-divider>

        <el-form-item label="必填">
          <el-switch v-model="isRequired" :disabled="editingField.isPrimary || !displayLocations.includes('form')" />
        </el-form-item>

        <el-form-item v-if="isRequired" label="错误提示">
          <el-input v-model="requiredMessage" placeholder="请输入必填验证失败时的错误提示" />
        </el-form-item>

        <!-- 字符串类型特有的验证 -->
        <template v-if="isStringType">
          <el-form-item label="最小长度">
            <el-input-number v-model="minLength" :min="0" :max="1000" :disabled="!displayLocations.includes('form')" />
          </el-form-item>

          <el-form-item label="最大长度">
            <el-input-number v-model="maxLength" :min="0" :max="1000" :disabled="!displayLocations.includes('form')" />
          </el-form-item>

          <el-form-item label="正则表达式">
            <el-input v-model="pattern" placeholder="输入正则表达式, 如: ^[a-zA-Z0-9]+$"
              :disabled="!displayLocations.includes('form')" />
          </el-form-item>
        </template>

        <!-- 数字类型特有的验证 -->
        <template v-if="isNumberType">
          <el-form-item label="最小值">
            <el-input-number v-model="minValue" :disabled="!displayLocations.includes('form')" />
          </el-form-item>

          <el-form-item label="最大值">
            <el-input-number v-model="maxValue" :disabled="!displayLocations.includes('form')" />
          </el-form-item>
        </template>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveFieldEdit">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { ElTable, ElTableColumn, ElButton, ElSwitch, ElSelect, ElOption, ElDialog, ElForm, ElFormItem, ElInput, ElInputNumber, ElCheckboxGroup, ElCheckbox, ElButtonGroup, ElTooltip, ElDivider, ElSkeleton, ElIcon } from 'element-plus'
import { Check } from '@element-plus/icons-vue'
import { useFieldConfig } from '../hooks/useFieldConfig'
import { useWizardState } from '../hooks/useWizardState'
import type { GeneratorField, ValidateRule } from '@/types/generator'
import type { FormInstance } from 'element-plus'

// 获取字段配置
const {
  fields,
  componentOptions,
  queryTypeOptions,
  updateFields,
  startEditField,
  saveFieldEdit: saveFieldEditing,
  cancelEditField,
  toggleListDisplay,
  toggleFormDisplay,
  toggleSearchDisplay,
  updateFieldComponent,
  updateFieldQueryType,
  editingField
} = useFieldConfig()

// 获取向导状态
const { isLoading } = useWizardState()

// 字段编辑相关
const dialogVisible = ref(false)
const editFormRef = ref<FormInstance>()
const currentField = ref<GeneratorField | null>(null)

// 编辑字段时的显示位置
const displayLocations = ref<string[]>([])

// 验证规则相关
const isRequired = ref(false)
const requiredMessage = ref('')
const minLength = ref<number | undefined>(undefined)
const maxLength = ref<number | undefined>(undefined)
const pattern = ref('')
const minValue = ref<number | undefined>(undefined)
const maxValue = ref<number | undefined>(undefined)

// 计算是否为字符串类型
const isStringType = computed(() => {
  if (!editingField.value || !editingField.value.type) return false
  const type = editingField.value.type.toLowerCase()
  return type.includes('char') || type.includes('text') || type.includes('json') || type.includes('enum')
})

// 计算是否为数字类型
const isNumberType = computed(() => {
  if (!editingField.value || !editingField.value.type) return false
  const type = editingField.value.type.toLowerCase()
  return type.includes('int') || type.includes('decimal') || type.includes('float') || type.includes('double')
})

// 监听编辑的字段变化，更新显示位置
watch(editingField, (newField) => {
  if (!newField) return

  // 更新显示位置
  displayLocations.value = []
  if (newField.showInList) displayLocations.value.push('list')
  if (newField.showInForm) displayLocations.value.push('form')
  if (newField.showInSearch) displayLocations.value.push('search')

  // 更新验证规则
  isRequired.value = false
  requiredMessage.value = ''
  minLength.value = undefined
  maxLength.value = undefined
  pattern.value = ''
  minValue.value = undefined
  maxValue.value = undefined

  // 解析现有验证规则
  if (newField.validate && newField.validate.length > 0) {
    newField.validate.forEach(rule => {
      // 处理必填规则
      if ('required' in rule && rule.required) {
        isRequired.value = true
        requiredMessage.value = rule.message || `${newField.comment || newField.name}不能为空`
      }

      // 处理长度规则
      if ('min' in rule && typeof rule.min === 'number') {
        if (isStringType.value) {
          minLength.value = rule.min
        } else if (isNumberType.value) {
          minValue.value = rule.min
        }
      }

      if ('max' in rule && typeof rule.max === 'number') {
        if (isStringType.value) {
          maxLength.value = rule.max
        } else if (isNumberType.value) {
          maxValue.value = rule.max
        }
      }

      // 处理正则表达式
      if ('pattern' in rule && rule.pattern) {
        pattern.value = rule.pattern
      }
    })
  }
})

// 监听显示位置变化，更新字段
watch(displayLocations, (newVal) => {
  if (!editingField.value) return

  editingField.value.showInList = newVal.includes('list')
  editingField.value.showInForm = newVal.includes('form')
  editingField.value.showInSearch = newVal.includes('search')
})

// 获取完整类型信息
const getFullTypeInfo = (field: GeneratorField): string => {
  let info = `${field.type}`
  if (field.length) {
    info += `(${field.length})`
  }
  if (field.nullable) {
    info += ', 可空'
  } else {
    info += ', 非空'
  }
  if (field.defaultValue !== undefined && field.defaultValue !== null) {
    info += `, 默认值: ${field.defaultValue}`
  }
  return info
}

// 打开字段编辑对话框
const openFieldEditor = (field: GeneratorField) => {
  startEditField(field)
  dialogVisible.value = true
}

// 对话框关闭处理
const handleDialogClosed = () => {
  cancelEditField()
}

// 字段选择变更
const handleCurrentChange = (val: GeneratorField | null) => {
  currentField.value = val
}

// 保存字段编辑
const saveFieldEdit = () => {
  if (!editingField.value) return

  // 构建验证规则
  const rules: ValidateRule[] = []

  // 添加必填规则
  if (isRequired.value) {
    rules.push({
      required: true,
      message: requiredMessage.value || `${editingField.value.comment || editingField.value.name}不能为空`
    })
  }

  // 添加字符串验证规则
  if (isStringType.value) {
    if (minLength.value !== undefined) {
      rules.push({
        min: minLength.value,
        message: `最小长度为${minLength.value}个字符`
      })
    }

    if (maxLength.value !== undefined) {
      rules.push({
        max: maxLength.value,
        message: `最大长度为${maxLength.value}个字符`
      })
    }

    if (pattern.value) {
      rules.push({
        pattern: pattern.value,
        message: `格式不正确`
      })
    }
  }

  // 添加数字验证规则
  if (isNumberType.value) {
    if (minValue.value !== undefined) {
      rules.push({
        min: minValue.value,
        message: `最小值为${minValue.value}`
      })
    }

    if (maxValue.value !== undefined) {
      rules.push({
        max: maxValue.value,
        message: `最大值为${maxValue.value}`
      })
    }
  }

  // 更新验证规则
  editingField.value.validate = rules

  // 保存编辑
  saveFieldEditing()
  dialogVisible.value = false
}

// 字段全选
const selectAllFields = () => {
  if (!fields.value) return

  const updatedFields = fields.value.map(field => ({
    ...field,
    showInList: !field.isPrimary,
    showInForm: !field.isAutoIncrement,
    showInSearch: field.isPrimary || field.name.includes('name') || field.name.includes('title')
  }))

  updateFields(updatedFields)
}

// 字段全不选
const unselectAllFields = () => {
  if (!fields.value) return

  const updatedFields = fields.value.map(field => ({
    ...field,
    showInList: field.isPrimary,
    showInForm: false,
    showInSearch: false
  }))

  updateFields(updatedFields.map(field => ({
    ...field,
    showInList: field.showInList ?? false
  })))
}

// 全部列表显示
const selectAllList = () => {
  if (!fields.value) return

  const updatedFields = fields.value.map(field => ({
    ...field,
    showInList: true
  }))

  updateFields(updatedFields)
}

// 全部表单显示
const selectAllForm = () => {
  if (!fields.value) return

  const updatedFields = fields.value.map(field => ({
    ...field,
    showInForm: !field.isAutoIncrement
  }))

  updateFields(updatedFields)
}

// 清除所有查询条件
const clearAllSearch = () => {
  if (!fields.value) return

  const updatedFields = fields.value.map(field => ({
    ...field,
    showInSearch: false
  }))

  updateFields(updatedFields)
}
</script>

<style lang="scss" scoped>
.field-config-step {
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

  .loading-container {
    padding: 20px;
  }

  .field-table {
    margin-bottom: 16px;

    .field-name {
      font-weight: bold;
      display: flex;
      align-items: center;

      .primary-key {
        color: var(--el-color-primary);
      }

      .field-tag {
        font-size: 12px;
        padding: 0 4px;
        margin-left: 4px;
        background-color: var(--el-color-primary-light-9);
        color: var(--el-color-primary);
        border-radius: 2px;

        &.auto {
          background-color: var(--el-color-success-light-9);
          color: var(--el-color-success);
        }
      }
    }

    .field-comment {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      margin-top: 4px;
    }

    .validate-icon {
      color: var(--el-color-success);
      margin-left: 8px;
    }
  }

  .quick-actions {
    display: flex;
    gap: 16px;
    margin-top: 16px;
  }

  .w-full {
    width: 100%;
  }
}
</style>
