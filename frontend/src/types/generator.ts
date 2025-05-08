/**
 * 代码生成器相关类型定义
 */

// 数据源基础信息
export interface Datasource {
  id: number
  name: string
  type: string
  host: string
  port: number
  database: string
  username: string
  isActive: boolean
  options?: DatasourceOptions
  createdAt?: Date
  updatedAt?: Date
}

// 数据源选项
export interface DatasourceOptions {
  charset?: string
  timezone?: string
  [key: string]: any
}

// 创建数据源参数
export interface CreateDatasourceParams {
  name: string
  type: string
  host: string
  port: number
  database: string
  username: string
  password: string
  options?: DatasourceOptions
}

// 更新数据源参数
export interface UpdateDatasourceParams {
  name?: string
  host?: string
  port?: number
  database?: string
  username?: string
  password?: string
  options?: DatasourceOptions
  isActive?: boolean
}

// 测试数据源连接参数
export interface TestConnectionParams {
  type: string
  host: string
  port: number
  database: string
  username: string
  password: string
  options?: DatasourceOptions
}

// 数据库表信息
export interface TableInfo {
  tableName: string
  engine: string
  tableComment: string
  createTime: string
  tableRows: number
  dataLength: string
}

// 表字段信息
export interface ColumnInfo {
  name: string
  type: string
  length: number
  nullable: boolean
  isPrimary: boolean
  isAutoIncrement: boolean
  defaultValue: any
  comment: string
}

// 表索引信息
export interface IndexInfo {
  name: string
  columns: string[]
  type: string
}

// 表详细信息
export interface TableDetail {
  tableName: string
  engine: string
  tableComment: string
  createTime: string
  primaryKey: string
  columns: ColumnInfo[]
  indexes: IndexInfo[]
}

// 代码生成配置字段
export interface GeneratorField {
  name: string
  type?: string
  tsType?: string
  length?: number
  nullable?: boolean
  isPrimary?: boolean
  isAutoIncrement?: boolean
  defaultValue?: any
  comment?: string
  showInList: boolean
  showInForm: boolean
  showInSearch: boolean
  component: string
  dictType?: string
  queryType: string
  validate?: ValidateRule[]
}

// 验证规则
export interface ValidateRule {
  required?: boolean
  message?: string
  max?: number
  min?: number
  pattern?: string
  [key: string]: any
}

// 页面配置
export interface PageConfig {
  list: ListPageConfig
  form: FormConfig
  permissions: PagePermissions
}

// 列表页配置
export interface ListPageConfig {
  title: string
  showCheckbox: boolean
  showPagination: boolean
  pageSize: number
  showOperation: boolean
  operations: string[]
}

// 表单配置
export interface FormConfig {
  width: string
  labelWidth: string
  labelPosition: string
  size: string
}

// 页面权限配置
export interface PagePermissions {
  list: string
  create: string
  update: string
  delete: string
  export: string
  import: string
}

// 代码生成配置
export interface GeneratorConfig {
  id: number
  moduleName: string
  tableName: string
  description: string
  datasourceId: number
  apiPrefix: string
  packageName?: string
  templateType: string
  fields: GeneratorField[]
  pageConfig: PageConfig
  isGenerated: boolean
  generatedAt?: Date
  author: string
  createdAt?: Date
  updatedAt?: Date
}

// 创建代码生成配置参数
export interface CreateGeneratorConfigParams {
  moduleName: string
  tableName: string
  description: string
  datasourceId: number
  apiPrefix: string
  packageName?: string
  templateType: string
  fields: GeneratorField[]
  pageConfig: PageConfig
  author: string
}

// 更新代码生成配置参数
export interface UpdateGeneratorConfigParams {
  moduleName?: string
  description?: string
  apiPrefix?: string
  packageName?: string
  fields?: GeneratorField[]
  pageConfig?: PageConfig
}

// 导入表结构参数
export interface ImportTableParams {
  datasourceId: number
  tableName: string
  templateType: string
  author: string
}

// 生成代码部署选项
export interface GenerateDeployOptions {
  overwrite?: boolean
  generateFrontend?: boolean
  generateBackend?: boolean
  generateSql?: boolean
  registerMenu?: boolean
  registerPermission?: boolean
}

// 生成任务信息
export interface GenerateTask {
  taskId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  startTime: Date
  endTime?: Date
  logs: { time: Date; message: string }[]
}

