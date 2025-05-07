import { defineStore } from 'pinia'
import type { GenerationRecord, RecentProject, GlobalSettings } from '@/types/generator'

export interface GeneratorState {
  currentStep: string // 当前步骤
  generationHistory: GenerationRecord[] // 生成历史记录
  recentProjects: RecentProject[] // 最近项目
  globalSettings: GlobalSettings // 全局设置
  isGenerating: boolean // 是否正在生成
  lastGeneratedId: string | null // 最后生成的ID
}

/**
 * 代码生成器核心Store
 */
export const useGeneratorStore = defineStore('generator', {
  state: (): GeneratorState => ({
    currentStep: '',
    generationHistory: [],
    recentProjects: [],
    globalSettings: {
      defaultTemplate: 'standard',
      enableAutoSave: true,
      deployAfterGenerate: false,
      indentSize: 2,
      theme: 'light'
    },
    isGenerating: false,
    lastGeneratedId: null
  }),

  getters: {
    /**
     * 获取最近项目
     */
    getRecentProjects: (state: GeneratorState): RecentProject[] => {
      return state.recentProjects
    },

    /**
     * 获取生成历史
     */
    getGenerationHistory: (state: GeneratorState): GenerationRecord[] => {
      return state.generationHistory
    },

    /**
     * 判断是否正在生成
     */
    isGeneratingCode: (state: GeneratorState): boolean => {
      return state.isGenerating
    }
  },

  actions: {
    /**
     * 设置当前步骤
     * @param step 步骤标识
     */
    setCurrentStep(step: string): void {
      this.currentStep = step
    },

    /**
     * 添加到生成历史
     * @param record 生成记录
     */
    addToHistory(record: GenerationRecord): void {
      this.generationHistory.unshift(record)

      // 保持历史记录不超过20条
      if (this.generationHistory.length > 20) {
        this.generationHistory = this.generationHistory.slice(0, 20)
      }
    },

    /**
     * 更新全局设置
     * @param settings 设置参数
     */
    updateGlobalSettings(settings: Partial<GlobalSettings>): void {
      this.globalSettings = {
        ...this.globalSettings,
        ...settings
      }
    },

    /**
     * 开始生成代码
     */
    startGeneration(): void {
      this.isGenerating = true
    },

    /**
     * 完成代码生成
     * @param id 生成ID
     */
    finishGeneration(id: string): void {
      this.isGenerating = false
      this.lastGeneratedId = id
    },

    /**
     * 加载最近项目
     */
    async loadRecentProjects(): Promise<void> {
      try {
        // 此处可以替换为实际API调用
        // const response = await generatorApi.project.getRecent()
        // this.recentProjects = response.data

        // 模拟数据
        this.recentProjects = [
          {
            id: '1',
            name: '用户管理模块',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            template: 'standard'
          },
          {
            id: '2',
            name: '订单管理系统',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            template: 'business'
          }
        ]
      } catch (error) {
        console.error('加载最近项目失败', error)
      }
    }
  }
})

export default useGeneratorStore
