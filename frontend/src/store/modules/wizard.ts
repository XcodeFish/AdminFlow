import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
import type {
  WizardData,
  WizardStep,
  GenerationResult,
  ValidationError,
  TableDetail,
  GeneratorField,
  PageConfig,
  ConfigCreateDto,
  ColumnInfo,
  GeneratedCodeFile
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
  const initWizard = (initialData?: Partial<WizardData>, initDatasourceId?: number) => {
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

    generatorFields.value = tableDetail.value.columns.map((column: ColumnInfo) => {
      // 根据字段类型选择合适的表单组件
      let component = 'Input'
      if (column.type.includes('text')) {
        component = 'Textarea'
      } else if (column.type.includes('date') || column.type.includes('time')) {
        component = 'DatePicker'
      } else if (
        column.name.includes('status') ||
        column.name.includes('type') ||
        column.name.includes('sex')
      ) {
        component = 'Select'
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
        validate: column.nullable
          ? []
          : [{ required: true, message: `${column.comment || column.name}不能为空` }]
      } as GeneratorField
    })

    // 更新页面配置中的字段列表
    wizardData.pageConfig.listColumns = generatorFields.value
      .filter((field: GeneratorField) => field.showInList)
      .map((field: GeneratorField) => field.name)

    wizardData.pageConfig.searchColumns = generatorFields.value
      .filter((field: GeneratorField) => field.showInSearch)
      .map((field: GeneratorField) => field.name)

    wizardData.pageConfig.formColumns = generatorFields.value
      .filter((field: GeneratorField) => field.showInForm)
      .map((field: GeneratorField) => field.name)
  }

  // 方法：将数据库类型映射为TypeScript类型
  const mapDbTypeToTsType = (dbType: string): string => {
    if (
      dbType.includes('int') ||
      dbType.includes('float') ||
      dbType.includes('double') ||
      dbType.includes('decimal')
    ) {
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
      // 检查是否有必要的信息来生成代码
      if (!wizardData.basicInfo.moduleName) {
        ElMessage.error('请先设置模块名称')
        return null
      }

      // 尝试从向导数据中获取表名，如果没有tableDetail
      const tableName =
        tableDetail.value?.tableName || wizardData.basicInfo.moduleName.toLowerCase() + '_table'
      const dsId = datasourceId.value || 1 // 如果没有数据源ID，使用默认值1

      // 构建正确的页面配置格式
      const formattedPageConfig = {
        list: {
          title: wizardData.pageConfig.listTitle || wizardData.basicInfo.moduleName + '管理',
          showCheckbox: wizardData.pageConfig.showCheckbox ?? true,
          showPagination: wizardData.pageConfig.showPagination ?? true,
          pageSize: wizardData.pageConfig.pageSize ?? 10,
          showOperation: wizardData.pageConfig.showOperation ?? true,
          operations: wizardData.pageConfig.selectedOperations || ['view', 'edit', 'delete']
        },
        form: {
          width: wizardData.pageConfig.formWidth || '600px',
          labelWidth: wizardData.pageConfig.labelWidth || '120px',
          labelPosition: wizardData.pageConfig.labelPosition || 'right',
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

      // 使用字段配置，如果没有则创建默认字段
      let fields = generatorFields.value
      if (fields.length === 0 && wizardData.pageConfig.listColumns.length > 0) {
        // 根据列表字段创建一些默认字段配置
        fields = wizardData.pageConfig.listColumns.map(
          (name) =>
            ({
              name,
              type: 'varchar',
              tsType: 'string',
              comment: name,
              showInList: true,
              showInForm: true,
              showInSearch: false,
              component: 'Input',
              queryType: 'EQ'
            }) as GeneratorField
        )
      } else if (fields.length === 0) {
        // 创建一些默认字段
        fields = [
          {
            name: 'id',
            type: 'int',
            tsType: 'number',
            comment: 'ID',
            showInList: true,
            showInForm: false,
            showInSearch: false,
            component: 'Input',
            queryType: 'EQ',
            isPrimary: true
          },
          {
            name: 'name',
            type: 'varchar',
            tsType: 'string',
            comment: '名称',
            showInList: true,
            showInForm: true,
            showInSearch: true,
            component: 'Input',
            queryType: 'LIKE',
            validate: [{ required: true, message: '名称不能为空' }]
          }
        ] as GeneratorField[]
      }

      // 构建配置创建DTO
      const configDto = {
        moduleName: wizardData.basicInfo.moduleName,
        tableName: tableName,
        description: wizardData.basicInfo.moduleDescription || '',
        datasourceId: dsId,
        apiPrefix: `/api/${wizardData.basicInfo.moduleName.toLowerCase()}`,
        packageName:
          wizardData.basicInfo.packageName ||
          `com.adminflow.${wizardData.basicInfo.moduleName.toLowerCase().replace(/_/g, '.')}`,
        templateType: 'default',
        fields:
          fields.length > 0
            ? fields.map((field) => ({
                name: field.name,
                type: field.type || 'varchar',
                tsType: field.tsType || 'string',
                component: field.component || 'Input',
                showInList: field.showInList === undefined ? true : field.showInList,
                showInForm: field.showInForm === undefined ? true : field.showInForm,
                showInSearch: field.showInSearch === undefined ? false : field.showInSearch,
                queryType: field.queryType || 'EQ',
                validate: field.validate || []
              }))
            : [
                {
                  name: 'id',
                  type: 'int',
                  tsType: 'number',
                  comment: 'ID',
                  showInList: true,
                  showInForm: false,
                  showInSearch: false,
                  component: 'Input',
                  queryType: 'EQ',
                  isPrimary: true
                }
              ],
        pageConfig: formattedPageConfig,
        author: wizardData.basicInfo.author || 'admin'
      }

      console.log('创建配置DTO:', JSON.stringify(configDto, null, 2))

      // 创建配置
      try {
        // 添加请求日志
        console.log('请求URL:', import.meta.env.VITE_BASE_URL)
        console.log('请求路径:', '/generator/configs')
        console.log('请求头:', {
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem('token')
            ? `Bearer ${localStorage.getItem('token')}`
            : '未设置'
        })
        console.log('请求体:', JSON.stringify(configDto, null, 2))

        const config = await generatorApi.config.create(configDto)
        console.log('创建配置成功:', config)

        // 生成预览
        const preview = await generatorApi.code.preview(config.data.id)
        console.log('生成预览成功:', preview)

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
          const frontendFiles =
            preview.data.frontend?.map((f: GeneratedCodeFile) => ({
              path: `frontend/${f.fileName}`,
              content: f.content,
              language: getLanguageFromPath(f.fileName),
              size: f.content.length,
              isChanged: false
            })) || []

          // 处理后端代码
          const backendFiles =
            preview.data.backend?.map((f: GeneratedCodeFile) => ({
              path: `backend/${f.fileName}`,
              content: f.content,
              language: getLanguageFromPath(f.fileName),
              size: f.content.length,
              isChanged: false
            })) || []

          // 处理SQL代码
          const sqlFiles =
            preview.data.sql?.map((f: GeneratedCodeFile) => ({
              path: `sql/${f.fileName}`,
              content: f.content,
              language: 'sql',
              size: f.content.length,
              isChanged: false
            })) || []

          result.files = [...frontendFiles, ...backendFiles, ...sqlFiles]
          result.stats = {
            totalFiles: result.files.length,
            totalCodeLines: result.files.reduce(
              (acc, file) => acc + file.content.split('\n').length,
              0
            ),
            frontendFiles: frontendFiles.length,
            backendFiles: backendFiles.length
          }
        }

        previewResult.value = result
        isCompleted.value = true
        return result
      } catch (error: any) {
        console.error('创建配置失败:', error.response?.data || error.message || error)
        ElMessage.error(
          `生成代码失败: ${error.response?.data?.message || error.message || '未知错误'}`
        )
        throw error
      }
    } catch (error: any) {
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
      ts: 'typescript',
      js: 'javascript',
      vue: 'vue',
      java: 'java',
      xml: 'xml',
      json: 'json',
      sql: 'sql',
      md: 'markdown',
      css: 'css',
      scss: 'scss',
      less: 'less',
      html: 'html'
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
