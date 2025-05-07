import { defineStore } from 'pinia'
import { useDatasourceStore } from './datasource'
import { useMetadataStore } from './metadata'
import type { DatabaseTable, DatabaseColumn } from './datasource'
import { ApiError } from '@/types/error'
import generatorApi from '@/api/modules/generator'

export interface ColumnMapping {
  column: string
  label: string
  component: string
  componentProps?: Record<string, any>
  validation?: Record<string, any>
  listDisplay: boolean
  formDisplay: boolean
  searchable: boolean
  sortable: boolean
  filterable: boolean
  defaultValue?: any
  description?: string
}

export interface TableMapping {
  tableId: number
  tableName: string
  displayName: string
  description?: string
  primaryKey: string
  pagination: boolean
  searchFields: string[]
  sortField: string
  sortOrder: 'asc' | 'desc'
  columns: ColumnMapping[]
}

export interface TableState {
  selectedTable: DatabaseTable | null
  tableMapping: TableMapping | null
  mappingHistory: TableMapping[]
  isLoading: boolean
  error: ApiError | null
}

/**
 * 表结构管理Store
 */
export const useTableStore = defineStore('table', {
  state: (): TableState => ({
    selectedTable: null,
    tableMapping: null,
    mappingHistory: [],
    isLoading: false,
    error: null
  }),

  getters: {
    /**
     * 获取选中的表结构
     */
    getSelectedTable: (state): DatabaseTable | null => {
      return state.selectedTable
    },

    /**
     * 获取表字段映射
     */
    getTableMapping: (state): TableMapping | null => {
      return state.tableMapping
    },

    /**
     * 获取表字段映射历史
     */
    getMappingHistory: (state): TableMapping[] => {
      return state.mappingHistory
    },

    /**
     * 获取当前表的主键字段
     */
    getPrimaryKeyColumn: (state): DatabaseColumn | undefined => {
      if (!state.selectedTable || !state.selectedTable.columns) return undefined
      return state.selectedTable.columns.find((column) => column.isPrimaryKey)
    },

    /**
     * 获取字段映射
     */
    getColumnMappings: (state): ColumnMapping[] => {
      return state.tableMapping?.columns || []
    },

    /**
     * 获取搜索字段
     */
    getSearchFields: (state): string[] => {
      return state.tableMapping?.searchFields || []
    }
  },

  actions: {
    /**
     * 选择表结构
     * @param datasourceId 数据源ID
     * @param tableName 表名
     */
    async selectTable(datasourceId: number, tableName: string): Promise<void> {
      this.isLoading = true
      this.error = null

      try {
        const datasourceStore = useDatasourceStore()

        // 先获取数据源并选择
        await datasourceStore.fetchDatasourceById(datasourceId)

        // 如果表列表为空，则重新获取
        if (datasourceStore.tables.length === 0) {
          await datasourceStore.fetchTables(datasourceId)
        }

        // 选择表
        const table = datasourceStore.getTableByName(tableName)
        if (!table) {
          throw new Error(`表 ${tableName} 不存在`)
        }

        this.selectedTable = table

        // 生成默认映射
        await this.generateDefaultMapping()
      } catch (error: unknown) {
        const apiError = error as ApiError
        this.error = { message: apiError.message || '选择表失败' }
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 生成默认字段映射
     */
    async generateDefaultMapping(): Promise<TableMapping> {
      if (!this.selectedTable) {
        throw new Error('请先选择表')
      }

      this.isLoading = true
      this.error = null

      try {
        const metadataStore = useMetadataStore()
        const datasourceStore = useDatasourceStore()

        // TODO: 实际API调用
        // const response = await generatorApi.table.generateMapping(this.selectedTable.name)
        // this.tableMapping = response.data

        // 确保selectedTable包含columns
        if (!this.selectedTable.columns) {
          this.selectedTable.columns = []
        }

        // 模拟数据
        const primaryKey =
          this.selectedTable.columns.find((column) => column.isPrimaryKey)?.name || 'id'

        const columnMappings: ColumnMapping[] = this.selectedTable.columns.map((column) => {
          // 获取推荐的组件类型
          const recommendedComponent =
            (metadataStore.recommendComponent(column.dataType) as any)?.componentType || 'Input'

          // 根据字段特性决定是否在列表和表单中显示
          const isSystem = ['created_at', 'updated_at', 'deleted_at'].includes(column.name)
          const isPrimary = column.isPrimaryKey

          // 确保列表长度是数字，避免undefined
          const columnsLength = this.selectedTable?.columns?.length || 0

          return {
            column: column.name,
            label: column.comment || this.formatColumnLabel(column.name),
            component: recommendedComponent,
            componentProps: this.getDefaultComponentProps(column),
            validation: this.getDefaultValidationRules(column),
            listDisplay: !isPrimary || (isPrimary && columnsLength <= 5),
            formDisplay: !isPrimary && !isSystem,
            searchable: this.isColumnSearchable(column),
            sortable: this.isColumnSortable(column),
            filterable: this.isColumnFilterable(column),
            defaultValue: column.defaultValue || this.getDefaultValue(column)
          }
        })

        // 默认搜索字段
        const searchFields = columnMappings
          .filter((mapping) => mapping.searchable)
          .slice(0, 3)
          .map((mapping) => mapping.column)

        // 默认排序字段
        const sortField = this.selectedTable.columns.find((col) => col.name === 'created_at')
          ? 'created_at'
          : primaryKey

        this.tableMapping = {
          tableId: 0, // 临时ID
          tableName: this.selectedTable.name,
          displayName: this.formatTableName(this.selectedTable.name),
          description: this.selectedTable.comment || '',
          primaryKey,
          pagination: true,
          searchFields,
          sortField,
          sortOrder: 'desc',
          columns: columnMappings
        }

        // 添加到历史记录
        this.addToHistory(this.tableMapping)

        return this.tableMapping
      } catch (error: unknown) {
        const apiError = error as ApiError
        this.error = { message: apiError.message || '生成字段映射失败' }
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 更新表映射
     * @param mapping 表映射数据
     */
    updateTableMapping(mapping: Partial<TableMapping>): void {
      if (!this.tableMapping) {
        throw new Error('表映射不存在')
      }

      this.tableMapping = {
        ...this.tableMapping,
        ...mapping
      }

      // 添加到历史记录
      this.addToHistory(this.tableMapping)
    },

    /**
     * 更新字段映射
     * @param columnName 字段名
     * @param mapping 字段映射数据
     */
    updateColumnMapping(columnName: string, mapping: Partial<ColumnMapping>): void {
      if (!this.tableMapping) {
        throw new Error('表映射不存在')
      }

      const columnIndex = this.tableMapping.columns.findIndex((col) => col.column === columnName)
      if (columnIndex === -1) {
        throw new Error(`字段 ${columnName} 不存在`)
      }

      // 更新字段映射
      this.tableMapping.columns[columnIndex] = {
        ...this.tableMapping.columns[columnIndex],
        ...mapping
      }

      // 添加到历史记录
      this.addToHistory(this.tableMapping)
    },

    /**
     * 保存表映射
     */
    async saveTableMapping(): Promise<TableMapping> {
      if (!this.tableMapping) {
        throw new Error('表映射不存在')
      }

      this.isLoading = true
      this.error = null

      try {
        // TODO: 实际API调用
        // const response = await generatorApi.table.saveMapping(this.tableMapping)
        // const savedMapping = response.data

        // 模拟数据
        const savedMapping = {
          ...this.tableMapping,
          tableId: this.tableMapping.tableId || Math.floor(Math.random() * 1000) + 1
        }

        this.tableMapping = savedMapping
        return savedMapping
      } catch (error: unknown) {
        const apiError = error as ApiError
        this.error = { message: apiError.message || '保存表映射失败' }
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 加载表映射
     * @param tableId 表映射ID
     */
    async loadTableMapping(tableId: number): Promise<TableMapping> {
      this.isLoading = true
      this.error = null

      try {
        // TODO: 实际API调用
        // const response = await generatorApi.table.getMapping(tableId)
        // const mapping = response.data

        // 模拟数据
        if (!this.selectedTable) {
          throw new Error('请先选择表')
        }

        // 使用当前的默认映射作为模拟数据
        const mapping = this.tableMapping
          ? {
              ...this.tableMapping,
              tableId
            }
          : null

        if (!mapping) {
          throw new Error(`表映射 ID ${tableId} 不存在`)
        }

        this.tableMapping = mapping as TableMapping
        return mapping as TableMapping
      } catch (error: unknown) {
        const apiError = error as ApiError
        this.error = { message: apiError.message || '加载表映射失败' }
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 添加到历史记录
     * @param mapping 表映射数据
     */
    addToHistory(mapping: TableMapping): void {
      // 限制历史记录数量
      if (this.mappingHistory.length >= 10) {
        this.mappingHistory.shift()
      }

      // 添加当前映射的深拷贝到历史记录
      this.mappingHistory.push(JSON.parse(JSON.stringify(mapping)))
    },

    /**
     * 撤销最后一次更改
     */
    undo(): void {
      if (this.mappingHistory.length <= 1) {
        return
      }

      // 移除当前状态
      this.mappingHistory.pop()

      // 应用上一次状态
      const previousMapping = this.mappingHistory[this.mappingHistory.length - 1]
      if (previousMapping) {
        this.tableMapping = JSON.parse(JSON.stringify(previousMapping))
      }
    },

    /**
     * 清空表选择
     */
    clearSelection(): void {
      this.selectedTable = null
      this.tableMapping = null
      this.mappingHistory = []
    },

    /**
     * 清空错误信息
     */
    clearError(): void {
      this.error = null
    },

    /**
     * 格式化表名为显示名称
     * @param tableName 表名
     */
    formatTableName(tableName: string): string {
      // 移除前缀（如 sys_、tbl_ 等）
      let name = tableName.replace(/^(sys_|tbl_|t_)/, '')

      // 将下划线转换为空格并首字母大写
      name = name
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

      return name
    },

    /**
     * 格式化字段名为显示标签
     * @param columnName 字段名
     */
    formatColumnLabel(columnName: string): string {
      // 移除前缀和后缀（如 _id、_at 等）
      let label = columnName.replace(/_id$/, '').replace(/_at$/, '')

      // 将下划线转换为空格并首字母大写
      label = label
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

      return label
    },

    /**
     * 获取默认组件属性
     * @param column 数据库字段
     */
    getDefaultComponentProps(column: DatabaseColumn): Record<string, any> {
      const props: Record<string, any> = {
        placeholder: `请输入${column.comment || this.formatColumnLabel(column.name)}`
      }

      // 根据字段类型设置特定属性
      const type = column.dataType?.toLowerCase() || ''
      switch (type) {
        case 'varchar':
        case 'char':
        case 'text':
          if (column.length) {
            props.maxlength = column.length
          }
          break
        case 'int':
        case 'bigint':
        case 'float':
        case 'double':
        case 'decimal':
          props.type = 'number'
          break
        case 'datetime':
        case 'timestamp':
          props.type = 'datetime'
          props.format = 'YYYY-MM-DD HH:mm:ss'
          props.placeholder = `请选择${column.comment || this.formatColumnLabel(column.name)}`
          break
        case 'date':
          props.type = 'date'
          props.format = 'YYYY-MM-DD'
          props.placeholder = `请选择${column.comment || this.formatColumnLabel(column.name)}`
          break
        case 'tinyint':
        case 'boolean':
          if (
            column.name.includes('status') ||
            column.name.includes('enabled') ||
            column.name.includes('active')
          ) {
            props.options = [
              { label: '启用', value: 1 },
              { label: '禁用', value: 0 }
            ]
          } else {
            props.options = [
              { label: '是', value: 1 },
              { label: '否', value: 0 }
            ]
          }
          break
      }

      return props
    },

    /**
     * 获取默认验证规则
     * @param column 数据库字段
     */
    getDefaultValidationRules(column: DatabaseColumn): Record<string, any> {
      const rules: Record<string, any> = {}

      // 必填字段
      if (
        !column.nullable &&
        !column.isAutoIncrement &&
        column.name !== 'created_at' &&
        column.name !== 'updated_at'
      ) {
        rules.required = true
      }

      // 根据字段类型设置验证规则
      const type = column.dataType?.toLowerCase() || ''
      switch (type) {
        case 'varchar':
        case 'char':
          if (column.length) {
            rules.max = column.length
          }

          // 特定字段的特定验证
          if (column.name.includes('email')) {
            rules.type = 'email'
            rules.message = '请输入正确的邮箱地址'
          } else if (column.name.includes('phone')) {
            rules.pattern = /^1[3-9]\d{9}$/
            rules.message = '请输入正确的手机号码'
          } else if (column.name.includes('url')) {
            rules.type = 'url'
            rules.message = '请输入正确的URL地址'
          }
          break
        case 'int':
        case 'bigint':
          rules.type = 'integer'
          break
        case 'float':
        case 'double':
        case 'decimal':
          rules.type = 'number'
          break
      }

      return rules
    },

    /**
     * 获取默认值
     * @param column 数据库字段
     */
    getDefaultValue(column: DatabaseColumn): any {
      // 如果有默认值，直接返回
      if (column.defaultValue !== undefined && column.defaultValue !== null) {
        return column.defaultValue
      }

      // 根据字段类型设置默认值
      const type = column.dataType?.toLowerCase() || ''
      switch (type) {
        case 'int':
        case 'bigint':
        case 'float':
        case 'double':
        case 'decimal':
          return 0
        case 'varchar':
        case 'char':
        case 'text':
          return ''
        case 'datetime':
        case 'timestamp':
        case 'date':
          return null
        case 'tinyint':
        case 'boolean':
          return column.name.includes('status') ||
            column.name.includes('enabled') ||
            column.name.includes('active')
            ? 1
            : 0
        default:
          return null
      }
    },

    /**
     * 判断字段是否可搜索
     * @param column 数据库字段
     */
    isColumnSearchable(column: DatabaseColumn): boolean {
      const searchableTypes = ['varchar', 'char', 'text', 'int', 'bigint']
      const searchableNames = ['name', 'title', 'code', 'description', 'id']

      // 主键通常不作为搜索条件
      if (column.isPrimaryKey) return false

      // 系统字段通常不作为搜索条件
      if (['created_at', 'updated_at', 'deleted_at'].includes(column.name)) return false

      // 根据字段类型判断
      const type = column.dataType?.toLowerCase() || ''
      if (searchableTypes.some((t) => type.includes(t))) {
        // 根据字段名判断
        if (searchableNames.some((name) => column.name.includes(name))) {
          return true
        }

        // 名称/标题/描述等字段
        if (
          column.comment &&
          ['名称', '标题', '编码', '描述'].some((keyword) => column.comment.includes(keyword))
        ) {
          return true
        }
      }

      return false
    },

    /**
     * 判断字段是否可排序
     * @param column 数据库字段
     */
    isColumnSortable(column: DatabaseColumn): boolean {
      // 主键、时间戳、数字类型的字段通常可排序
      if (column.isPrimaryKey) return true

      if (['created_at', 'updated_at', 'sort', 'order'].includes(column.name)) return true

      const sortableTypes = [
        'int',
        'bigint',
        'float',
        'double',
        'decimal',
        'datetime',
        'timestamp',
        'date'
      ]

      const type = column.dataType?.toLowerCase() || ''
      return sortableTypes.some((t) => type.includes(t))
    },

    /**
     * 判断字段是否可筛选
     * @param column 数据库字段
     */
    isColumnFilterable(column: DatabaseColumn): boolean {
      // 枚举、布尔、状态等字段通常可筛选
      if (
        column.name.includes('status') ||
        column.name.includes('type') ||
        column.name.includes('enabled') ||
        column.name.includes('active') ||
        column.name.includes('state')
      ) {
        return true
      }

      // 时间范围可筛选
      const type = column.dataType?.toLowerCase() || ''
      if (['date', 'datetime', 'timestamp'].some((t) => type.includes(t))) {
        return true
      }

      // 外键通常可筛选
      if (column.name.endsWith('_id')) {
        return true
      }

      return false
    }
  }
})

export default useTableStore
