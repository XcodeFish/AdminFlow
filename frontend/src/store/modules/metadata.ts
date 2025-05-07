import { defineStore } from 'pinia'
import type {
  TableMetadata,
  ColumnTypeMapping,
  ComponentMapping,
  ValidationRuleMapping,
  ColumnMapping
} from '@/types/generator'
import generatorApi from '@/api/modules/generator'
import { ApiError } from '@/types/error'

export interface MetadataState {
  tableMetadata: Record<string, TableMetadata>
  columnTypes: ColumnTypeMapping[]
  componentMappings: ComponentMapping[]
  validationRules: ValidationRuleMapping[]
  isLoading: boolean
  error: ApiError | null
}

/**
 * 元数据管理Store
 */
export const useMetadataStore = defineStore('metadata', {
  state: (): MetadataState => ({
    tableMetadata: {},
    columnTypes: [
      {
        dbType: 'varchar',
        jsType: 'string',
        tsType: 'string',
        defaultComponent: 'Input',
        defaultValidations: [
          {
            type: 'maxLength',
            message: '长度不能超过{max}个字符',
            max: 255
          }
        ]
      },
      {
        dbType: 'int',
        jsType: 'number',
        tsType: 'number',
        defaultComponent: 'InputNumber',
        defaultValidations: [
          {
            type: 'number',
            message: '请输入数字'
          }
        ]
      },
      {
        dbType: 'datetime',
        jsType: 'string',
        tsType: 'Date',
        defaultComponent: 'DatePicker',
        defaultValidations: []
      },
      {
        dbType: 'text',
        jsType: 'string',
        tsType: 'string',
        defaultComponent: 'Textarea',
        defaultValidations: []
      },
      {
        dbType: 'boolean',
        jsType: 'boolean',
        tsType: 'boolean',
        defaultComponent: 'Switch',
        defaultValidations: []
      }
    ],
    componentMappings: [
      {
        componentType: 'Input',
        component: 'el-input',
        defaultProps: {},
        supportedTypes: ['varchar', 'char', 'text']
      },
      {
        componentType: 'InputNumber',
        component: 'el-input-number',
        defaultProps: {
          min: 0
        },
        supportedTypes: ['int', 'bigint', 'float', 'double', 'decimal']
      },
      {
        componentType: 'Select',
        component: 'el-select',
        defaultProps: {},
        supportedTypes: ['varchar', 'char', 'int']
      },
      {
        componentType: 'DatePicker',
        component: 'el-date-picker',
        defaultProps: {
          type: 'datetime'
        },
        supportedTypes: ['datetime', 'timestamp', 'date']
      },
      {
        componentType: 'Switch',
        component: 'el-switch',
        defaultProps: {},
        supportedTypes: ['boolean', 'tinyint']
      }
    ],
    validationRules: [
      {
        ruleType: 'required',
        dbTypes: ['*'],
        defaultMessage: '此字段为必填项',
        defaultParams: {
          required: true,
          trigger: 'blur'
        }
      },
      {
        ruleType: 'maxLength',
        dbTypes: ['varchar', 'char', 'text'],
        defaultMessage: '长度不能超过{max}个字符',
        defaultParams: {
          trigger: 'blur'
        }
      },
      {
        ruleType: 'number',
        dbTypes: ['int', 'bigint', 'float', 'double', 'decimal'],
        defaultMessage: '请输入数字',
        defaultParams: {
          trigger: 'blur'
        }
      }
    ],
    isLoading: false,
    error: null
  }),

  getters: {
    /**
     * 获取表元数据
     * @param state 状态
     */
    getTableMetadata:
      (state) =>
      (tableId: string): TableMetadata | null => {
        return state.tableMetadata[tableId] || null
      },

    /**
     * 获取字段类型映射
     * @param state 状态
     */
    getColumnTypeMapping:
      (state) =>
      (dbType: string): ColumnTypeMapping | null => {
        return state.columnTypes.find((item) => item.dbType === dbType) || null
      },

    /**
     * 获取组件映射
     * @param state 状态
     */
    getComponentMapping:
      (state) =>
      (componentType: string): ComponentMapping | null => {
        return state.componentMappings.find((item) => item.componentType === componentType) || null
      },

    /**
     * 根据数据库类型推荐组件
     * @param state 状态
     */
    recommendComponent:
      (state) =>
      (dbType: string): ComponentMapping | null => {
        // 先查找字段类型映射
        const typeMapping = state.columnTypes.find((item) => item.dbType === dbType)
        if (!typeMapping) return null

        // 再根据默认组件类型查找组件映射
        return (
          state.componentMappings.find(
            (item) => item.componentType === typeMapping.defaultComponent
          ) || null
        )
      }
  },

  actions: {
    /**
     * 获取表元数据
     * @param datasourceId 数据源ID
     * @param tableName 表名
     */
    async fetchTableMetadata(datasourceId: number, tableName: string): Promise<TableMetadata> {
      this.isLoading = true
      this.error = null

      try {
        // TODO: 实际集成API调用
        // const response = await generatorApi.table.getTableMetadata(datasourceId, tableName)

        // 模拟数据
        const metadata: TableMetadata = {
          id: `${datasourceId}-${tableName}`,
          name: tableName,
          comment: '示例表注释',
          columns: [
            {
              id: '1',
              name: 'id',
              dataType: 'int',
              columnType: 'int(11)',
              comment: '主键ID',
              isPrimary: true,
              isNullable: false,
              ordinalPosition: 1
            },
            {
              id: '2',
              name: 'name',
              dataType: 'varchar',
              columnType: 'varchar(50)',
              comment: '名称',
              isPrimary: false,
              isNullable: false,
              maxLength: 50,
              ordinalPosition: 2
            },
            {
              id: '3',
              name: 'description',
              dataType: 'text',
              columnType: 'text',
              comment: '描述',
              isPrimary: false,
              isNullable: true,
              ordinalPosition: 3
            },
            {
              id: '4',
              name: 'created_at',
              dataType: 'datetime',
              columnType: 'datetime',
              comment: '创建时间',
              isPrimary: false,
              isNullable: false,
              ordinalPosition: 4
            }
          ],
          primaryKey: 'id',
          datasourceId
        }

        this.tableMetadata[`${datasourceId}-${tableName}`] = metadata
        return metadata
      } catch (error: unknown) {
        const apiError = error as ApiError
        this.error = { message: apiError.message || '获取表元数据失败' }
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 更新字段映射
     * @param tableId 表ID
     * @param columnId 字段ID
     * @param mapping 映射信息
     */
    updateColumnMapping(tableId: string, columnId: string, mapping: Partial<ColumnMapping>): void {
      const table = this.tableMetadata[tableId]
      if (!table) return

      const column = table.columns.find((col) => col.id === columnId)
      if (!column) return

      column.mapping = {
        ...column.mapping,
        ...mapping
      } as ColumnMapping
    },

    /**
     * 清除表元数据
     * @param tableId 表ID
     */
    clearTableMetadata(tableId: string): void {
      if (this.tableMetadata[tableId]) {
        delete this.tableMetadata[tableId]
      }
    },

    /**
     * 刷新元数据
     */
    async refreshMetadata(): Promise<void> {
      this.isLoading = true
      this.error = null

      try {
        // 重新加载所有已缓存的表元数据
        for (const tableId in this.tableMetadata) {
          const [datasourceId, tableName] = tableId.split('-')
          await this.fetchTableMetadata(parseInt(datasourceId), tableName)
        }
      } catch (error: unknown) {
        const apiError = error as ApiError
        this.error = { message: apiError.message || '刷新元数据失败' }
        throw error
      } finally {
        this.isLoading = false
      }
    }
  }
})

export default useMetadataStore
