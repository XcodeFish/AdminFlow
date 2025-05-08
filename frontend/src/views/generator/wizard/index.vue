<template>
  <div class="generator-wizard">
    <!-- 顶部步骤导航 -->
    <StepNav :steps="steps" :active-step="currentStepIndex" :validation-errors="validationErrors"
      :is-completed="isCompleted" @step-click="goToStep" />

    <div class="wizard-layout">
      <!-- 中间内容区 -->
      <div class="wizard-content">
        <component :is="currentStepComponent" ref="stepComponentRef" />
      </div>

      <!-- 右侧预览区 -->
      <div class="wizard-preview">
        <Preview />
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="wizard-footer">
      <div class="wizard-progress">
        <el-progress :percentage="progress" :status="progressStatus" />
        <div class="validation-error" v-if="hasErrors">
          <el-alert :title="validationErrors[0].message" type="error" show-icon :closable="false" />
        </div>
      </div>

      <div class="wizard-actions">
        <el-button v-if="canGoPrev" @click="prevStep">
          上一步
        </el-button>

        <el-button v-if="canGoNext" type="primary" @click="handleNextStep" :loading="isLoading">
          下一步
        </el-button>

        <el-button v-if="isLastStep && !isCompleted" type="success" @click="generateCode" :loading="isLoading">
          生成代码
        </el-button>

        <el-button v-if="isCompleted" type="success" @click="downloadCode">
          下载代码
        </el-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, shallowRef, defineAsyncComponent, onMounted } from 'vue'
import { ElProgress, ElButton, ElAlert } from 'element-plus'
import { useWizardState } from './hooks/useWizardState'
import { useWizardStore } from '@/store/modules/wizard'
import { usePreview } from './hooks/usePreview'
import StepNav from './components/StepNav.vue'
import Preview from './components/Preview.vue'

// 异步加载各步骤组件
const BasicInfo = defineAsyncComponent(() => import('./steps/BasicInfo.vue'))
const FieldConfig = defineAsyncComponent(() => import('./steps/FieldConfig.vue'))
const PageConfig = defineAsyncComponent(() => import('./steps/PageConfig.vue'))
const AdvancedConfig = defineAsyncComponent(() => import('./steps/AdvancedConfig.vue'))
const PreviewConfirm = defineAsyncComponent(() => import('./steps/PreviewConfirm.vue'))

// 获取wizardStore实例
const wizardStore = useWizardStore()

// 获取向导状态
const {
  steps,
  currentStep,
  progress,
  validationErrors,
  isLoading,
  isCompleted,

  initWizard,
  nextStep,
  prevStep,
  goToStep,
  completeWizard
} = useWizardState()

// 从store直接获取currentStepIndex
const currentStepIndex = computed(() => wizardStore.currentStepIndex)

// 获取预览相关功能
const { downloadGeneratedCode } = usePreview()

// 当前步骤组件
const stepComponentMap: Record<string, any> = {
  'BasicInfo': BasicInfo,
  'FieldConfig': FieldConfig,
  'PageConfig': PageConfig,
  'AdvancedConfig': AdvancedConfig,
  'PreviewConfirm': PreviewConfirm
}

const currentStepComponent = computed(() => {
  if (!currentStep.value) return null
  return stepComponentMap[currentStep.value.component] || null
})

// 步骤组件引用
const stepComponentRef = shallowRef<any>(null)

// 计算属性
const canGoPrev = computed(() => currentStepIndex.value > 0)
const canGoNext = computed(() => currentStepIndex.value < steps.value.length - 1)
const isLastStep = computed(() => currentStepIndex.value === steps.value.length - 1)
const hasErrors = computed(() => validationErrors.value.length > 0)
const progressStatus = computed(() => {
  if (isCompleted.value) return 'success'
  if (hasErrors.value) return 'exception'
  return ''
})

// 初始化
onMounted(() => {
  initWizard()
})

// 处理下一步操作
const handleNextStep = async () => {
  if (stepComponentRef.value && 'saveFormData' in stepComponentRef.value) {
    console.log('保存前的数据:', wizardStore.wizardData)
    // 调用当前步骤组件的保存方法
    const result = await stepComponentRef.value.saveFormData()
    console.log('保存结果:', result)
    console.log('保存后的数据:', wizardStore.wizardData)
  }

  await nextStep()
}

// 生成代码
const generateCode = async () => {
  if (stepComponentRef.value && 'saveFormData' in stepComponentRef.value) {
    // 调用当前步骤组件的保存方法
    await stepComponentRef.value.saveFormData()
  }

  try {
    await completeWizard()
  } catch (error) {
    console.error('生成代码失败:', error)
  }
}

// 下载代码
const downloadCode = () => {
  downloadGeneratedCode()
}
</script>

<style lang="scss" scoped>
.generator-wizard {
  display: flex;
  flex-direction: column;
  height: 100%;

  .wizard-layout {
    display: flex;
    flex: 1;
    overflow: hidden;
    margin-bottom: 16px;

    .wizard-content {
      flex: 2;
      padding: 0 16px;
      overflow-y: auto;
      border-right: 1px solid var(--el-border-color-lighter);
    }

    .wizard-preview {
      flex: 1;
      min-width: 400px;
      max-width: 700px;
      overflow: hidden;
      padding: 0 16px;
    }
  }

  .wizard-footer {
    display: flex;
    flex-direction: column;
    padding: 16px;
    border-top: 1px solid var(--el-border-color-lighter);
    background-color: var(--el-bg-color);

    .wizard-progress {
      margin-bottom: 16px;

      .validation-error {
        margin-top: 8px;
      }
    }

    .wizard-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
  }
}
</style>
