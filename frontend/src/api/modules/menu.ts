import request from '@/utils/request'
import {
  MenuItem,
  MenuTreeNode,
  UserMenuInfo,
  CreateMenuParams,
  UpdateMenuParams,
  QueryMenuParams,
  AssignRoleMenusParams
} from '@/types/menu'

/**
 * 创建菜单
 * @param data 菜单数据
 */
export function createMenu(data: CreateMenuParams) {
  return request.post<MenuItem>('/v1/system/menu', data)
}

/**
 * 查询菜单列表
 * @param params 查询参数
 */
export function getMenuList(params?: QueryMenuParams) {
  return request.get<{ items: MenuItem[]; total: number }>('/v1/system/menu', params)
}

/**
 * 获取菜单树结构
 */
export function getMenuTree() {
  return request.get<MenuTreeNode[]>('/v1/system/menu/tree')
}

/**
 * 获取当前用户菜单
 */
export function getUserMenus() {
  return request.get<UserMenuInfo[]>('/v1/system/menu/user')
}

/**
 * 获取角色菜单ID列表
 * @param roleId 角色ID
 */
export function getRoleMenuIds(roleId: string) {
  return request.get<string[]>(`/v1/system/menu/role/${roleId}`)
}

/**
 * 分配角色菜单
 * @param data 角色菜单数据
 */
export function assignRoleMenus(data: AssignRoleMenusParams) {
  return request.post<void>('/v1/system/menu/role/assign', data)
}

/**
 * 根据ID查询菜单
 * @param id 菜单ID
 */
export function getMenuById(id: string) {
  return request.get<MenuItem>(`/v1/system/menu/${id}`)
}

/**
 * 更新菜单
 * @param id 菜单ID
 * @param data 菜单数据
 */
export function updateMenu(id: string, data: UpdateMenuParams) {
  return request.put<MenuItem>(`/v1/system/menu/${id}`, data)
}

/**
 * 删除菜单
 * @param id 菜单ID
 */
export function deleteMenu(id: string) {
  return request.del<void>(`/v1/system/menu/${id}`)
}
