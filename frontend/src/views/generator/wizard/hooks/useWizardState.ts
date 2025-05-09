import { useWizardStore } from '@/store/modules/wizard'
import { computed, ComputedRef, Ref } from 'vue'
import { WizardStep, ValidationError, WizardData } from '@/types/generator'
import { ref, reactive } from 'vue'

/**
 * 向导状态管理Hook，用于管理代码生成向导的状态和导航
 */
export function useWizardState() {
  const wizardStore = useWizardStore()

  // 计算属性
  const currentStep: ComputedRef<WizardStep | null> = computed(() => wizardStore.currentStep)

  const steps: ComputedRef<WizardStep[]> = computed(() => wizardStore.steps)

  const progress: ComputedRef<number> = computed(() => wizardStore.progress)

  const wizardData: WizardData = wizardStore.wizardData

  const validationErrors: Ref<ValidationError[]> = computed(() => wizardStore.validationErrors)

  const isLoading: ComputedRef<boolean> = computed(() => wizardStore.isLoading)

  const isCompleted: ComputedRef<boolean> = computed(() => wizardStore.isCompleted)

  // 使用Vue的响应式API
  const wizardDataRef = ref<WizardData>(wizardData)

  // 当前步骤
  const currentStepRef = ref(currentStep.value)

  /**
   * 初始化向导状态
   * @param initialData 初始数据（可选）
   * @param datasourceId 数据源ID（可选）
   */
  const initWizard = (initialData?: Partial<WizardData>, datasourceId?: number) => {
    wizardStore.initWizard(initialData, datasourceId)
  }

  /**
   * 前往下一步
   * @returns 是否成功前进到下一步
   */
  const nextStep = async (): Promise<boolean> => {
    return wizardStore.goToNextStep()
  }

  /**
   * 前往上一步
   */
  const prevStep = () => {
    wizardStore.goToPrevStep()
  }

  /**
   * 前往指定步骤
   * @param index 步骤索引
   */
  const goToStep = (index: number) => {
    wizardStore.goToStep(index)
  }

  /**
   * 更新某个步骤的数据
   * @param step 步骤ID
   * @param data 步骤数据
   */
  const updateStepData = (step: string, data: any) => {
    wizardStore.updateWizardData(step, data)
  }

  /**
   * 验证当前步骤
   * @returns 验证错误列表
   */
  const validateCurrentStep = (): ValidationError[] => {
    return wizardStore.validateCurrentStep()
  }

  /**
   * 完成向导流程
   */
  const completeWizard = async () => {
    return wizardStore.completeWizard()
  }

  /**
   * 重置向导状态
   */
  const resetWizard = () => {
    wizardStore.resetWizard()
  }

  /**
   * 获取表结构详情
   * @param datasourceId 数据源ID
   * @param tableName 表名
   */
  const fetchTableDetail = async (datasourceId: number, tableName: string) => {
    return wizardStore.fetchTableDetail(datasourceId, tableName)
  }

  /**
   * 更新步骤数据
   * @param step 步骤名称
   * @param data 步骤数据
   */
  const updateStepDataRef = (step: keyof WizardData, data: any) => {
    wizardDataRef[step] = data
  }

  /**
   * 重置向导数据
   */
  const resetWizardData = () => {
    Object.keys(wizardDataRef).forEach((key) => {
      delete wizardDataRef[key as keyof WizardData]
    })
    currentStepRef.value = 0
  }

  return {
    // 状态
    steps,
    currentStep,
    progress,
    wizardData,
    validationErrors,
    isLoading,
    isCompleted,

    // 方法
    initWizard,
    nextStep,
    prevStep,
    goToStep,
    updateStepData,
    validateCurrentStep,
    completeWizard,
    resetWizard,
    fetchTableDetail,
    updateStepDataRef,
    resetWizardData
  }
}

export default useWizardState
