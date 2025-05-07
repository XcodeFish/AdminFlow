import { defineStore } from 'pinia'
import type { ConfigCreateDto, ConfigUpdateDto } from '@/types/generator'
import generatorApi from '@/api/modules/generator'
import { ApiError } from '@/types/error'

export interface Config {
  id: number
  moduleName: string
  description: string
  tableId: number
  datasourceId: number
  templateId: string
  fields: any
  pageConfig: any
  options: any
  createdAt: string
  updatedAt: string
}

export interface ConfigTemplate {
  id: string
  name: string
  description: string
  type: string
  icon: string
  preview?: string
}

export interface Template {
  id: number
  name: string
  description: string
  config: Record<string, any>
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface ConfigState {
  configs: Config[]
  currentConfig: Config | null
  configTemplates: ConfigTemplate[]
  templates: Template[]
  selectedTemplateId: number | null
  isLoading: boolean
  error: ApiError | null
}

/**
 * 配置管理Store
 */
export const useConfigStore = defineStore('config', {
  state: (): ConfigState => ({
    configs: [],
    currentConfig: null,
    configTemplates: [
      {
        id: 'standard',
        name: '标准CRUD',
        description: '标准的增删改查功能',
        type: 'crud',
        icon: 'table'
      },
      {
        id: 'tree',
        name: '树形结构',
        description: '适用于树形数据展示',
        type: 'tree',
        icon: 'tree'
      },
      {
        id: 'form',
        name: '表单页面',
        description: '仅包含表单功能',
        type: 'form',
        icon: 'form'
      },
      {
        id: 'detail',
        name: '详情页面',
        description: '用于数据展示',
        type: 'detail',
        icon: 'document'
      }
    ],
    templates: [],
    selectedTemplateId: null,
    isLoading: false,
    error: null
  }),

  getters: {
    /**
     * 获取配置列表
     */
    getConfigs: (state): Config[] => {
      return state.configs
    },

    /**
     * 获取当前配置
     */
    getCurrentConfig: (state): Config | null => {
      return state.currentConfig
    },

    /**
     * 获取配置模板列表
     */
    getTemplates: (state): ConfigTemplate[] => {
      return state.configTemplates
    },

    /**
     * 根据模板ID获取模板
     */
    getTemplateById:
      (state) =>
      (id: string): ConfigTemplate | undefined => {
        return state.configTemplates.find((template) => template.id === id)
      },

    /**
     * 获取当前选中的模板
     */
    getCurrentTemplate(state) {
      if (!state.selectedTemplateId) return null
      return state.templates.find((t) => t.id === state.selectedTemplateId) || null
    },

    /**
     * 获取默认模板
     */
    getDefaultTemplate(state) {
      return state.templates.find((t) => t.isDefault) || null
    }
  },

  actions: {
    /**
     * 获取配置列表
     */
    async fetchConfigs(): Promise<Config[]> {
      this.isLoading = true
      this.error = null

      try {
        // TODO: 实际API调用
        // const response = await generatorApi.config.getList()
        // this.configs = response.data

        // 模拟数据
        this.configs = [
          {
            id: 1,
            moduleName: '用户管理',
            description: '系统用户管理模块',
            tableId: 1,
            datasourceId: 1,
            templateId: 'standard',
            fields: {},
            pageConfig: {},
            options: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 2,
            moduleName: '部门管理',
            description: '组织部门管理',
            tableId: 2,
            datasourceId: 1,
            templateId: 'tree',
            fields: {},
            pageConfig: {},
            options: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]

        return this.configs
      } catch (error: unknown) {
        const apiError = error as ApiError
        this.error = { message: apiError.message || '获取配置列表失败' }
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 获取配置详情
     * @param id 配置ID
     */
    async fetchConfigById(id: number): Promise<Config> {
      this.isLoading = true
      this.error = null

      try {
        // TODO: 实际API调用
        // const response = await generatorApi.config.getById(id)
        // const config = response.data

        // 模拟数据
        let config = this.configs.find((c) => c.id === id)
        if (!config) {
          config = {
            id,
            moduleName: '示例模块',
            description: '示例描述',
            tableId: 1,
            datasourceId: 1,
            templateId: 'standard',
            fields: {},
            pageConfig: {},
            options: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }

        this.currentConfig = config
        return config
      } catch (error: unknown) {
        const apiError = error as ApiError
        this.error = { message: apiError.message || '获取配置详情失败' }
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 创建配置
     * @param data 配置数据
     */
    async createConfig(data: ConfigCreateDto): Promise<Config> {
      this.isLoading = true
      this.error = null

      try {
        // TODO: 实际API调用
        // const response = await generatorApi.config.create(data)
        // const newConfig = response.data

        // 模拟数据
        const newConfig = {
          id: Math.max(0, ...this.configs.map((c) => c.id)) + 1,
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as Config

        this.configs.push(newConfig)
        this.currentConfig = newConfig
        return newConfig
      } catch (error: unknown) {
        const apiError = error as ApiError
        this.error = { message: apiError.message || '创建配置失败' }
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 更新配置
     * @param id 配置ID
     * @param data 更新数据
     */
    async updateConfigData(id: number, data: ConfigUpdateDto): Promise<Config> {
      this.isLoading = true
      this.error = null

      try {
        // TODO: 实际API调用
        // const response = await generatorApi.config.update(id, data)
        // const updatedConfig = response.data

        // 模拟数据
        const index = this.configs.findIndex((c) => c.id === id)
        if (index === -1) {
          throw new Error('配置不存在')
        }

        const updatedConfig = {
          ...this.configs[index],
          ...data,
          updatedAt: new Date().toISOString()
        }

        this.configs[index] = updatedConfig
        if (this.currentConfig && this.currentConfig.id === id) {
          this.currentConfig = updatedConfig
        }

        return updatedConfig
      } catch (error: unknown) {
        const apiError = error as ApiError
        this.error = { message: apiError.message || '更新配置失败' }
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 删除配置
     * @param id 配置ID
     */
    async deleteConfig(id: number): Promise<void> {
      this.isLoading = true
      this.error = null

      try {
        // TODO: 实际API调用
        // await generatorApi.config.delete(id)

        // 模拟数据
        const index = this.configs.findIndex((c) => c.id === id)
        if (index !== -1) {
          this.configs.splice(index, 1)
        }

        if (this.currentConfig && this.currentConfig.id === id) {
          this.currentConfig = null
        }
      } catch (error: unknown) {
        const apiError = error as ApiError
        this.error = { message: apiError.message || '删除配置失败' }
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 复制配置
     * @param id 配置ID
     */
    async duplicateConfig(id: number): Promise<Config> {
      this.isLoading = true
      this.error = null

      try {
        // TODO: 实际API调用
        // const response = await generatorApi.config.duplicate(id)
        // const duplicatedConfig = response.data

        // 模拟数据
        const sourceConfig = this.configs.find((c) => c.id === id)
        if (!sourceConfig) {
          throw new Error('源配置不存在')
        }

        const duplicatedConfig = {
          ...sourceConfig,
          id: Math.max(0, ...this.configs.map((c) => c.id)) + 1,
          moduleName: `${sourceConfig.moduleName} (副本)`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        this.configs.push(duplicatedConfig)
        return duplicatedConfig
      } catch (error: unknown) {
        const apiError = error as ApiError
        this.error = { message: apiError.message || '复制配置失败' }
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 导出配置
     * @param id 配置ID
     */
    async downloadConfig(id: number): Promise<Blob> {
      this.isLoading = true
      this.error = null

      try {
        // TODO: 实际API调用
        // const response = await generatorApi.config.export(id)
        // return response

        // 模拟数据
        const config = this.configs.find((c) => c.id === id)
        if (!config) {
          throw new Error('配置不存在')
        }

        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
        return blob
      } catch (error: unknown) {
        const apiError = error as ApiError
        this.error = { message: apiError.message || '导出配置失败' }
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 导入配置
     * @param file 配置文件
     */
    async uploadConfig(file: File): Promise<Config> {
      this.isLoading = true
      this.error = null

      try {
        // TODO: 实际API调用
        // const formData = new FormData()
        // formData.append('file', file)
        // const response = await generatorApi.config.import(formData)
        // const importedConfig = response.data

        // 模拟数据
        const importedConfig = {
          id: Math.max(0, ...this.configs.map((c) => c.id)) + 1,
          moduleName: '导入的配置',
          description: '从文件导入的配置',
          tableId: 1,
          datasourceId: 1,
          templateId: 'standard',
          fields: {},
          pageConfig: {},
          options: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as Config

        this.configs.push(importedConfig)
        return importedConfig
      } catch (error: unknown) {
        const apiError = error as ApiError
        this.error = { message: apiError.message || '导入配置失败' }
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 设置当前配置
     * @param config 配置对象
     */
    setCurrentConfig(config: Config | null): void {
      this.currentConfig = config
    },

    /**
     * 清空错误信息
     */
    clearError(): void {
      this.error = null
    },

    /**
     * 加载配置模板列表
     */
    async loadTemplates() {
      this.isLoading = true
      this.error = null

      try {
        // TODO: 替换为实际API调用
        // const response = await configApi.templates.list()
        // this.templates = response.data
        this.templates = [
          {
            id: 1,
            name: '默认模板',
            description: '系统默认配置模板',
            config: { theme: 'light', language: 'typescript' },
            isDefault: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 2,
            name: '深色模板',
            description: '深色主题配置模板',
            config: { theme: 'dark', language: 'typescript' },
            isDefault: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]

        // 如果有默认模板且当前没有选择模板，则自动选中默认模板
        if (!this.selectedTemplateId) {
          const defaultTemplate = this.getDefaultTemplate
          if (defaultTemplate) {
            this.selectedTemplateId = defaultTemplate.id
          }
        }

        return this.templates
      } catch (error: unknown) {
        this.error = error as ApiError
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 选择模板
     * @param templateId 模板ID
     */
    selectTemplate(templateId: number) {
      const template = this.templates.find((t) => t.id === templateId)
      if (template) {
        this.selectedTemplateId = templateId
      }
    },

    /**
     * 更新当前配置
     * @param config 配置对象
     */
    updateCurrentConfig(config: Record<string, any>) {
      if (this.currentConfig) {
        this.currentConfig = {
          ...this.currentConfig,
          ...config
        }
      }
    },

    /**
     * 重置为模板配置
     */
    resetToTemplate() {
      if (this.selectedTemplateId) {
        const template = this.templates.find((t) => t.id === this.selectedTemplateId)
        if (template && this.currentConfig) {
          // 仅更新配置相关属性，保留ID等元数据
          const updatedConfig = {
            ...this.currentConfig
            // 这里可以添加具体需要从模板更新的属性
          }
          this.currentConfig = updatedConfig
        }
      }
    },

    /**
     * 创建新模板
     * @param name 模板名称
     * @param description 模板描述
     * @param isDefault 是否为默认模板
     */
    async createTemplate(name: string, description: string, isDefault: boolean = false) {
      this.isLoading = true
      this.error = null

      try {
        // 创建新模板对象
        const newTemplate: Template = {
          id: Date.now(), // 临时ID，实际应由后端生成
          name,
          description,
          config: this.currentConfig ? { ...this.currentConfig } : {},
          isDefault,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        // TODO: 替换为实际API调用
        // const response = await configApi.templates.create(newTemplate)
        // const createdTemplate = response.data

        // 更新本地模板列表
        const createdTemplate = newTemplate
        this.templates.push(createdTemplate)

        // 如果是默认模板，更新其他模板的默认状态
        if (isDefault) {
          this.templates.forEach((t) => {
            if (t.id !== createdTemplate.id) {
              t.isDefault = false
            }
          })
        }

        return createdTemplate
      } catch (error: unknown) {
        this.error = error as ApiError
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 更新模板
     * @param templateId 模板ID
     * @param updates 更新内容
     */
    async updateTemplate(templateId: number, updates: Partial<Template>) {
      this.isLoading = true
      this.error = null

      try {
        // 查找要更新的模板
        const templateIndex = this.templates.findIndex((t) => t.id === templateId)
        if (templateIndex === -1) {
          throw new Error('模板不存在')
        }

        // TODO: 替换为实际API调用
        // const response = await configApi.templates.update(templateId, updates)
        // const updatedTemplate = response.data

        // 更新本地模板
        const updatedTemplate = {
          ...this.templates[templateIndex],
          ...updates,
          updatedAt: new Date().toISOString()
        }

        this.templates[templateIndex] = updatedTemplate

        // 如果更新为默认模板，更新其他模板的默认状态
        if (updates.isDefault) {
          this.templates.forEach((t, index) => {
            if (index !== templateIndex) {
              t.isDefault = false
            }
          })
        }

        return updatedTemplate
      } catch (error: unknown) {
        this.error = error as ApiError
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 删除模板
     * @param templateId 模板ID
     */
    async deleteTemplate(templateId: number) {
      this.isLoading = true
      this.error = null

      try {
        // 检查是否为默认模板
        const template = this.templates.find((t) => t.id === templateId)
        if (template?.isDefault) {
          throw new Error('不能删除默认模板')
        }

        // TODO: 替换为实际API调用
        // await configApi.templates.delete(templateId)

        // 更新本地模板列表
        this.templates = this.templates.filter((t) => t.id !== templateId)

        // 如果删除的是当前选中的模板，重置选择
        if (this.selectedTemplateId === templateId) {
          const defaultTemplate = this.getDefaultTemplate
          if (defaultTemplate) {
            this.selectedTemplateId = defaultTemplate.id
          } else {
            this.selectedTemplateId = null
          }
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
     * 导出配置
     */
    exportConfigToFile(): boolean {
      try {
        if (!this.currentConfig) {
          throw new Error('没有当前配置')
        }

        // 创建导出对象
        const exportData = {
          config: this.currentConfig,
          exportedAt: new Date().toISOString()
        }

        // 转换为JSON字符串
        const jsonData = JSON.stringify(exportData, null, 2)

        // 创建Blob对象
        const blob = new Blob([jsonData], { type: 'application/json' })

        // 创建下载链接
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `code-generator-config-${Date.now()}.json`

        // 触发下载
        document.body.appendChild(link)
        link.click()

        // 清理
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        return true
      } catch (error: unknown) {
        this.error = error as ApiError
        throw error
      }
    },

    /**
     * 导入配置
     * @param configData 配置数据
     */
    importConfigFromData(configData: Record<string, any>): boolean {
      try {
        if (!configData || typeof configData !== 'object') {
          throw new Error('无效的配置数据')
        }

        // 确保当前配置存在，若不存在则创建一个
        if (!this.currentConfig) {
          this.currentConfig = {
            id: Date.now(),
            moduleName: configData.moduleName || '导入的配置',
            description: configData.description || '',
            tableId: configData.tableId || 0,
            datasourceId: configData.datasourceId || 0,
            templateId: configData.templateId || 'standard',
            fields: configData.fields || {},
            pageConfig: configData.pageConfig || {},
            options: configData.options || {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        } else {
          // 更新当前配置
          this.currentConfig = {
            ...this.currentConfig,
            ...configData,
            updatedAt: new Date().toISOString()
          }
        }

        return true
      } catch (error: unknown) {
        this.error = error as ApiError
        throw error
      }
    }
  },

  persist: {
    key: 'generator-config',
    storage: localStorage,
    pick: ['currentConfig', 'selectedTemplateId']
  }
})

export default useConfigStore
