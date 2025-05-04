# 角色管理模块设计文档

## 1. 概述

角色管理模块是AdminFlow系统核心权限管理体系的重要组成部分，用于管理系统内所有角色的创建、查询、更新、删除以及权限分配等功能。本文档详细描述了角色管理模块的前端设计方案，包括页面结构、功能组件、接口交互等内容。

## 2. 功能需求

### 2.1 基础功能

- 角色列表：展示系统中所有角色
- 角色搜索：支持按角色名称、状态等条件进行搜索
- 角色创建：创建新角色并设置基本信息
- 角色编辑：修改现有角色的基本信息
- 角色删除：删除单个或批量删除角色
- 角色状态切换：启用/禁用角色
- 角色权限分配：为角色分配菜单权限和操作权限
- 角色数据范围设置：设置角色可访问的数据范围

### 2.2 高级功能

- 角色用户管理：查看并管理指定角色下的所有用户
- 角色权限审计：记录角色权限变更的操作历史

## 3. 页面结构

### 3.1 角色管理主页面

```
/views/system/role/index.vue
```

主页面采用与用户管理、菜单管理相一致的布局，包含以下区域：

1. 搜索区域：提供角色名称、状态等搜索条件
2. 操作按钮区域：新增、批量删除等操作
3. 角色列表表格：展示角色数据，支持分页、排序
4. 角色表单对话框：新增/编辑角色信息

### 3.2 角色权限分配页面

```
/views/system/role/components/PermissionAssign.vue
```

用于给角色分配权限的弹出对话框，包含：

1. 菜单权限树：展示系统所有菜单，可选择分配给角色
2. 操作权限列表：展示与菜单相关的操作权限
3. 数据权限范围设置：设置角色的数据访问范围

## 4. 组件设计

### 4.1 主要组件

#### 4.1.1 RoleForm.vue

角色表单组件，用于新增和编辑角色，包含以下字段：

- 角色名称 (roleName)
- 角色标识 (roleKey)
- 数据权限范围 (dataScope)
- 排序号 (orderNum)
- 状态 (status)
- 备注 (remark)

#### 4.1.2 RoleTable.vue

角色列表表格组件，展示角色数据，支持以下操作：

- 多选
- 排序
- 编辑
- 删除
- 权限分配
- 用户分配

#### 4.1.3 PermissionAssign.vue

权限分配组件，用于给角色分配权限，包含：

- 菜单树选择器
- 权限项选择器
- 数据范围选择器

### 4.2 业务逻辑钩子

角色管理模块采用以下hooks进行业务逻辑抽象：

#### 4.2.1 useRoleTable.ts

管理角色表格相关的状态和方法：

```typescript
export default function useRoleTable() {
  // 列表数据
  const roleList = ref<Role[]>([])
  const loading = ref(false)

  // 查询参数
  const searchParams = reactive<RoleQueryParams>({
    roleName: '',
    roleKey: '',
    status: undefined
  })

  // 表格列配置
  const columns = computed(() => [
    { type: 'selection', width: 50, label: '' },
    { prop: 'roleName', label: '角色名称', minWidth: 150 },
    { prop: 'roleKey', label: '角色标识', minWidth: 120 },
    { prop: 'orderNum', label: '排序', width: 80 },
    { prop: 'dataScope', label: '数据权限', width: 100, slot: 'dataScope' },
    { prop: 'status', label: '状态', width: 80, slot: 'status' },
    { prop: 'createdAt', label: '创建时间', minWidth: 180 },
    { prop: 'action', label: '操作', width: 250, slot: 'action' }
  ])

  // 获取角色列表
  const fetchRoleList = async () => {
    loading.value = true
    try {
      const res = await getRoleList()
      if (res.code === 0) {
        roleList.value = res.data
      }
    } catch (error) {
      console.error('获取角色列表失败', error)
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    roleList,
    searchParams,
    columns,
    fetchRoleList
  }
}
```

#### 4.2.2 useRoleActions.ts

管理角色操作相关的方法：