// 版本信息
export interface GeneratorVersion {
  id: number
  configId: number
  version: string
  creator: string
  createdAt: Date
  description: string
  snapshot?: {
    moduleName: string
    tableName: string
    apiPrefix: string
    packageName?: string
    description: string
    fields: Array<{
      name: string
      type: string
      component: string
      showInList: boolean
      showInForm: boolean
      showInSearch: boolean
    }>
  }
}

// 生成代码文件信息
export interface GeneratedCodeFile {
  fileName: string
  content: string
}

// API 响应类型定义
export interface DatasourceListResponse {
  code: number
  message: string
  data: {
    items: Datasource[]
    total: number
    page: number
    limit: number
  }
}

export interface DatasourceResponse {
  code: number
  message: string
  data: Datasource
}

export interface ConnectionTestResponse {
  code: number
  message: string
  data: {
    connected: boolean
    version: string
    connectTime: string
  }
}

export interface TableListResponse {
  code: number
  message: string
  data: {
    items: TableInfo[]
    total: number
    page: number
    limit: number
  }
}

export interface TableDetailResponse {
  code: number
  message: string
  data: TableDetail
}

export interface GeneratorConfigListResponse {
  code: number
  message: string
  data: {
    items: GeneratorConfig[]
    total: number
    page: number
    limit: number
  }
}

export interface GeneratorConfigResponse {
  code: number
  message: string
  data: GeneratorConfig
}

export interface GeneratePreviewResponse {
  code: number
  message: string
  data: {
    frontend: GeneratedCodeFile[]
    backend: GeneratedCodeFile[]
    sql: GeneratedCodeFile[]
  }
}

export interface GenerateDeployResponse {
  code: number
  message: string
  data: {
    taskId: string
    files: {
      frontend: number
      backend: number
      sql: number
    }
    generatedAt: Date
    deployStatus: string
    accessUrl: string
  }
}

export interface TaskStatusResponse {
  code: number
  message: string
  data: GenerateTask
}

export interface VersionListResponse {
  code: number
  message: string
  data: {
    items: GeneratorVersion[]
    total: number
    page: number
    limit: number
  }
}

export interface RollbackResponse {
  code: number
  message: string
  data: {
    taskId: string
    targetVersion: string
    rollbackAt: Date
  }
}

// 全局设置类型
export interface GlobalSettings {
  defaultTemplate: string
  enableAutoSave: boolean
  deployAfterGenerate: boolean
  indentSize: number
  theme: string
}

// 生成记录类型
export interface GenerationRecord {
  id: string
  name: string
  createdAt: string
  config: any
  status: 'success' | 'failed' | 'pending'
  error?: string
}

// 最近项目类型
export interface RecentProject {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  template: string
}

// 表结构相关类型
export interface Table {
  id: number
  name: string
  comment?: string
  engine?: string
  collation?: string
  recordCount?: number
  datasourceId: number
}

export interface TableColumn {
  id: number
  name: string
  dataType: string
  columnType: string
  comment?: string
  isPrimary: boolean
  isNullable: boolean
  defaultValue?: string
  maxLength?: number
  precision?: number
  scale?: number
  tableId: number
  ordinalPosition: number
  config?: ColumnConfig
}

export interface ColumnConfig {
  displayName?: string
  componentType?: string
  showInList?: boolean
  showInForm?: boolean
  showInSearch?: boolean
  validationRules?: ValidationRule[]
  format?: string
  sortable?: boolean
  filterable?: boolean
  width?: number
}

export interface ValidationRule {
  type: string
  message: string
  required?: boolean
  min?: number
  max?: number
  pattern?: string
  trigger?: string
}

export interface TableRelation {
  id: number
  sourceTableId: number
  sourceColumnId: number
  targetTableId: number
  targetColumnId: number
  relationType: 'oneToOne' | 'oneToMany' | 'manyToOne' | 'manyToMany'
}

// 表元数据类型
export interface TableMetadata {
  id: string
  name: string
  comment?: string
  columns: ColumnMetadata[]
  primaryKey?: string
  uniqueKeys?: string[][]
  foreignKeys?: ForeignKey[]
  datasourceId: number
}

export interface ColumnMetadata {
  id: string
  name: string
  dataType: string
  columnType: string
  comment?: string
  isPrimary: boolean
  isNullable: boolean
  defaultValue?: string
  maxLength?: number
  precision?: number
  scale?: number
  ordinalPosition: number
  mapping?: ColumnMapping
}

export interface ColumnMapping {
  componentType: string
  displayName: string
  showInList: boolean
  showInForm: boolean
  showInSearch: boolean
  validationRules: ValidationRule[]
}

export interface ForeignKey {
  sourceColumn: string
  targetTable: string
  targetColumn: string
}

