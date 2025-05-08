import { ref, computed, reactive } from 'vue'
import { useWizardStore } from '@/store/modules/wizard'
import type { GeneratorField, ValidateRule } from '@/types/generator'

/**
 * 字段配置Hook，用于管理字段配置相关逻辑
 */
export function useFieldConfig() {
  const wizardStore = useWizardStore()

  // 获取字段数据
  const fields = computed(() => wizardStore.generatorFields)

  // 字段编辑时的临时数据
  const editingField = ref<GeneratorField | null>(null)
  const isEditing = computed(() => !!editingField.value)

  // 控件类型选项
  const componentOptions = reactive([
    { label: '文本框', value: 'Input' },
    { label: '数字输入框', value: 'InputNumber' },
    { label: '文本域', value: 'Textarea' },
    { label: '选择器', value: 'Select' },
    { label: '单选框', value: 'Radio' },
    { label: '复选框', value: 'Checkbox' },
    { label: '开关', value: 'Switch' },
    { label: '时间选择器', value: 'TimePicker' },
    { label: '日期选择器', value: 'DatePicker' },
    { label: '日期时间选择器', value: 'DateTimePicker' },
    { label: '上传组件', value: 'Upload' },
    { label: '富文本编辑器', value: 'Editor' }
  ])

  // 查询类型选项
  const queryTypeOptions = reactive([
    { label: '精确查询', value: 'EQ' },
    { label: '模糊查询', value: 'LIKE' },
    { label: '左模糊', value: 'LEFT_LIKE' },
    { label: '右模糊', value: 'RIGHT_LIKE' },
    { label: '不等于', value: 'NE' },
    { label: '大于', value: 'GT' },
    { label: '大于等于', value: 'GE' },
    { label: '小于', value: 'LT' },
    { label: '小于等于', value: 'LE' },
    { label: '区间', value: 'BETWEEN' },
    { label: '包含', value: 'IN' }
  ])

  /**
   * 更新字段配置
   * @param updatedFields 更新后的字段列表
   */
  const updateFields = (updatedFields: GeneratorField[]) => {
    wizardStore.updateFieldConfig(updatedFields)
  }

  /**
   * 开始编辑字段
   * @param field 要编辑的字段
   */
  const startEditField = (field: GeneratorField) => {
    // 创建副本以避免直接修改原始数据
    editingField.value = JSON.parse(JSON.stringify(field))
  }

  /**
   * 保存字段编辑
   */
  const saveFieldEdit = () => {
    if (!editingField.value) return

    const updatedFields = fields.value.map((field) =>
      field.name === editingField.value?.name ? editingField.value : field
    )

    updateFields(updatedFields)
    cancelEditField()
  }

  /**
   * 取消字段编辑
   */
  const cancelEditField = () => {
    editingField.value = null
  }

  /**
   * 切换字段在列表中的显示状态
   * @param fieldName 字段名称
   */
  const toggleListDisplay = (fieldName: string) => {
    const updatedFields = fields.value.map((field) => {
      if (field.name === fieldName) {
        return { ...field, showInList: !field.showInList }
      }
      return field
    })

    updateFields(updatedFields)
  }

  /**
   * 切换字段在表单中的显示状态
   * @param fieldName 字段名称
   */
  const toggleFormDisplay = (fieldName: string) => {
    const updatedFields = fields.value.map((field) => {
      if (field.name === fieldName) {
        return { ...field, showInForm: !field.showInForm }
      }
      return field
    })

    updateFields(updatedFields)
  }

  /**
   * 切换字段在搜索条件中的显示状态
   * @param fieldName 字段名称
   */
  const toggleSearchDisplay = (fieldName: string) => {
    const updatedFields = fields.value.map((field) => {
      if (field.name === fieldName) {
        return { ...field, showInSearch: !field.showInSearch }
      }
      return field
    })

    updateFields(updatedFields)
  }

  /**
   * 更新字段组件类型
   * @param fieldName 字段名称
   * @param componentType 组件类型
   */
  const updateFieldComponent = (fieldName: string, componentType: string) => {
    const updatedFields = fields.value.map((field) => {
      if (field.name === fieldName) {
        return { ...field, component: componentType }
      }
      return field
    })

    updateFields(updatedFields)
  }

  /**
   * 更新字段查询类型
   * @param fieldName 字段名称
   * @param queryType 查询类型
   */
  const updateFieldQueryType = (fieldName: string, queryType: string) => {
    const updatedFields = fields.value.map((field) => {
      if (field.name === fieldName) {
        return { ...field, queryType }
      }
      return field
    })

    updateFields(updatedFields)
  }

  /**
   * 更新字段验证规则
   * @param fieldName 字段名称
   * @param rules 验证规则
   */
  const updateFieldValidation = (fieldName: string, rules: ValidateRule[]) => {
    const updatedFields = fields.value.map((field) => {
      if (field.name === fieldName) {
        return { ...field, validate: rules }
      }
      return field
    })

    updateFields(updatedFields)
  }

  /**
   * 添加必填验证规则
   * @param fieldName 字段名称
   */
  const addRequiredValidation = (fieldName: string) => {
    const field = fields.value.find((f) => f.name === fieldName)
    if (!field) return

    const hasRequired = field.validate?.some((rule) => 'required' in rule && rule.required)

    if (!hasRequired) {
      const validationRules = [
        ...(field.validate || []),
        {
          required: true,
          message: `${field.comment || field.name}不能为空`
        }
      ]

      updateFieldValidation(fieldName, validationRules)
    }
  }

  /**
   * 移除必填验证规则
   * @param fieldName 字段名称
   */
  const removeRequiredValidation = (fieldName: string) => {
    const field = fields.value.find((f) => f.name === fieldName)
    if (!field || !field.validate) return

    const validationRules = field.validate.filter((rule) => !('required' in rule && rule.required))

    updateFieldValidation(fieldName, validationRules)
  }

  /**
   * 移动字段位置
   * @param oldIndex 原始索引
   * @param newIndex 目标索引
   */
  const moveField = (oldIndex: number, newIndex: number) => {
    if (
      oldIndex < 0 ||
      oldIndex >= fields.value.length ||
      newIndex < 0 ||
      newIndex >= fields.value.length
    ) {
      return
    }

    const updatedFields = [...fields.value]
    const [removed] = updatedFields.splice(oldIndex, 1)
    updatedFields.splice(newIndex, 0, removed)

    updateFields(updatedFields)
  }

  return {
    fields,
    editingField,
    isEditing,
    componentOptions,
    queryTypeOptions,

    updateFields,
    startEditField,
    saveFieldEdit,
    cancelEditField,
    toggleListDisplay,
    toggleFormDisplay,
    toggleSearchDisplay,
    updateFieldComponent,
    updateFieldQueryType,
    updateFieldValidation,
    addRequiredValidation,
    removeRequiredValidation,
    moveField
  }
}

export default useFieldConfig
