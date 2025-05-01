<template>
  <div>
    <div v-if="error" class="error-boundary">
      <div class="error-card">
        <el-alert :title="error.message || '组件渲染出错'" type="error" :description="errorInfo || ''" show-icon
          :closable="false" />
        <div class="error-actions">
          <el-button type="primary" size="small" @click="reset">重试</el-button>
          <el-button size="small" @click="$emit('error', error)">详情</el-button>
        </div>
      </div>
      <slot name="fallback" :error="error" :reset="reset"></slot>
    </div>
    <slot v-else></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { globalErrorHandler } from '@/composables/useErrorHandler'

export default defineComponent({
  name: 'ErrorBoundary',

  props: {
    // 是否自动记录错误
    logError: {
      type: Boolean,
      default: true
    },
    // 是否显示通知
    showNotification: {
      type: Boolean,
      default: false
    },
    // 错误级别
    errorLevel: {
      type: String,
      default: 'error',
      validator: (value: string) => ['info', 'warning', 'error', 'fatal'].includes(value)
    }
  },

  emits: ['error', 'reset'],

  setup(props, { emit }) {
    const error = ref<Error | null>(null)
    const errorInfo = ref<string>('')
    const componentInstance = ref<any>(null)

    // 重置错误状态
    const reset = () => {
      error.value = null
      errorInfo.value = ''
      emit('reset')
    }

    return {
      error,
      errorInfo,
      componentInstance,
      reset
    }
  },

  errorCaptured(err: Error, vm: any, info: string) {
    // 记录错误信息
    this.error = err
    this.errorInfo = info
    this.componentInstance = vm

    // 使用全局错误处理器处理错误
    if (this.logError) {
      globalErrorHandler.handleError(err, this.errorLevel as any, {
        showNotification: this.showNotification,
        addToHistory: true
      })
    }

    // 发出错误事件
    this.$emit('error', { error: err, vm, info })

    // 阻止错误继续传播
    return false
  }
})
</script>

<style scoped>
.error-boundary {
  width: 100%;
  padding: 16px;
  border-radius: 4px;
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.error-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.error-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}
</style>
