import { ref, readonly } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'
import router from '@/router'

export interface ErrorInfo {
  message: string
  code?: number
  status?: number
  details?: any
  timestamp: number
  handled: boolean
  origin?: string
}

export type ErrorLevel = 'info' | 'warning' | 'error' | 'fatal'

/**
 * 错误处理工具 - 通过组合式API提供全局错误处理功能
 */
export function useErrorHandler() {
  // 错误状态管理
  const errors = ref<ErrorInfo[]>([])
  const hasErrors = ref(false)
  const lastError = ref<ErrorInfo | null>(null)

  /**
   * 检查是否为UI组件相关错误，可以被安全忽略的错误
   */
  const isIgnorableUIError = (error: any): boolean => {
    // 检查是否为可忽略的UI错误
    const ignorableMessages = [
      "Cannot set properties of undefined (setting 'checked')",
      "Cannot read properties of undefined (reading 'checked')",
      "TypeError: Cannot read properties of null (reading 'setCheckedKeys')"
    ]

    if (error instanceof Error) {
      return ignorableMessages.some((msg) => error.message.includes(msg))
    } else if (typeof error === 'string') {
      return ignorableMessages.some((msg) => error.includes(msg))
    } else if (error?.message && typeof error.message === 'string') {
      return ignorableMessages.some((msg) => error.message.includes(msg))
    }

    return false
  }

  /**
   * 处理错误
   * @param error 错误对象
   * @param level 错误级别
   * @param options 额外选项
   */
  function handleError(
    error: any,
    level: ErrorLevel = 'error',
    options: {
      showNotification?: boolean
      showMessage?: boolean
      redirectRoute?: string
      log?: boolean
      addToHistory?: boolean
      origin?: string
    } = {}
  ) {
    // 检查是否为可忽略的UI组件错误
    if (isIgnorableUIError(error)) {
      if (import.meta.env.DEV) {
        console.warn('忽略UI组件错误:', typeof error === 'string' ? error : error.message || error)
      }
      // 返回一个基本的错误信息，但不执行其他操作
      return {
        message: typeof error === 'string' ? error : error.message || '忽略的UI错误',
        timestamp: Date.now(),
        handled: true,
        origin: options.origin || 'UI组件'
      } as ErrorInfo
    }

    // 默认选项
    const {
      showNotification = level === 'fatal' || level === 'error',
      showMessage = level === 'warning' || level === 'info',
      redirectRoute,
      log = true,
      addToHistory = true,
      origin
    } = options

    // 提取错误信息
    const errorInfo: ErrorInfo = {
      message: '',
      timestamp: Date.now(),
      handled: false,
      origin
    }

    // 根据错误类型提取信息
    if (typeof error === 'string') {
      errorInfo.message = error
    } else if (error instanceof Error) {
      errorInfo.message = error.message
    } else if (error?.response) {
      // Axios错误对象
      const { data, status } = error.response
      errorInfo.status = status
      errorInfo.message = data?.message || error.message || '请求失败'
      errorInfo.code = data?.code
      errorInfo.details = data

      // 根据状态码优化重定向逻辑
      if (!redirectRoute) {
        switch (status) {
          case 401:
            localStorage.removeItem('token')
            router.push('/login')
            break
          case 403:
            router.push('/403')
            break
          case 404:
            router.push('/404')
            break
          case 500:
            router.push('/500')
            break
        }
      }
    } else if (error?.message) {
      errorInfo.message = error.message
      errorInfo.code = error.code
      errorInfo.details = error
    } else {
      errorInfo.message = '未知错误'
      errorInfo.details = error
    }

    // 记录错误
    if (log) {
      const logMethod =
        level === 'info' ? console.info : level === 'warning' ? console.warn : console.error
      logMethod(`[ErrorHandler] ${errorInfo.message}`, error)
    }

    // 安全地显示通知 - 处理UI组件相关的错误
    if (showNotification) {
      try {
        ElNotification({
          title: level === 'fatal' ? '严重错误' : '错误',
          message: errorInfo.message,
          type: level === 'info' ? 'info' : level === 'warning' ? 'warning' : 'error',
          duration: level === 'fatal' ? 0 : 4500
        })
      } catch (notifyError) {
        console.error('显示通知失败:', notifyError)
      }
    }

    // 安全地显示消息 - 处理UI组件相关的错误
    if (showMessage) {
      try {
        ElMessage({
          message: errorInfo.message,
          type: level === 'info' ? 'info' : level === 'warning' ? 'warning' : 'error'
        })
      } catch (msgError) {
        console.error('显示消息失败:', msgError)
      }
    }

    // 重定向
    if (redirectRoute) {
      try {
        router.push(redirectRoute)
      } catch (routeError) {
        console.error('路由跳转失败:', routeError)
      }
    }

    // 更新错误状态
    errorInfo.handled = true

    // 安全地更新响应式状态
    try {
      lastError.value = errorInfo
      hasErrors.value = true

      // 添加到历史记录
      if (addToHistory && Array.isArray(errors.value)) {
        errors.value.push(errorInfo)
        // 限制历史记录数量
        if (errors.value.length > 50) {
          errors.value.shift()
        }
      }
    } catch (stateError) {
      console.error('更新错误状态失败:', stateError)
    }

    return errorInfo
  }

  /**
   * 清除错误历史
   */
  function clearErrors() {
    try {
      errors.value = []
      hasErrors.value = false
      lastError.value = null
    } catch (error) {
      console.error('清除错误历史失败:', error)
    }
  }

  /**
   * 创建异步操作包装器
   * @param asyncFn 异步函数
   * @param errorOptions 错误处理选项
   */
  function createAsyncWrapper<T extends (...args: any[]) => Promise<any>>(
    asyncFn: T,
    errorOptions: {
      level?: ErrorLevel
      showNotification?: boolean
      showMessage?: boolean
      redirectRoute?: string
      log?: boolean
      addToHistory?: boolean
      onError?: (error: any) => void
      origin?: string
    } = {}
  ) {
    return async (...args: Parameters<T>): Promise<ReturnType<T> | null> => {
      try {
        return await asyncFn(...args)
      } catch (error) {
        // 检查是否为可忽略的错误
        if (isIgnorableUIError(error)) {
          if (import.meta.env.DEV) {
            console.warn('异步操作包装器: 忽略UI错误:', error)
          }
          return null
        }

        const handledError = handleError(error, errorOptions.level, errorOptions)

        if (errorOptions.onError) {
          try {
            errorOptions.onError(handledError)
          } catch (callbackError) {
            console.error('错误回调执行失败:', callbackError)
          }
        }

        return null
      }
    }
  }

  return {
    // 状态
    errors: readonly(errors),
    hasErrors: readonly(hasErrors),
    lastError: readonly(lastError),

    // 方法
    handleError,
    clearErrors,
    createAsyncWrapper,
    isIgnorableUIError
  }
}

// 创建全局单例实例
const globalErrorHandler = useErrorHandler()

export { globalErrorHandler }