export interface ColumnTypeMapping {
  dbType: string
  jsType: string
  tsType: string
  defaultComponent: string
  defaultValidations: ValidationRule[]
}

export interface ComponentMapping {
  componentType: string
  component: string
  defaultProps: Record<string, any>
  supportedTypes: string[]
}

export interface ValidationRuleMapping {
  ruleType: string
  dbTypes: string[]
  defaultMessage: string
  defaultParams: Record<string, any>
}

// 代码预览类型
export interface PreviewFile {
  path: string
  content: string
  language: string
  size: number
  isChanged: boolean
  originalContent?: string
}

export interface FileTreeNode {
  name: string
  path: string
  type: 'file' | 'directory'
  size?: number
  children?: FileTreeNode[]
  expanded?: boolean
}

export type PreviewMode = 'code' | 'preview' | 'diff'

export interface EditorOptions {
  tabSize: number
  theme: string
  fontSize: number
  wordWrap: boolean
  showLineNumbers: boolean
}

// 部署相关类型
export interface Deployment {
  id: number
  configId: number
  status: DeploymentStatus
  createdAt: string
  completedAt?: string
  destination: string
  options: DeployOptions
  logs: DeploymentLog[]
}

export type DeploymentStatus = 'pending' | 'running' | 'success' | 'failed' | 'canceled'

export interface DeployOptions {
  environment: string
  autoMigrate: boolean
  backup: boolean
  registerRoutes: boolean
  destinationPath?: string
}

export interface DeploymentLog {
  timestamp: string
  level: 'info' | 'warning' | 'error'
  message: string
}

// 向导相关类型
export interface WizardStep {
  id: string
  name: string
  component: string
  description: string
  order: number
}

export interface WizardData {
  basicInfo: {
    moduleName: string
    moduleDescription: string
    packageName: string
    author: string
  }
  tableConfig: {
    tableId: number
    columns: WizardColumnConfig[]
  }
  pageConfig: {
    listStyle: string
    formStyle: string
    listColumns: string[]
    searchColumns: string[]
    formColumns: string[]
  }
  advancedConfig: {
    enableImport: boolean
    enableExport: boolean
    batchOperations: boolean
    permissions: string[]
    customOptions: Record<string, any>
  }
}

export interface WizardColumnConfig {
  columnId: string
  displayName: string
  componentType: string
  showInList: boolean
  showInForm: boolean
  showInSearch: boolean
  sortable: boolean
  filterable: boolean
  validations: ValidationRule[]
}

export interface ValidationError {
  field: string
  message: string
}

export interface GenerationResult {
  id: string
  files: PreviewFile[]
  stats: {
    totalFiles: number
    totalCodeLines: number
    frontendFiles: number
    backendFiles: number
  }
}

// 版本类型
export interface Version {
  id: number
  configId: number
  version: string
  note: string
  createdAt: string
  createdBy: string
  snapshot: any
}

export interface VersionDiff {
  addedFiles: string[]
  removedFiles: string[]
  changedFiles: FileDiff[]
}

export interface FileDiff {
  path: string
  changes: {
    added: number
    removed: number
    changed: number
  }
  diff: string
}

// DTO类型
export interface DatasourceCreateDto {
  name: string
  type: string
  host: string
  port: number
  username: string
  password: string
  database: string
  options?: Record<string, any>
}

export interface DatasourceUpdateDto {
  name?: string
  host?: string
  port?: number
  username?: string
  password?: string
  options?: Record<string, any>
}

export interface DatasourceTestDto {
  type: string
  host: string
  port: number
  username: string
  password: string
  database: string
  options?: Record<string, any>
}

export interface ConfigCreateDto {
  moduleName: string
  description?: string
  tableId: number
  datasourceId: number
  templateId: string
  fields: any
  pageConfig: any
  options?: any
}

export interface ConfigUpdateDto {
  moduleName?: string
  description?: string
  fields?: any
  pageConfig?: any
  options?: any
}

export interface ColumnConfigUpdateDto {
  displayName?: string
  componentType?: string
  showInList?: boolean
  showInForm?: boolean
  showInSearch?: boolean
  validationRules?: ValidationRule[]
}

export interface SaveChangesDto {
  configId: number
  files: {
    path: string
    content: string
  }[]
}

export interface VersionCreateDto {
  configId: number
  note: string
}

export interface CompareVersionsDto {
  versionId1: number
  versionId2: number
}

export interface DeployRequestDto {
  configId: number
  options: DeployOptions
}

export interface ConnectionStatus {
  success: boolean
  message: string
  details?: any
}
