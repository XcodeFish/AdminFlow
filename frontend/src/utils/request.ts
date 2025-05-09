import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { useUserStore } from '@/store/modules/user'
import { usePermissionStore } from '@/store/modules/permission'

// 改为这样，移除枚举声明的export
enum RequestEvent {
  START = 'request:start',
  END = 'request:end',
  ERROR = 'request:error',
  UNAUTHORIZED = 'request:unauthorized',
  FORBIDDEN = 'request:forbidden',
  NOT_FOUND = 'request:not_found',
  SERVER_ERROR = 'request:server_error'
}

// 事件总线 - 简单实现
class EventBus {
  private events: Map<string, Function[]> = new Map()

  on(event: string, callback: Function): void {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }
    this.events.get(event)?.push(callback)
  }

  off(event: string, callback?: Function): void {
    if (!callback) {
      this.events.delete(event)
      return
    }

    const callbacks = this.events.get(event)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index !== -1) {
        callbacks.splice(index, 1)
      }
      if (callbacks.length === 0) {
        this.events.delete(event)
      }
    }
  }

  emit(event: string, ...args: any[]): void {
    const callbacks = this.events.get(event)
    if (callbacks) {
      callbacks.forEach((callback) => callback(...args))
    }
  }
}

const eventBus = new EventBus()

// 消息提示封装
const showMessage = (options: {
  type: 'success' | 'warning' | 'error' | 'info'
  message: string
}) => {
  ElMessage({
    type: options.type,
    message: options.message
  })
}

/**
 * 过滤空参数
 * @param params 参数对象
 * @returns 过滤后的参数对象
 */
export function cleanParams<T extends Record<string, any>>(params: T): Partial<T> {
  const result: Partial<T> = {}

  Object.entries(params).forEach(([key, value]) => {
    // 排除空值
    if (value === '' || value === null || value === undefined) {
      return
    }

    // 处理数字类型字段
    if (['page', 'pageSize', 'status', 'type', 'visible', 'sort'].includes(key)) {
      const numValue = Number(value)
      if (!isNaN(numValue)) {
        result[key as keyof T] = numValue as any
        return
      }
    }

    result[key as keyof T] = value
  })

  return result
}

/**
 * 创建请求实例
 */
class HttpClient {
  private instance: AxiosInstance

  constructor(config: AxiosRequestConfig) {
    this.instance = axios.create(config)
    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        // 触发请求开始事件
        eventBus.emit(RequestEvent.START, config)

        // 获取token并添加到请求头
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.set('Authorization', `Bearer ${token}`)
        }

        // 添加详细日志
        console.log(`🚀 Request [${config.method?.toUpperCase()}] ${config.url}`, {
          headers: config.headers,
          params: config.params,
          data: config.data
        })

