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
  parentId?: string
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
  icon?: string
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
