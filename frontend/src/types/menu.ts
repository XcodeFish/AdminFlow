/**
 * 菜单类型
 */
export interface MenuItem {
  id: string
  menuName: string
  parentId: string | null
  orderNum: number
  path: string
  component: string | null
  query: string | null
  isExternal: number
  isCache: number
  menuType: 'M' | 'C' | 'F' // M:目录 C:菜单 F:按钮
  isVisible: number
  status: number
  perms: string | null
  icon: string | null
  remark: string | null
  createdAt: string
  updatedAt: string
  children?: MenuItem[]
}

/**
 * 菜单树节点
 */
export interface MenuTreeNode {
  id: string
  menuName: string
  parentId: string | null
  orderNum: number
  path: string
  component: string | null
  menuType: 'M' | 'C' | 'F'
  icon: string | null
  children?: MenuTreeNode[]
}

/**
 * 用户菜单信息
 */
export interface UserMenuInfo {
  name: string
  path: string
  hidden: boolean
  redirect?: string
  component: string
  alwaysShow?: boolean
  meta: {
    title: string
    icon?: string
    noCache: boolean
    permission?: string
  }
  children?: UserMenuInfo[]
}

/**
 * 创建菜单参数
 */
export interface CreateMenuParams {
  menuName: string
  parentId?: string | null
  orderNum?: number
  path?: string
  component?: string
  query?: string
  isExternal?: number
  isCache?: number
  menuType: 'M' | 'C' | 'F'
  isVisible?: number
  status?: number
  perms?: string
  icon?: string | null
  remark?: string
}

/**
 * 更新菜单参数
 */
export interface UpdateMenuParams extends Partial<CreateMenuParams> {
  id: string
}

/**
 * 查询菜单参数
 */
export interface QueryMenuParams {
  menuName?: string
  status?: number
  page?: number
  limit?: number
}

/**
 * 分配角色菜单参数
 */
export interface AssignRoleMenusParams {
  roleId: string
  menuIds: string[]
}

/**
 * 菜单列表响应
 */
export interface MenuListResponse {
  code?: number
  message?: string
  data: {
    items: MenuItem[]
    total: number
  }
  timestamp?: string
}

/**
 * 菜单树响应
 */
export interface MenuTreeResponse {
  code?: number
  message?: string
  data: MenuTreeNode[]
  timestamp?: string
}

/**
 * 单个菜单响应
 */
export interface MenuResponse {
  code?: number
  data: MenuItem
  message?: string
  timestamp?: string
}

/**
 * 创建菜单响应
 */
export interface CreateMenuResponse {
  code?: number
  data: MenuItem
  message?: string
  timestamp?: string
}

/**
 * 更新菜单响应
 */
export interface UpdateMenuResponse {
  code?: number
  data: MenuItem
  message?: string
  timestamp?: string
}

/**
 * 删除菜单响应
 */
export interface DeleteMenuResponse {
  code?: number
  data: null
  message?: string
  timestamp?: string
}

/**
 * 用户菜单权限响应
 */
export interface UserMenuResponse {
  code?: number
  data: {
    menus: UserMenuInfo[]
    permissions: string[]
  }
  message?: string
  timestamp?: string
}

/**
 * 角色菜单ID列表响应
 */
export interface RoleMenuIdsResponse {
  code?: number
  data: string[]
  message?: string
  timestamp?: string
}

/**
 * 角色菜单分配响应
 */
export interface AssignRoleMenusResponse {
  code?: number
  data: null
  message?: string
  timestamp?: string
}
