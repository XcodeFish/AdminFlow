import { defineStore } from 'pinia'
import type { WizardStep, WizardData, ValidationError, GenerationResult } from '@/types/generator'
import generatorApi from '@/api/modules/generator'
import { ApiError } from '@/types/error'

export interface WizardState {
  steps: WizardStep[]
  currentStepIndex: number
  wizardData: WizardData
  validationErrors: ValidationError[]
  isCompleted: boolean
}

/**
 * 代码生成向导Store
 */
export const useWizardStore = defineStore('wizard', {
  state: (): WizardState => ({
    steps: [
      {
        id: 'basic-info',
        name: '基本信息',
        component: 'BasicInfo',
        description: '设置模块的基本信息',
        order: 1
      },
      {
        id: 'table-config',
        name: '表结构配置',
        component: 'TableConfig',
        description: '配置表结构与字段映射',
        order: 2
      },
      {
        id: 'page-config',
        name: '页面配置',
        component: 'PageConfig',
        description: '配置页面布局与显示',
        order: 3
      },
      {
        id: 'advanced-config',
        name: '高级配置',
        component: 'AdvancedConfig',
        description: '设置高级功能选项',
        order: 4
      },
      {
        id: 'preview-confirm',
        name: '预览确认',
        component: 'PreviewConfirm',
        description: '预览并确认生成配置',
        order: 5
      }
    ],
    currentStepIndex: 0,
    wizardData: {
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
        listStyle: 'table',
        formStyle: 'dialog',
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
    },
    validationErrors: [],
    isCompleted: false
  }),

  getters: {
    /**
     * 获取当前步骤
     */
    currentStep(state) {
      return state.steps[state.currentStepIndex]
    },

    /**
     * 是否是首个步骤
     */
    isFirstStep(state) {
      return state.currentStepIndex === 0
    },

    /**
     * 是否是最后步骤
     */
    isLastStep(state) {
      return state.currentStepIndex === state.steps.length - 1
    },

    /**
     * 向导进度百分比
     */
    progressPercentage(state) {
      return Math.floor(((state.currentStepIndex + 1) / state.steps.length) * 100)
    }
  },

  actions: {
    /**
     * 初始化向导
     * @param initialData 初始数据
     */
    initWizard(initialData?: Partial<WizardData>) {
      // 重置向导状态
      this.currentStepIndex = 0
      this.isCompleted = false
      this.validationErrors = []

      // 如果有初始数据，则合并
      if (initialData) {
        this.wizardData = {
          ...this.wizardData,
          ...initialData
        }
      }
    },

    /**
     * 前进到下一步
     * @returns 是否成功前进
     */
    goToNextStep() {
      // 先验证当前步骤
      const errors = this.validateCurrentStep()
      if (errors.length > 0) {
        return false
      }

      // 前进到下一步
      if (this.currentStepIndex < this.steps.length - 1) {
        this.currentStepIndex++
        return true
      }
      return false
    },

    /**
     * 返回上一步
     */
    goToPrevStep() {
      if (this.currentStepIndex > 0) {
        this.currentStepIndex--
      }
    },

    /**
     * 跳转到指定步骤
     * @param index 步骤索引
     */
    goToStep(index: number) {
      if (index >= 0 && index < this.steps.length) {
        this.currentStepIndex = index
      }
    },

    /**
     * 更新步骤数据
     * @param step 步骤ID
     * @param data 步骤数据
     */
    updateStepData(step: string, data: any) {
      const stepData: Record<string, keyof WizardData> = {
        'basic-info': 'basicInfo',
        'table-config': 'tableConfig',
        'page-config': 'pageConfig',
        'advanced-config': 'advancedConfig'
      }

      const key = stepData[step]
      if (key) {
        this.wizardData[key] = {
          ...this.wizardData[key],
          ...data
        }
      }
    },

    /**
     * 验证当前步骤
     * @returns 验证错误列表
     */
    validateCurrentStep() {
      // 获取当前步骤ID
      const currentStepId = this.steps[this.currentStepIndex].id
      const errors: ValidationError[] = []

      switch (currentStepId) {
        case 'basic-info':
          if (!this.wizardData.basicInfo.moduleName) {
            errors.push({ field: 'moduleName', message: '模块名称不能为空' })
          }
          break
        case 'table-config':
          if (!this.wizardData.tableConfig.tableId) {
            errors.push({ field: 'tableId', message: '请选择数据表' })
          }
          break
        case 'page-config':
          if (this.wizardData.pageConfig.listColumns.length === 0) {
            errors.push({ field: 'listColumns', message: '请至少选择一个列表显示字段' })
          }
          break
      }

      this.validationErrors = errors
      return errors
    },

    /**
     * 完成向导
     * @returns 生成结果
     */
    async completeWizard() {
      // 验证所有步骤
      for (let i = 0; i < this.steps.length - 1; i++) {
        this.currentStepIndex = i
        const errors = this.validateCurrentStep()
        if (errors.length > 0) {
          const currentStepName = this.steps[this.currentStepIndex].name
          return Promise.reject(`步骤 ${currentStepName} 验证失败: ${errors[0].message}`)
        }
      }

      // 标记为已完成
      this.isCompleted = true

      // 调用生成API (这里模拟返回)
      // TODO: 实际集成API调用
      try {
        // const response = await generatorApi.code.generate(...)
        return {
          id: `gen-${Date.now()}`,
          files: [],
          stats: {
            totalFiles: 0,
            totalCodeLines: 0,
            frontendFiles: 0,
            backendFiles: 0
          }
        }
      } catch (error: unknown) {
        this.isCompleted = false
        throw error
      }
    },

    /**
     * 重置向导
     */
    resetWizard() {
      this.$reset()
    }
  },

  persist: {
    key: 'wizard-state',
    storage: sessionStorage,
    pick: ['currentStepIndex', 'wizardData']
  }
})

export default useWizardStore