```typescript
export default function useRoleActions(loadRoleList: () => Promise<void>) {
  // 添加初始化标记
  const isInitialized = ref(false)

  // 更改角色状态
  const handleStatusChange = async (row: Role): Promise<void> => {
    const data: UpdateRoleParams = {
      status: row.status === 1 ? 0 : 1
    }
    try {
      const res = await updateRole(row.id, data)
      if (res.code === 0) {
        ElMessage.success(row.status === 1 ? '禁用成功' : '启用成功')
        await loadRoleList()
      }
    } catch (error) {
      console.error('更改角色状态失败', error)
    }
  }

  // 删除角色
  const handleDelete = async (row: Role): Promise<void> => {
    try {
      await ElMessageBox.confirm(`确认删除角色"${row.roleName}"吗？`, '提示', {
        type: 'warning'
      })

      const res = await deleteRole(row.id)
      if (res.code === 0) {
        ElMessage.success('删除成功')
        await loadRoleList()
      }
    } catch (error) {
      console.error('删除角色失败', error)
    }
  }

  // 批量删除
  const handleBatchDelete = async (selectedRows: Role[]): Promise<void> => {
    if (selectedRows.length === 0) {
      ElMessage.warning('请选择要删除的角色')
      return
    }

    try {
      await ElMessageBox.confirm(`确认删除选中的${selectedRows.length}个角色吗？`, '提示', {
        type: 'warning'
      })

      const promises = selectedRows.map(row => deleteRole(row.id))
      await Promise.all(promises)
      ElMessage.success('批量删除成功')
      await loadRoleList()
    } catch (error) {
      console.error('批量删除角色失败', error)
    }
  }

  // 初始化
  onMounted(() => {
    nextTick(() => {
      isInitialized.value = true
    })
  })

  return {
    handleStatusChange,
    handleDelete,
    handleBatchDelete,
    isInitialized
  }
}
```

#### 4.2.3 useRolePermission.ts

管理角色权限分配逻辑：

```typescript
export default function useRolePermission(roleId: Ref<string>) {
  // 权限树数据
  const permissionTree = ref<Permission[]>([])
  const checkedPermKeys = ref<string[]>([])
  const loading = ref(false)

  // 加载权限数据
  const loadPermissionData = async () => {
    loading.value = true
    try {
      // 获取所有权限树
      const treeRes = await getPermissionTree()
      if (treeRes.code === 0) {
        permissionTree.value = treeRes.data
      }

      // 获取角色已有权限
      if (roleId.value) {
        const rolePermRes = await getRolePermissions(roleId.value)
        if (rolePermRes.code === 0) {
          checkedPermKeys.value = rolePermRes.data.map(perm => perm.permKey)
        }
      }
    } catch (error) {
      console.error('加载权限数据失败', error)
    } finally {
      loading.value = false
    }
  }

  // 保存权限分配
  const saveRolePermissions = async () => {
    try {
      const params: AssignRolePermissionsParams = {
        permKeys: checkedPermKeys.value
      }

      const res = await assignRolePermissions(roleId.value, params)
      if (res.code === 0) {
        ElMessage.success('权限分配成功')
        return true
      }
      return false
    } catch (error) {
      console.error('保存权限分配失败', error)
      return false
    }
  }

  return {
    permissionTree,
    checkedPermKeys,
    loading,
    loadPermissionData,
    saveRolePermissions
  }
}
```

## 5. 数据模型

### 5.1 角色实体

```typescript
// 角色基础信息
export interface Role {
  id: string
  roleName: string
  roleKey: string
  dataScope: number // 1-全部 2-自定义 3-本部门 4-部门及以下 5-仅本人
  orderNum: number
  status: number // 0-禁用 1-正常
  remark?: string
  createdAt?: Date
  updatedAt?: Date
  permissions?: Permission[]
}

// 创建角色参数
export interface CreateRoleParams {
  roleName: string
  roleKey: string
  dataScope?: number
  orderNum?: number
  status?: number
  remark?: string
}

// 更新角色参数
export interface UpdateRoleParams {
  roleName?: string
  roleKey?: string
  dataScope?: number
  orderNum?: number
  status?: number
  remark?: string
}

// 角色权限分配参数
export interface AssignRolePermissionsParams {
  permKeys: string[]
}

// 用户角色分配参数
export interface AssignUserRolesParams {
  roleIds: string[]
}

// API响应类型
export interface RoleListResponse {
  code: number
  message: string
  data: Role[]
}

export interface RoleResponse {
  code: number
  message: string
  data: Role
}
```

## 6. API 接口

### 6.1 角色管理基础接口

根据后端实际API实现，角色管理模块使用以下接口：

