import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
import type {
  WizardData,
  WizardStep,
  GenerationResult,
  ValidationError,
  TableDetail,
  GeneratorField,
  PageConfig
} from '@/types/generator'
import generatorApi from '@/api/modules/generator'
import { ElMessage } from 'element-plus'

// 定义一个基础的向导步骤
const defaultSteps: WizardStep[] = [
  {
    id: 'basic-info',
    name: '基本信息',
    component: 'BasicInfo',
    description: '设置模块的基本信息',
    order: 1
  },
  {
    id: 'field-config',
    name: '字段配置',
    component: 'FieldConfig',
    description: '配置数据表字段的显示和校验规则',
    order: 2
  },
  {
    id: 'page-config',
    name: '页面配置',
    component: 'PageConfig',
    description: '配置列表和表单页面的显示方式',
    order: 3
  },
  {
    id: 'advanced-config',
    name: '高级配置',
    component: 'AdvancedConfig',
    description: '设置高级选项和生成方式',
    order: 4
  },
  {
    id: 'preview-confirm',
    name: '预览确认',
    component: 'PreviewConfirm',
    description: '预览生成结果并确认',
    order: 5
  }
]

// 默认页面配置
const defaultPageConfig: PageConfig = {
  list: {
    title: '',
    showCheckbox: true,
    showPagination: true,
    pageSize: 10,
    showOperation: true,
    operations: ['create', 'update', 'delete']
  },
  form: {
    width: '600px',
    labelWidth: '120px',
    labelPosition: 'right',
    size: 'default'
  },
  permissions: {
    list: '',
    create: '',
    update: '',
    delete: '',
    export: '',
    import: ''
  }
}

// 初始化默认向导数据
const initialWizardData: WizardData = {
  basicInfo: {
    moduleName: '',
    moduleDescription: '',
    packageName: '',
    author: ''
  },
  tableConfig: {
    tableId: 0,
    columns: []
  },
  pageConfig: {
    listStyle: 'default',
    formStyle: 'default',
    listColumns: [],
    searchColumns: [],
    formColumns: []
  },
  advancedConfig: {
    enableImport: false,
    enableExport: false,
    batchOperations: false,
    permissions: [],
    customOptions: {}
  }
}

