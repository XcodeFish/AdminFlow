import { defineStore } from 'pinia'
import type { DatasourceCreateDto, DatasourceUpdateDto, DatasourceTestDto } from '@/types/generator'
import generatorApi from '@/api/modules/generator'
import { ApiError } from '@/types/error'

export interface Datasource {
  id: number
  name: string
  description: string
  type: 'mysql' | 'postgresql' | 'oracle' | 'sqlserver' | string
  host: string
  port: number
  username: string
  password?: string
  database: string
  schema?: string
  ssl: boolean
  status: 'active' | 'inactive' | 'error'
  createdAt: string
  updatedAt: string
}

export interface DatabaseTable {
  id: number
  name: string
  comment: string
  schema?: string
  connectionId: number
  columns?: DatabaseColumn[]
}

export interface DatabaseColumn {
  id: number
  name: string
  comment: string
  dataType: string
  length?: number
  precision?: number
  scale?: number
  nullable: boolean
  isPrimaryKey: boolean
  isAutoIncrement: boolean
  defaultValue?: string
  tableId: number
  type?: string
  primaryKey?: boolean
  autoIncrement?: boolean
}

export interface DatabaseConnection {
  id: number
  name: string
  type: 'mysql' | 'postgresql' | 'oracle' | 'sqlserver' | 'sqlite'
  host?: string
  port?: number
  username?: string
  password?: string
  database: string
  schema?: string
  connectionString?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface DatasourceState {
  datasources: Datasource[]
  currentDatasource: Datasource | null
  tables: DatabaseTable[]
  supportedDatabases: Array<{
    type: string
    name: string
    defaultPort: number
    icon: string
  }>
  isLoading: boolean
  isConnecting: boolean
  isTesting: boolean
  error: ApiError | null
  connections: DatabaseConnection[]
  columns: Record<number, DatabaseColumn[]> // tableId -> columns[]
  currentConnectionId: number | null
  currentTableId: number | null
}

/**
 * 数据源管理Store
 */
export const useDatasourceStore = defineStore('datasource', {
  state: (): DatasourceState => ({
    datasources: [],
    currentDatasource: null,
    tables: [],
    supportedDatabases: [
      {
        type: 'mysql',
        name: 'MySQL',
        defaultPort: 3306,
        icon: 'mysql'
      },
      {
        type: 'postgresql',
        name: 'PostgreSQL',
        defaultPort: 5432,
        icon: 'postgresql'
      },
      {
        type: 'oracle',
        name: 'Oracle',
        defaultPort: 1521,
        icon: 'oracle'
      },
      {
        type: 'sqlserver',
        name: 'SQL Server',
        defaultPort: 1433,
        icon: 'sqlserver'
      }
    ],
    isLoading: false,
    isConnecting: false,
    isTesting: false,
    error: null,
    connections: [],
    columns: {},
    currentConnectionId: null,
    currentTableId: null
  }),

  getters: {
    /**
     * 获取数据源列表
     */
    getDatasources: (state): Datasource[] => {
      return state.datasources
    },

    /**
     * 获取当前数据源
     */
    getCurrentDatasource: (state): Datasource | null => {
      return state.currentDatasource
    },

    /**
     * 获取当前数据源的表列表
     */
    getTables: (state): DatabaseTable[] => {
      return state.tables
    },

    /**
     * 根据表名获取表信息
     */
    getTableByName:
      (state) =>
      (name: string): DatabaseTable | undefined => {
        return state.tables.find((table) => table.name === name)
      },

    /**
     * 获取支持的数据库类型
     */
    getSupportedDatabases: (state) => {
      return state.supportedDatabases
    },

    /**
     * 根据数据库类型获取默认端口
     */
    getDefaultPortByType:
      (state) =>
      (type: string): number => {
        const db = state.supportedDatabases.find((db) => db.type === type)
        return db ? db.defaultPort : 3306 // 默认返回MySQL端口
      },

    /**
     * 获取当前连接
     */
    currentConnection(state): DatabaseConnection | null {
      if (!state.currentConnectionId) return null
      return state.connections.find((c) => c.id === state.currentConnectionId) || null
    },

    /**
     * 获取当前表
     */
    currentTable(state): DatabaseTable | null {
      if (!state.currentTableId) return null
      return state.tables.find((t) => t.id === state.currentTableId) || null
    },

    /**
     * 获取当前表的字段
     */
    currentColumns(state): DatabaseColumn[] {
      if (!state.currentTableId) return []
      return state.columns[state.currentTableId] || []
    },

    /**
     * 获取连接的表
     */
    getTablesByConnection:
      (state) =>
      (connectionId: number): DatabaseTable[] => {
        return state.tables.filter((t) => t.connectionId === connectionId)
      },

    /**
     * 获取表的字段
     */
    getColumnsByTable:
      (state) =>
      (tableId: number): DatabaseColumn[] => {
        return state.columns[tableId] || []
      }
  },

  actions: {
    /**
     * 获取数据源列表
     */
    async fetchDatasources(): Promise<Datasource[]> {
      this.isLoading = true
      this.error = null

      try {
        // TODO: 实际API调用
        // const response = await generatorApi.datasource.getList()
        // this.datasources = response.data

        // 模拟数据
        this.datasources = [
          {
            id: 1,
            name: '本地开发数据库',
            description: '开发环境MySQL',
            type: 'mysql',
            host: 'localhost',
            port: 3306,
            username: 'root',
            database: 'adminflow_dev',
            ssl: false,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 2,
            name: '测试环境数据库',
            description: '测试环境PostgreSQL',
            type: 'postgresql',
            host: 'test-db.example.com',
            port: 5432,
            username: 'test_user',
            database: 'adminflow_test',
            schema: 'public',
            ssl: true,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]

        return this.datasources
      } catch (error: unknown) {
        const apiError = error as ApiError
        this.error = { message: apiError.message || '获取数据源列表失败' }
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 获取数据源详情
     * @param id 数据源ID
     */
    async fetchDatasourceById(id: number): Promise<Datasource> {
      this.isLoading = true
      this.error = null

      try {
        // TODO: 实际API调用
        // const response = await generatorApi.datasource.getById(id)
        // const datasource = response.data

        // 模拟数据
        const datasource = this.datasources.find((d) => d.id === id)
        if (!datasource) {
          throw new Error('数据源不存在')
        }

        this.currentDatasource = datasource
        return datasource
      } catch (error: unknown) {
        const apiError = error as ApiError
        this.error = { message: apiError.message || '获取数据源详情失败' }
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 创建数据源
     * @param data 数据源数据
     */
    async createDatasource(data: DatasourceCreateDto): Promise<Datasource> {
      this.isLoading = true
      this.error = null

      try {
        // TODO: 实际API调用
        // const response = await generatorApi.datasource.create(data)
        // const newDatasource = response.data

        // 模拟数据
        const newDatasource = {
          id: Math.max(0, ...this.datasources.map((d) => d.id)) + 1,
          ...data,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as Datasource

        this.datasources.push(newDatasource)
        this.currentDatasource = newDatasource
        return newDatasource
      } catch (error: unknown) {
        const apiError = error as ApiError
        this.error = { message: apiError.message || '创建数据源失败' }
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 更新数据源
     * @param id 数据源ID
     * @param data 更新数据
     */
    async updateDatasource(id: number, data: DatasourceUpdateDto): Promise<Datasource> {
      this.isLoading = true
      this.error = null

      try {
        // TODO: 实际API调用
        // const response = await generatorApi.datasource.update(id, data)
        // const updatedDatasource = response.data

        // 模拟数据
        const index = this.datasources.findIndex((d) => d.id === id)
        if (index === -1) {
          throw new Error('数据源不存在')
        }

        const updatedDatasource = {
          ...this.datasources[index],
          ...data,
          updatedAt: new Date().toISOString()
        }

        this.datasources[index] = updatedDatasource
        if (this.currentDatasource && this.currentDatasource.id === id) {
          this.currentDatasource = updatedDatasource
        }

        return updatedDatasource
      } catch (error: unknown) {
        const apiError = error as ApiError
        this.error = { message: apiError.message || '更新数据源失败' }
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 删除数据源
     * @param id 数据源ID
     */
    async deleteDatasource(id: number): Promise<void> {
      this.isLoading = true
      this.error = null

      try {
        // TODO: 实际API调用
        // await generatorApi.datasource.delete(id)

        // 模拟数据
        const index = this.datasources.findIndex((d) => d.id === id)
        if (index !== -1) {
          this.datasources.splice(index, 1)
        }

        if (this.currentDatasource && this.currentDatasource.id === id) {
          this.currentDatasource = null
        }
      } catch (error: unknown) {
        const apiError = error as ApiError
        this.error = { message: apiError.message || '删除数据源失败' }
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 测试数据源连接
     * @param data 数据源数据
     */
    async testDatasourceConnection(data: DatasourceTestDto): Promise<boolean> {
      this.isTesting = true
      this.error = null

      try {
        // TODO: 实际API调用
        // const response = await generatorApi.datasource.testConnection(data)
        // return response.data.success

        // 模拟数据
        await new Promise((resolve) => setTimeout(resolve, 1000))
        return true
      } catch (error: unknown) {
        const apiError = error as ApiError
        this.error = { message: apiError.message || '测试连接失败' }
        throw error
      } finally {
        this.isTesting = false
      }
    },

    /**
     * 获取数据库表列表
     * @param datasourceId 数据源ID
     */
    async fetchTables(datasourceId: number): Promise<DatabaseTable[]> {
      this.isConnecting = true
      this.error = null

      try {
        // TODO: 实际API调用
        // const response = await generatorApi.datasource.getTables(datasourceId)
        // this.tables = response.data

        // 模拟数据
        await new Promise((resolve) => setTimeout(resolve, 1000))

        this.tables = [
          {
            id: 101,
            name: 'sys_users',
            comment: '系统用户表',
            schema: 'public',
            connectionId: datasourceId,
            columns: [
              {
                id: 1001,
                name: 'id',
                comment: '用户ID',
                dataType: 'int',
                type: 'int',
                nullable: false,
                isPrimaryKey: true,
                primaryKey: true,
                isAutoIncrement: true,
                autoIncrement: true,
                tableId: 101
              },
              {
                id: 1002,
                name: 'username',
                comment: '用户名',
                dataType: 'varchar',
                type: 'varchar',
                length: 50,
                nullable: false,
                isPrimaryKey: false,
                primaryKey: false,
                isAutoIncrement: false,
                autoIncrement: false,
                tableId: 101
              }
            ]
          },
          {
            id: 102,
            name: 'sys_roles',
            comment: '系统角色表',
            connectionId: datasourceId,
            columns: [
              {
                id: 2001,
                name: 'id',
                comment: '角色ID',
                dataType: 'int',
                type: 'int',
                nullable: false,
                isPrimaryKey: true,
                primaryKey: true,
                isAutoIncrement: true,
                autoIncrement: true,
                tableId: 102
              }
            ]
          },
          {
            id: 103,
            name: 'sys_user_roles',
            comment: '用户角色关联表',
            connectionId: datasourceId,
            columns: []
          },
          {
            id: 104,
            name: 'sys_permissions',
            comment: '系统权限表',
            connectionId: datasourceId,
            columns: []
          }
        ]

        return this.tables
      } catch (error: unknown) {
        const apiError = error as ApiError
        this.error = { message: apiError.message || '获取数据库表失败' }
        throw error
      } finally {
        this.isConnecting = false
      }
    },

    /**
     * 获取表结构详情
     * @param datasourceId 数据源ID
     * @param tableName 表名
     */
    async fetchTableStructure(datasourceId: number, tableName: string): Promise<DatabaseTable> {
      this.isLoading = true
      this.error = null

      try {
        // TODO: 实际API调用
        // const response = await generatorApi.datasource.getTableStructure(datasourceId, tableName)
        // const tableStructure = response.data

        // 模拟数据 - 从已有表中获取
        const tableStructure = this.tables.find((t) => t.name === tableName)
        if (!tableStructure) {
          throw new Error('表不存在')
        }

        return tableStructure
      } catch (error: unknown) {
        const apiError = error as ApiError
        this.error = { message: apiError.message || '获取表结构失败' }
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 设置当前数据源
     * @param datasource 数据源对象
     */
    setCurrentDatasource(datasource: Datasource | null): void {
      this.currentDatasource = datasource
      if (!datasource) {
        this.tables = []
      }
    },

    /**
     * 清空错误信息
     */
    clearError(): void {
      this.error = null
    },

    /**
     * 设置当前连接
     * @param connectionId 连接ID
     */
    setCurrentConnection(connectionId: number | null) {
      this.currentConnectionId = connectionId
      // 清空当前表选择
      this.currentTableId = null
    },

    /**
     * 设置当前表
     * @param tableId 表ID
     */
    setCurrentTable(tableId: number | null) {
      this.currentTableId = tableId
    },

    /**
     * 加载数据库连接列表
     */
    async loadConnections() {
      this.isLoading = true
      this.error = null

      try {
        // TODO: 替换为实际API调用
        // const response = await datasourceApi.connections.list()
        // this.connections = response.data

        // 模拟数据
        this.connections = [
          {
            id: 1,
            name: '本地MySQL',
            type: 'mysql',
            host: 'localhost',
            port: 3306,
            username: 'root',
            database: 'test_db',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 2,
            name: '开发PostgreSQL',
            type: 'postgresql',
            host: 'dev-db.example.com',
            port: 5432,
            username: 'dev_user',
            database: 'dev_db',
            schema: 'public',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]

        return this.connections
      } catch (error: unknown) {
        this.error = error as ApiError
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 创建数据库连接
     * @param connectionData 连接数据
     */
    async createConnection(
      connectionData: Omit<DatabaseConnection, 'id' | 'createdAt' | 'updatedAt'>
    ) {
      this.isLoading = true
      this.error = null

      try {
        // TODO: 替换为实际API调用
        // const response = await datasourceApi.connections.create(connectionData)
        // const newConnection = response.data

        // 模拟创建
        const newConnection: DatabaseConnection = {
          ...connectionData,
          id: Date.now(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        this.connections.push(newConnection)
        return newConnection
      } catch (error: unknown) {
        this.error = error as ApiError
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 更新数据库连接
     * @param connectionId 连接ID
     * @param connectionData 连接数据
     */
    async updateConnection(connectionId: number, connectionData: Partial<DatabaseConnection>) {
      this.isLoading = true
      this.error = null

      try {
        const connectionIndex = this.connections.findIndex((c) => c.id === connectionId)
        if (connectionIndex === -1) {
          throw new Error('连接不存在')
        }

        // TODO: 替换为实际API调用
        // const response = await datasourceApi.connections.update(connectionId, connectionData)
        // const updatedConnection = response.data

        // 模拟更新
        const updatedConnection = {
          ...this.connections[connectionIndex],
          ...connectionData,
          updatedAt: new Date().toISOString()
        }

        this.connections[connectionIndex] = updatedConnection
        return updatedConnection
      } catch (error: unknown) {
        this.error = error as ApiError
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 删除数据库连接
     * @param connectionId 连接ID
     */
    async deleteConnection(connectionId: number) {
      this.isLoading = true
      this.error = null

      try {
        // TODO: 替换为实际API调用
        // await datasourceApi.connections.delete(connectionId)

        // 模拟删除
        this.connections = this.connections.filter((c) => c.id !== connectionId)

        // 清除相关表
        this.tables = this.tables.filter((t) => t.connectionId !== connectionId)

        // 清除当前选择（如果需要）
        if (this.currentConnectionId === connectionId) {
          this.currentConnectionId = null
          this.currentTableId = null
        }

        return true
      } catch (error: unknown) {
        this.error = error as ApiError
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 测试数据库连接
     * @param connectionData 连接数据
     */
    async testConnectionSettings(connectionData: Partial<DatabaseConnection>): Promise<boolean> {
      this.isLoading = true
      this.error = null

      try {
        // TODO: 替换为实际API调用
        // const response = await datasourceApi.connections.test(connectionData)
        // return response.data.success

        // 模拟测试结果
        return true
      } catch (error: unknown) {
        this.error = error as ApiError
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 加载连接的表列表
     * @param connectionId 连接ID
     */
    async loadTables(connectionId: number) {
      this.isLoading = true
      this.error = null

      try {
        // TODO: 替换为实际API调用
        // const response = await datasourceApi.tables.list(connectionId)
        // this.tables = response.data

        // 模拟数据
        if (connectionId === 1) {
          this.tables = [
            { id: 101, name: 'users', comment: '用户表', connectionId: 1, columns: [] },
            { id: 102, name: 'roles', comment: '角色表', connectionId: 1, columns: [] },
            { id: 103, name: 'permissions', comment: '权限表', connectionId: 1, columns: [] }
          ]
        } else if (connectionId === 2) {
          this.tables = [
            {
              id: 201,
              name: 'products',
              comment: '产品表',
              schema: 'public',
              connectionId: 2,
              columns: []
            },
            {
              id: 202,
              name: 'categories',
              comment: '分类表',
              schema: 'public',
              connectionId: 2,
              columns: []
            },
            {
              id: 203,
              name: 'orders',
              comment: '订单表',
              schema: 'public',
              connectionId: 2,
              columns: []
            }
          ]
        } else {
          this.tables = []
        }

        return this.tables
      } catch (error: unknown) {
        this.error = error as ApiError
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 加载表的字段列表
     * @param tableId 表ID
     */
    async loadColumns(tableId: number) {
      this.isLoading = true
      this.error = null

      try {
        // TODO: 替换为实际API调用
        // const response = await datasourceApi.columns.list(tableId)
        // this.columns[tableId] = response.data

        // 模拟数据
        if (tableId === 101) {
          this.columns[tableId] = [
            {
              id: 1001,
              name: 'id',
              comment: '用户ID',
              dataType: 'int',
              type: 'int',
              nullable: false,
              isPrimaryKey: true,
              primaryKey: true,
              isAutoIncrement: true,
              autoIncrement: true,
              tableId
            },
            {
              id: 1002,
              name: 'username',
              comment: '用户名',
              dataType: 'varchar',
              type: 'varchar',
              length: 50,
              nullable: false,
              isPrimaryKey: false,
              primaryKey: false,
              isAutoIncrement: false,
              autoIncrement: false,
              tableId
            },
            {
              id: 1003,
              name: 'email',
              comment: '邮箱',
              dataType: 'varchar',
              type: 'varchar',
              length: 100,
              nullable: false,
              isPrimaryKey: false,
              primaryKey: false,
              isAutoIncrement: false,
              autoIncrement: false,
              tableId
            },
            {
              id: 1004,
              name: 'created_at',
              comment: '创建时间',
              dataType: 'datetime',
              type: 'datetime',
              nullable: false,
              isPrimaryKey: false,
              primaryKey: false,
              isAutoIncrement: false,
              autoIncrement: false,
              tableId
            }
          ]
        } else if (tableId === 201) {
          this.columns[tableId] = [
            {
              id: 2001,
              name: 'id',
              comment: '产品ID',
              dataType: 'serial',
              type: 'serial',
              nullable: false,
              isPrimaryKey: true,
              primaryKey: true,
              isAutoIncrement: true,
              autoIncrement: true,
              tableId
            },
            {
              id: 2002,
              name: 'name',
              comment: '产品名称',
              dataType: 'varchar',
              type: 'varchar',
              length: 100,
              nullable: false,
              isPrimaryKey: false,
              primaryKey: false,
              isAutoIncrement: false,
              autoIncrement: false,
              tableId
            },
            {
              id: 2003,
              name: 'price',
              comment: '价格',
              dataType: 'decimal',
              type: 'decimal',
              precision: 10,
              scale: 2,
              nullable: false,
              isPrimaryKey: false,
              primaryKey: false,
              isAutoIncrement: false,
              autoIncrement: false,
              tableId
            },
            {
              id: 2004,
              name: 'category_id',
              comment: '分类ID',
              dataType: 'int',
              type: 'int',
              nullable: false,
              isPrimaryKey: false,
              primaryKey: false,
              isAutoIncrement: false,
              autoIncrement: false,
              tableId
            }
          ]
        } else {
          this.columns[tableId] = []
        }

        return this.columns[tableId]
      } catch (error: unknown) {
        this.error = error as ApiError
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 重新加载所有数据
     */
    async refresh() {
      if (this.currentConnectionId) {
        await this.loadTables(this.currentConnectionId)

        if (this.currentTableId) {
          await this.loadColumns(this.currentTableId)
        }
      } else {
        await this.loadConnections()
      }
    },

    /**
     * 重置状态
     */
    resetState() {
      this.connections = []
      this.tables = []
      this.columns = {}
      this.currentConnectionId = null
      this.currentTableId = null
      this.isLoading = false
      this.error = null
    }
  },

  persist: {
    key: 'datasource-state',
    storage: localStorage,
    pick: ['currentConnectionId', 'currentTableId']
  }
})

export default useDatasourceStore
