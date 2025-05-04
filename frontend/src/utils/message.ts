
// 消息参数接口
export interface MessageOptions {
  type: 'success' | 'warning' | 'info' | 'error'
  message: string
  duration?: number
  showClose?: boolean
}

// 默认配置
const defaultOptions = {
  duration: 3000,
  showClose: false
}

/**
 * 统一的消息提示函数，根据当前UI库显示不同风格的消息
 */
export function showMessage(options: MessageOptions) {
  const mergedOptions = { ...defaultOptions, ...options }

   import('element-plus').then(({ ElMessage }) => {
      ElMessage({
        message: mergedOptions.message,
        type: mergedOptions.type,
        duration: mergedOptions.duration,
      showClose: mergedOptions.showClose
    })
  })
}

/**
 * 成功消息
 */
export function showSuccess(
  message: string,
  options?: Partial<Omit<MessageOptions, 'type' | 'message'>>
) {
  showMessage({
    type: 'success',
    message,
    ...options
  })
}

/**
 * 警告消息
 */
export function showWarning(
  message: string,
  options?: Partial<Omit<MessageOptions, 'type' | 'message'>>
) {
  showMessage({
    type: 'warning',
    message,
    ...options
  })
}

/**
 * 错误消息
 */
export function showError(
  message: string,
  options?: Partial<Omit<MessageOptions, 'type' | 'message'>>
) {
  showMessage({
    type: 'error',
    message,
    ...options
  })
}

/**
 * 信息消息
 */
export function showInfo(
  message: string,
  options?: Partial<Omit<MessageOptions, 'type' | 'message'>>
) {
  showMessage({
    type: 'info',
    message,
    ...options
  })
}

/**
 * 确认消息对话框
 */
export function showConfirm(
  title: string,
  content: string,
  onOk?: () => void | Promise<void>,
  options?: {
    cancelText?: string
    okText?: string
    type?: 'success' | 'warning' | 'info' | 'error'
    onCancel?: () => void | Promise<void>
  }
) {
  const defaultConfirmOptions = {
    cancelText: '取消',
    okText: '确定',
    type: 'warning' as const,
    onCancel: undefined as undefined | (() => void | Promise<void>)
  }

  const mergedOptions = { ...defaultConfirmOptions, ...options }

  import('element-plus').then(({ ElMessageBox }) => {
      ElMessageBox.confirm(content, title, {
        confirmButtonText: mergedOptions.okText,
        cancelButtonText: mergedOptions.cancelText,
        type: mergedOptions.type
      })
        .then(() => {
          if (onOk) onOk()
        })
        .catch(() => {
          if (mergedOptions.onCancel) mergedOptions.onCancel()
        })
    })

}

export default {
  showMessage,
  showSuccess,
  showWarning,
  showError,
  showInfo,
  showConfirm
}
