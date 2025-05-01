// frontend/src/types/auth.ts
export interface LoginParams {
  username: string
  password: string
  // captcha?: string
  // captchaId?: string
  rememberMe?: boolean
}

export interface LoginResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
  userInfo: UserInfo
}

export interface UserInfo {
  id?: string | number
  username?: string
  nickname?: string
  realName?: string
  email?: string
  phone?: string
  gender?: number
  avatar?: string
  status?: number
  deptId?: number
  roles?: {
    id: number
    roleName: string
    roleKey: string
    orderNum: number
    remark?: string
    dataScope: number
    status: number
  }[]
  createdAt?: string
  lastLoginTime?: string
}