export const useWizardStore = defineStore('wizard', () => {
  // 状态
  const steps = ref<WizardStep[]>(defaultSteps)
  const currentStepIndex = ref(0)
  const wizardData = reactive<WizardData>({ ...initialWizardData })
  const validationErrors = ref<ValidationError[]>([])
  const isLoading = ref(false)
  const isCompleted = ref(false)
  const previewResult = ref<GenerationResult | null>(null)
  const datasourceId = ref<number | null>(null)
  const tableDetail = ref<TableDetail | null>(null)
  const generatorFields = ref<GeneratorField[]>([])

  // 计算属性
  const currentStep = computed(() => steps.value[currentStepIndex.value] || null)
  const canGoNext = computed(() => currentStepIndex.value < steps.value.length - 1)
  const canGoPrev = computed(() => currentStepIndex.value > 0)
  const progress = computed(() => {
    return Math.round(((currentStepIndex.value + 1) / steps.value.length) * 100)
  })

  // 方法：重置向导
  const resetWizard = () => {
    currentStepIndex.value = 0
    Object.assign(wizardData, initialWizardData)
    validationErrors.value = []
    isCompleted.value = false
    previewResult.value = null
    datasourceId.value = null
    tableDetail.value = null
    generatorFields.value = []
  }

  // 方法：初始化向导
  const initWizard = (
    initialData?: Partial<WizardData>,
    initDatasourceId?: number
  ) => {
    resetWizard()
    if (initialData) {
      Object.assign(wizardData, initialData)
    }
    if (initDatasourceId) {
      datasourceId.value = initDatasourceId
    }
  }

  // 方法：前往下一步
  const goToNextStep = async (): Promise<boolean> => {
    const errors = validateCurrentStep()
    if (errors.length > 0) {
      validationErrors.value = errors
      return false
    }

    validationErrors.value = []
    if (canGoNext.value) {
      currentStepIndex.value++
      return true
    }
    return false
  }

  // 方法：前往上一步
  const goToPrevStep = () => {
    if (canGoPrev.value) {
      currentStepIndex.value--
    }
  }

  // 方法：前往指定步骤
  const goToStep = (index: number) => {
    if (index >= 0 && index < steps.value.length) {
      currentStepIndex.value = index
    }
  }

  // 方法：验证当前步骤
  const validateCurrentStep = (): ValidationError[] => {
    const errors: ValidationError[] = []
    const step = currentStep.value

    if (!step) return errors

    switch (step.id) {
      case 'basic-info':
        if (!wizardData.basicInfo.moduleName?.trim()) {
          errors.push({ field: 'moduleName', message: '模块名称不能为空' })
        }
        break

      case 'field-config':
        if (generatorFields.value.length === 0) {
          errors.push({ field: 'fields', message: '至少需要配置一个字段' })
        }
        break

      case 'page-config':
        if (wizardData.pageConfig.listColumns.length === 0) {
          errors.push({ field: 'listColumns', message: '至少需要选择一个列表显示字段' })
        }
        break

      // 其他步骤验证逻辑...
    }

    return errors
  }

  // 方法：更新向导数据
  const updateWizardData = (step: string, data: any) => {
    if (step === 'basicInfo') {
      Object.assign(wizardData.basicInfo, data)
    } else if (step === 'tableConfig') {
      Object.assign(wizardData.tableConfig, data)
    } else if (step === 'pageConfig') {
      Object.assign(wizardData.pageConfig, data)
    } else if (step === 'advancedConfig') {
      Object.assign(wizardData.advancedConfig, data)
    }
  }

  // 方法：获取表结构详情
  const fetchTableDetail = async (dsId: number, tableName: string) => {
    isLoading.value = true
    try {
      const response = await generatorApi.table.getColumns(dsId, tableName)
      tableDetail.value = response.data

      // 生成字段配置
      transformTableToFields()

      return response.data
    } catch (error) {
      console.error('获取表结构失败:', error)
      ElMessage.error('获取表结构失败')
      return null
    } finally {
      isLoading.value = false
    }
  }

  // 方法：将表结构转换为字段配置
  const transformTableToFields = () => {
    if (!tableDetail.value) return

    generatorFields.value = tableDetail.value.columns.map(column => {
      // 根据列类型设置合适的表单控件
      let component = 'Input'
      if (column.type.includes('int')) {
        component = 'InputNumber'
      } else if (column.type.includes('date') || column.type.includes('time')) {
        component = 'DatePicker'
      } else if (column.type.includes('text')) {
        component = 'Textarea'
      }

      return {
        name: column.name,
        type: column.type,
        tsType: mapDbTypeToTsType(column.type),
        length: column.length,
        nullable: column.nullable,
        isPrimary: column.isPrimary,
        isAutoIncrement: column.isAutoIncrement,
        defaultValue: column.defaultValue,
        comment: column.comment || column.name,
        showInList: true,
        showInForm: !column.isAutoIncrement,
        showInSearch: column.isPrimary || column.name === 'name' || column.name.endsWith('_name'),
        component,
        queryType: 'EQ',
        validate: column.nullable ? [] : [{ required: true, message: `${column.comment || column.name}不能为空` }]
      } as GeneratorField
    })

    // 更新页面配置中的字段列表
    wizardData.pageConfig.listColumns = generatorFields.value
      .filter(f => f.showInList)
      .map(f => f.name)

    wizardData.pageConfig.searchColumns = generatorFields.value
      .filter(f => f.showInSearch)
      .map(f => f.name)

    wizardData.pageConfig.formColumns = generatorFields.value
      .filter(f => f.showInForm)
      .map(f => f.name)
  }

  // 方法：将数据库类型映射为TypeScript类型
  const mapDbTypeToTsType = (dbType: string): string => {
    if (dbType.includes('int') || dbType.includes('float') || dbType.includes('double') || dbType.includes('decimal')) {
      return 'number'
    } else if (dbType.includes('date') || dbType.includes('time')) {
      return 'Date'
    } else if (dbType.includes('boolean')) {
      return 'boolean'
    } else {
      return 'string'
    }
  }

  // 方法：完成向导并生成代码
  const completeWizard = async (): Promise<GenerationResult | null> => {
    const errors = validateCurrentStep()
    if (errors.length > 0) {
      validationErrors.value = errors
      return null
    }

    isLoading.value = true
    try {
      // 构建配置创建DTO
      const configDto = {
        moduleName: wizardData.basicInfo.moduleName,
        description: wizardData.basicInfo.moduleDescription,
        datasourceId: datasourceId.value,
        tableName: tableDetail.value?.tableName,
        apiPrefix: `/api/${wizardData.basicInfo.moduleName.toLowerCase()}`,
        packageName: wizardData.basicInfo.packageName,
        templateType: 'default',
        fields: generatorFields.value,
        pageConfig: {
          ...defaultPageConfig,
          list: {
            ...defaultPageConfig.list,
            title: wizardData.basicInfo.moduleName + '管理'
          }
        },
        author: wizardData.basicInfo.author
      }

      // 创建配置
      const config = await generatorApi.config.create(configDto)

      // 生成预览
      const preview = await generatorApi.code.preview(config.data.id)

      const result: GenerationResult = {
        id: config.data.id.toString(),
        files: [],
        stats: {
          totalFiles: 0,
          totalCodeLines: 0,
          frontendFiles: 0,
          backendFiles: 0
        }
      }

      // 转换预览数据为文件列表
      if (preview.data) {
        // 处理前端代码
        const frontendFiles = preview.data.frontend?.map(f => ({
          path: `frontend/${f.fileName}`,
          content: f.content,
          language: getLanguageFromPath(f.fileName),
          size: f.content.length,
          isChanged: false
        })) || []

        // 处理后端代码
        const backendFiles = preview.data.backend?.map(f => ({
          path: `backend/${f.fileName}`,
          content: f.content,
          language: getLanguageFromPath(f.fileName),
          size: f.content.length,
          isChanged: false
        })) || []

        // 处理SQL代码
        const sqlFiles = preview.data.sql?.map(f => ({
          path: `sql/${f.fileName}`,
          content: f.content,
          language: 'sql',
          size: f.content.length,
          isChanged: false
        })) || []

        result.files = [...frontendFiles, ...backendFiles, ...sqlFiles]
        result.stats = {
          totalFiles: result.files.length,
          totalCodeLines: result.files.reduce((acc, file) => acc + file.content.split('\n').length, 0),
          frontendFiles: frontendFiles.length,
          backendFiles: backendFiles.length
        }
      }

      previewResult.value = result
      isCompleted.value = true
      return result
    } catch (error) {
      console.error('生成代码失败:', error)
      ElMessage.error('生成代码失败')
      return null
    } finally {
      isLoading.value = false
    }
  }

  // 工具方法：根据文件路径获取语言类型
  const getLanguageFromPath = (path: string): string => {
    const ext = path.split('.').pop()?.toLowerCase() || ''
    const langMap: Record<string, string> = {
      'ts': 'typescript',
      'js': 'javascript',
      'vue': 'vue',
      'java': 'java',
      'xml': 'xml',
      'json': 'json',
      'sql': 'sql',
      'md': 'markdown',
      'css': 'css',
      'scss': 'scss',
      'less': 'less',
      'html': 'html'
    }

    return langMap[ext] || 'plaintext'
  }

  // 更新字段配置
  const updateFieldConfig = (fields: GeneratorField[]) => {
    generatorFields.value = fields
  }

  return {
    // 状态
    steps,
    currentStepIndex,
    wizardData,
    validationErrors,
    isLoading,
    isCompleted,
    previewResult,
    datasourceId,
    tableDetail,
    generatorFields,

    // 计算属性
    currentStep,
    canGoNext,
    canGoPrev,
    progress,

    // 方法
    resetWizard,
    initWizard,
    goToNextStep,
    goToPrevStep,
    goToStep,
    validateCurrentStep,
    updateWizardData,
    fetchTableDetail,
    completeWizard,
    updateFieldConfig
  }
})
