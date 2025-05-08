<template>
  <div class="wizard-step-nav">
    <el-steps :active="activeStep" finish-status="success" :process-status="stepProcessStatus">
      <el-step v-for="(step, index) in steps" :key="step.id" :title="step.name" :description="step.description"
        @click.native="handleStepClick(index)">
        <template #icon>
          <div class="step-icon-wrapper" :class="{ clickable: canJumpTo(index) }">
            <span v-if="index < activeStep">
              <el-icon>
                <Check />
              </el-icon>
            </span>
            <span v-else-if="index === activeStep">
              {{ index + 1 }}
            </span>
            <span v-else>
              {{ index + 1 }}
            </span>
          </div>
        </template>
      </el-step>
    </el-steps>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { ElSteps, ElStep, ElIcon } from 'element-plus'
import { Check } from '@element-plus/icons-vue'
import type { WizardStep, ValidationError } from '@/types/generator'

interface Props {
  steps: WizardStep[]
  activeStep: number
  validationErrors: ValidationError[]
  isCompleted: boolean
}

interface Emits {
  (e: 'step-click', index: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 步骤状态
const stepProcessStatus = computed(() => {
  return props.validationErrors.length > 0 ? 'error' : 'process'
})

// 判断是否可以跳转到指定步骤
const canJumpTo = (index: number): boolean => {
  // 已完成的向导允许自由跳转
  if (props.isCompleted) return true

  // 当前步骤及之前的步骤可以跳转
  return index <= props.activeStep
}

// 处理步骤点击
const handleStepClick = (index: number) => {
  if (canJumpTo(index)) {
    emit('step-click', index)
  }
}
</script>

<style lang="scss" scoped>
.wizard-step-nav {
  padding: 16px 0;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--el-border-color-lighter);

  :deep(.el-step__title) {
    font-size: 14px;
  }

  :deep(.el-step__description) {
    font-size: 12px;
  }

  .step-icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;

    &.clickable {
      cursor: pointer;
    }
  }
}
</style>