        return config
      },
      (error) => {
        // 触发请求错误事件
        eventBus.emit(RequestEvent.ERROR, error)
        console.error('⚠️ Request Error:', error)
        return Promise.reject(error)
      }
    )

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        // 触发请求结束事件
        eventBus.emit(RequestEvent.END, response)

        // 添加详细日志
        console.log(`✅ Response [${response.status}] ${response.config.url}`, response.data)

        const { data } = response

        // 处理业务状态码
        if (data.code !== undefined && ![0, 200, 201].includes(data.code)) {
          console.error(`🚨 API Error [${data.code}]:`, data.message)

          // 根据错误码触发对应事件
          if (data.code === 401) {
            eventBus.emit(RequestEvent.UNAUTHORIZED, data)
            // 清除token并跳转登录页
            localStorage.removeItem('token')
            router.push('/login')
            return Promise.reject(new Error('未授权或登录已过期，请重新登录'))
          }

          // 显示错误信息
          showMessage({
            type: 'error',
            message: data.message || '请求失败'
          })

          return Promise.reject(new Error(data.message || '未知错误'))
        }

        return data
      },
      (error) => {
        // 触发请求错误事件
        eventBus.emit(RequestEvent.ERROR, error)

        // 添加详细日志
        console.error('❌ Response Error:', {
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url,
          message: error.message
        })

        // 处理HTTP状态码
        if (error.response) {
          const { status } = error.response

          switch (status) {
            case 400:
              // 处理Bad Request错误
              console.error('🚨 请求参数错误(400):', error.response.data)
              showMessage({
                type: 'error',
                message: error.response.data?.message || '请求参数错误'
              })
              break

            case 401:
              if (!router.currentRoute.value.path.includes('/login')) {
                eventBus.emit(RequestEvent.UNAUTHORIZED, error)
                localStorage.removeItem('token')

                // 使用正确的store引用
                try {
                  const userStore = useUserStore()
                  const permissionStore = usePermissionStore()

                  if (userStore) {
                    userStore.token = null
                    userStore.isLoggedIn = false
                  }

                  if (permissionStore) {
                    permissionStore.fallbackToLocalRoutes = true
                  }
                } catch (e) {
                  console.error('无法重置store状态', e)
                }

                // 显示错误信息
                showMessage({
                  type: 'error',
                  message: '登录已过期，请重新登录'
                })

                router.push('/login')
              }
              break

            case 403:
              if (error.config.url && error.config.url.includes('api')) {
                eventBus.emit(RequestEvent.FORBIDDEN, error)
                return Promise.reject(error)
              }
              router.push('/403')
              break

            case 404:
              // 如果是API调用，只记录错误，不重定向
              if (error.config.url && error.config.url.includes('api')) {
                eventBus.emit(RequestEvent.NOT_FOUND, error)
                return Promise.reject(error)
              }
              router.push('/404')
              break

            case 500:
              if (error.config.url && error.config.url.includes('api')) {
                eventBus.emit(RequestEvent.SERVER_ERROR, error)
                return Promise.reject(error)
              }
              router.push('/500')
              break
          }
        }

        return Promise.reject(error)
      }
    )
  }

  /**
   * 发起请求
   */
  request<T = any>(config: AxiosRequestConfig): Promise<T> {
    return this.instance.request(config)
  }

  /**
   * GET请求
   */
  get<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
    const cleanedParams = params ? cleanParams(params) : {}
    return this.instance.get(url, { ...config, params: cleanedParams })
  }

  /**
   * POST请求
   */
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const cleanedData = data ? cleanParams(data) : {}
    return this.instance.post(url, cleanedData, config)
  }

  /**
   * PUT请求
   */
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const cleanedData = data ? cleanParams(data) : {}
    return this.instance.put(url, cleanedData, config)
  }

  /**
   * DELETE请求
   */
  delete<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
    const cleanedParams = params ? cleanParams(params) : {}
    return this.instance.delete(url, { ...config, params: cleanedParams })
  }

  /**
   * PATCH请求
   */
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const cleanedData = data ? cleanParams(data) : {}
    return this.instance.patch(url, cleanedData, config)
  }

  /**
   * 文件上传
   */
  upload<T = any>(url: string, file: File, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)

    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value as any)
      })
    }

    return this.instance.post(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}

// 创建HTTP客户端实例
const http = new HttpClient({
  baseURL: import.meta.env.VITE_BASE_URL + '/api',
  timeout: 15000,
  withCredentials: true
})

export { http, eventBus, RequestEvent, showMessage }

// 为了兼容旧代码，保留原有导出方式
export const get = http.get.bind(http)
export const post = http.post.bind(http)
export const put = http.put.bind(http)
export const patch = http.patch.bind(http)
export const del = http.delete.bind(http)
export const upload = http.upload.bind(http)

export default {
  request: http.request.bind(http),
  get: http.get.bind(http),
  post: http.post.bind(http),
  put: http.put.bind(http),
  patch: http.patch.bind(http),
  del: http.delete.bind(http),
  upload: http.upload.bind(http)
}