```typescript
/**
 * 创建角色
 * @param data 角色数据
 */
export const createRole = (data: CreateRoleParams) => {
  return request.post<RoleResponse>('/permission/roles', data)
}

/**
 * 更新角色
 * @param id 角色ID
 * @param data 更新数据
 */
export const updateRole = (id: string, data: UpdateRoleParams) => {
  return request.put<RoleResponse>(`/permission/roles/${id}`, data)
}

/**
 * 删除角色
 * @param id 角色ID
 */
export const deleteRole = (id: string) => {
  return request.delete<{ code: number, message: string, data: null }>(`/permission/roles/${id}`)
}

/**
 * 获取角色列表
 */
export const getRoleList = () => {
  return request.get<RoleListResponse>('/permission/roles')
}

/**
 * 获取角色详情
 * @param id 角色ID
 */
export const getRoleById = (id: string) => {
  return request.get<RoleResponse>(`/permission/roles/${id}`)
}
```

### 6.2 角色权限管理接口

```typescript
/**
 * 分配角色权限
 * @param roleId 角色ID
 * @param data 权限标识列表
 */
export const assignRolePermissions = (roleId: string, data: AssignRolePermissionsParams) => {
  return request.put<{ code: number, message: string, data: null }>(`/permission/roles/${roleId}/permissions`, data)
}

/**
 * 获取角色权限列表
 * @param roleId 角色ID
 */
export const getRolePermissions = (roleId: string) => {
  return request.get<{ code: number, message: string, data: Permission[] }>(`/permission/roles/${roleId}/permissions`)
}

/**
 * 为用户分配角色
 * @param userId 用户ID
 * @param data 角色ID数组
 */
export const assignUserRoles = (userId: string, data: AssignUserRolesParams) => {
  return request.put<{ code: number, message: string, data: null }>(`/permission/users/${userId}/roles`, data)
}

/**
 * 获取用户角色列表
 * @param userId 用户ID
 */
export const getUserRoles = (userId: string) => {
  return request.get<{ code: number, message: string, data: Role[] }>(`/permission/users/${userId}/roles`)
}

/**
 * 获取用户权限列表
 * @param userId 用户ID
 */
export const getUserPermissions = (userId: string) => {
  return request.get<{ code: number, message: string, data: Permission[] }>(`/permission/users/${userId}/permissions`)
}

/**
 * 获取权限审计日志
 * @param params 查询参数
 */
export const getPermissionAuditLogs = (params?: {
  operationType?: number,
  targetId?: string,
  startTime?: Date,
  endTime?: Date,
  page?: number,
  limit?: number
}) => {
  return request.get<{
    code: number,
    message: string,
    data: {
      items: AuditLog[],
      meta: {
        itemCount: number,
        totalPages: number,
        currentPage: number
      }
    }
  }>('/permission/audit-logs', params)
}
```

## 7. 工作流程

### 7.1 角色管理主流程

1. 用户进入角色管理页面
2. 系统加载角色列表数据
3. 用户可执行搜索、新增、编辑、删除等操作
4. 对角色执行状态变更等操作时，系统实时更新角色状态

### 7.2 角色权限分配流程

1. 用户点击"分配权限"按钮
2. 系统加载当前角色已有权限和可分配的权限列表
3. 用户在权限树中选择要分配的权限
4. 用户点击保存，系统更新角色权限

### 7.3 角色用户管理流程

1. 用户点击"查看用户"按钮
2. 系统加载当前角色下的用户列表
3. 用户可执行添加/移除用户等操作
4. 系统更新角色-用户关系

## 8. 权限控制

角色管理模块的访问和操作受以下权限控制：

- 查看角色列表：`system:role:list`
- 查看角色详情：`system:role:query`
- 创建角色：`system:role:create`
- 更新角色：`system:role:update`
- 删除角色：`system:role:delete`
- 角色权限分配：`system:role:permission`

## 9. 注意事项与限制

1. 默认的系统管理员角色不允许删除或禁用
2. 删除角色前，系统会检查该角色是否有关联用户，如有则提示用户先解除关联
3. 角色标识(roleKey)全局唯一，且不允许修改
4. 数据权限范围影响用户可访问的数据范围，应谨慎设置

## 10. 未来扩展

1. 角色模板功能：预定义常用的角色模板，便于快速创建角色
2. 角色有效期设置：设置角色的时效性
3. 动态权限规则：基于表达式的更灵活的权限规则设置
4. 权限申请与审批流程：用户可申请权限，管理员审批

## 11. 参考

- 用户管理模块
- 菜单管理模块
- 权限管理模块
