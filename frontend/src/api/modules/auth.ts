// frontend/src/api/modules/auth.ts
import request from '@/utils/request'
import { LoginParams } from '@/types/auth'


export function login(data: LoginParams) {
  return request.post('/v1/auth/login', data)
}

export function getUserInfo(id: string) {
  return request.get(`/v1/users/${id}`)
}

// frontend/src/api/modules/auth.ts
// 在文件中添加这个函数导出
export function getCaptcha() {
  // 使用您的请求工具
  return fetch('/api/auth/captcha').then(res => res.json()).then(data => data.data)
  // 或者用您的request工具: return request.get('/auth/captcha')
}

// export function logout() {
//   return request.post('/auth/logout')
// }
