# 权限管理模块设计文档

## 1. 概述

权限管理模块是AdminFlow系统核心权限管理体系的重要组成部分，用于管理系统内所有权限的创建、查询、更新、删除等功能。本文档详细描述了权限管理模块的前端设计方案，包括页面结构、功能组件、接口交互等内容。

## 2. 功能需求

### 2.1 基础功能

- 权限列表：展示系统中所有权限
- 权限搜索：支持按权限名称、类型、状态等条件进行搜索
- 权限创建：创建新权限并设置基本信息
- 权限编辑：修改现有权限的基本信息
- 权限删除：删除单个或批量删除权限
- 权限状态切换：启用/禁用权限
- 权限树形展示：以树形结构展示权限的层级关系

### 2.2 高级功能

- 权限缓存管理：清除权限缓存
- 权限审计：记录权限变更的操作历史
- 权限分配预览：查看哪些角色拥有特定权限

## 3. 页面结构

### 3.1 权限管理主页面

```
/views/system/permission/index.vue
```

主页面采用与角色管理、菜单管理相一致的布局，包含以下区域：

1. 搜索区域：提供权限名称、类型、状态等搜索条件
2. 操作按钮区域：新增、批量删除等操作
3. 权限列表表格/树形表格：展示权限数据，支持分页、排序
4. 权限表单对话框：新增/编辑权限信息

## 4. 组件设计

### 4.1 主要组件

#### 4.1.1 PermissionForm.vue

权限表单组件，用于新增和编辑权限，包含以下字段：

- 权限名称 (permName)
- 权限标识 (permKey)
- 权限类型 (permType)
- 父权限 (parentId)
- 排序号 (orderNum)
- 路由地址 (path)
- 组件路径 (component)
- 状态 (status)
- 是否可见 (isVisible)
- 图标 (icon)

#### 4.1.2 PermissionTable.vue

权限列表表格组件，展示权限数据，支持以下操作：

- 多选
- 排序
- 编辑
- 删除

#### 4.1.3 PermissionTree.vue

权限树形组件，用于展示权限的层级关系。

### 4.2 业务逻辑钩子

根据角色管理的实现模式，权限管理模块采用以下hooks进行业务逻辑抽象：

#### 4.2.1 usePermissionTable.ts

管理权限表格相关的状态和方法：

```typescript
export default function usePermissionTable() {
  // 列表数据
  const permissionList = ref<Permission[]>([])
  const loading = ref(false)

  // 查询参数
  const searchParams = reactive<PermissionQueryParams>({
    permName: '',
    permType: undefined,
    status: undefined,
    page: 1,
    pageSize: 10
  })

  // 表格列配置
  const columns = computed(() => [
    { type: 'selection', width: 50, label: '' },
    { prop: 'permName', label: '权限名称', minWidth: 150 },
    { prop: 'permKey', label: '权限标识', minWidth: 150 },
    { prop: 'permType', label: '权限类型', width: 100, slot: 'permType' },
    { prop: 'orderNum', label: '排序', width: 80 },
    { prop: 'path', label: '路由地址', minWidth: 120 },
    { prop: 'status', label: '状态', width: 80, slot: 'status' },
    { prop: 'isVisible', label: '可见性', width: 80, slot: 'isVisible' },
    { prop: 'createdAt', label: '创建时间', minWidth: 180 },
    { prop: 'action', label: '操作', width: 250, slot: 'action' }
  ])

  // 获取权限列表
  const fetchPermissionList = async () => {
    loading.value = true
    try {
      const res = await getPermissionList(searchParams)
      if (res.code === 0) {
        permissionList.value = res.data
      }
    } catch (error) {
      console.error('获取权限列表失败', error)
    } finally {
      loading.value = false
    }
  }

  // 分页查询权限
  const fetchPermissionsByPage = async (page = 1, take = 10) => {
    loading.value = true
    try {
      const res = await getPermissionsByPage(page, take)
      if (res.code === 0) {
        return res.data
      }
      return null
    } catch (error) {
      console.error('分页查询权限失败', error)
      return null
    } finally {
      loading.value = false
    }
  }

  // 获取权限树
  const fetchPermissionTree = async () => {
    loading.value = true
    try {
      const res = await getPermissionTree()
      if (res.code === 0) {
        return res.data
      }
      return []
    } catch (error) {
      console.error('获取权限树失败', error)
      return []
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    permissionList,
    searchParams,
    columns,
    fetchPermissionList,
    fetchPermissionsByPage,
    fetchPermissionTree
  }
}
```

#### 4.2.2 usePermissionActions.ts

管理权限操作相关的方法：

```typescript
export default function usePermissionActions(loadPermissionList: () => Promise<void>) {
  // 添加初始化标记
  const isInitialized = ref(false)

  // 更改权限状态
  const handleStatusChange = async (row: Permission): Promise<void> => {
    try {
      const data: UpdatePermissionParams = {
        status: row.status === 1 ? 0 : 1
      }

      const res = await updatePermission(row.id, data)
      if (res.code === 0) {
        ElMessage.success(row.status === 1 ? '禁用成功' : '启用成功')
        await loadPermissionList()
      }
    } catch (error) {
      console.error('更改权限状态失败', error)
    }
  }

  // 删除权限
  const handleDelete = async (row: Permission): Promise<void> => {
    try {
      await ElMessageBox.confirm(`确认删除权限"${row.permName}"吗？`, '提示', {
        type: 'warning'
      })

      const res = await deletePermission(row.id)
      if (res.code === 0) {
        ElMessage.success('删除成功')
        await loadPermissionList()
      }
    } catch (error) {
      console.error('删除权限失败', error)
    }
  }

  // 批量删除
  const handleBatchDelete = async (selectedRows: Permission[]): Promise<void> => {
    if (selectedRows.length === 0) {
      ElMessage.warning('请选择要删除的权限')
      return
    }

    try {
      await ElMessageBox.confirm(`确认删除选中的${selectedRows.length}个权限吗？`, '提示', {
        type: 'warning'
      })

      const promises = selectedRows.map(row => deletePermission(row.id))
      await Promise.all(promises)
      ElMessage.success('批量删除成功')
      await loadPermissionList()
    } catch (error) {
      console.error('批量删除权限失败', error)
    }
  }

  // 清除权限缓存
  const handleClearCache = async (userId?: string): Promise<void> => {
    try {
      let res
      if (userId) {
        res = await clearUserPermissionCache(userId)
      } else {
        res = await clearAllPermissionCache()
      }

      if (res.code === 0) {
        ElMessage.success('缓存清除成功')
      }
    } catch (error) {
      console.error('清除权限缓存失败', error)
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
    handleClearCache,
    isInitialized
  }
}
```

## 5. 数据模型

### 5.1 权限实体

```typescript
// 权限基础信息
export interface Permission {
  id: string
  permName: string
  permKey: string
  permType: number // 0-菜单 1-操作 2-数据
  parentId?: string
  orderNum: number
  path?: string
  component?: string
  status: number // 0-禁用 1-正常
  isVisible: number // 0-隐藏 1-显示
  icon?: string
  createdAt?: Date
  updatedAt?: Date
  children?: Permission[]
}

// 创建权限参数
export interface CreatePermissionParams {
  permName: string
  permKey: string
  permType: number
  parentId?: string
  orderNum?: number
  path?: string
  component?: string
  status?: number
  isVisible?: number
  icon?: string
}

// 更新权限参数
export interface UpdatePermissionParams {
  permName?: string
  permKey?: string
  permType?: number
  parentId?: string
  orderNum?: number
  path?: string
  component?: string
  status?: number
  isVisible?: number
  icon?: string
}

// 权限查询参数
export interface PermissionQueryParams {
  permName?: string
  permType?: number
  status?: number
  page?: number
  pageSize?: number
}

// API响应类型
export interface PermissionResponse {
  code: number
  message: string
  data: Permission
}

export interface PermissionListResponse {
  code: number
  message: string
  data: Permission[]
}

export interface PermissionPageResponse {
  code: number
  message: string
  data: {
    items: Permission[]
    meta: {
      itemCount: number
      totalPages: number
      currentPage: number
    }
  }
}

export interface PermissionTreeResponse {
  code: number
  message: string
  data: Permission[]
}
```

## 6. API 接口

### 6.1 权限管理基础接口

根据后端实际API实现，权限管理模块使用以下接口：

```typescript
/**
 * 创建权限
 * @param data 权限数据
 */
export const createPermission = (data: CreatePermissionParams) => {
  return request.post<PermissionResponse>('/permission', data)
}

/**
 * 更新权限
 * @param id 权限ID
 * @param data 更新数据
 */
export const updatePermission = (id: string, data: UpdatePermissionParams) => {
  return request.put<PermissionResponse>(`/permission/${id}`, data)
}

/**
 * 删除权限
 * @param id 权限ID
 */
export const deletePermission = (id: string) => {
  return request.delete<{ code: number, message: string, data: null }>(`/permission/${id}`)
}

/**
 * 获取权限列表（带条件筛选）
 * @param params 筛选参数
 */
export const getPermissionList = (params?: PermissionQueryParams) => {
  return request.get<PermissionListResponse>('/permission/perms', params)
}

/**
 * 分页查询权限列表
 * @param page 页码
 * @param take 每页条数
 */
export const getPermissionsByPage = (page = 1, take = 10) => {
  return request.get<PermissionPageResponse>('/permission', { page, take })
}

/**
 * 获取权限详情
 * @param id 权限ID
 */
export const getPermissionById = (id: string) => {
  return request.get<PermissionResponse>(`/permission/${id}`)
}

/**
 * 获取权限树
 */
export const getPermissionTree = () => {
  return request.get<PermissionTreeResponse>('/permission/tree')
}
```

### 6.2 权限缓存和审计接口

```typescript
/**
 * 清除所有权限缓存（仅管理员使用）
 */
export const clearAllPermissionCache = () => {
  return request.delete<{ code: number, message: string, data: null }>('/permission/cache/all')
}

/**
 * 清除指定用户权限缓存
 * @param userId 用户ID
 */
export const clearUserPermissionCache = (userId: string) => {
  return request.delete<{ code: number, message: string, data: null }>(`/permission/cache/users/${userId}`)
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
  return request.get<AuditLogResponse>('/permission/audit-logs', params)
}

/**
 * 获取用户权限列表
 * @param userId 用户ID
 */
export const getUserPermissions = (userId: string) => {
  return request.get<PermissionListResponse>(`/permission/users/${userId}/permissions`)
}
```

## 7. 工作流程

### 7.1 权限管理主流程

1. 用户进入权限管理页面
2. 系统加载权限列表或权限树数据
3. 用户可执行搜索、新增、编辑、删除等操作
4. 对权限执行状态变更等操作时，系统实时更新权限状态

### 7.2 权限缓存管理流程

1. 用户点击"清除缓存"或"清除用户缓存"按钮
2. 系统弹出确认对话框
3. 用户确认后，系统执行缓存清除操作
4. 系统返回操作结果

## 8. 权限控制

权限管理模块的访问和操作受以下权限控制：

- 查看权限列表：`system:permission:list`
- 创建权限：`system:permission:create`
- 更新权限：`system:permission:update`
- 删除权限：`system:permission:delete`
- 清除权限缓存：`system:permission:cache`

## 9. 注意事项与限制

1. 系统核心权限不允许删除或禁用
2. 权限层级最多支持4级，防止过于复杂的权限管理
3. 删除权限前，系统会检查该权限是否已分配给角色，如有则提示用户先解除关联
4. 权限标识(permKey)全局唯一，且应符合特定格式（如 system:user:create）
5. 菜单类型权限(permType=0)应配置正确的路由地址和组件路径

## 10. 未来扩展

1. 权限使用分析：统计各权限的使用频率和分配情况
2. 批量权限导入：支持通过配置文件批量导入权限定义
3. 权限冲突检测：检测新增或修改的权限是否与现有权限存在冲突
4. 权限依赖关系：自动管理权限之间的依赖关系（例如操作权限依赖于菜单权限）
5. 动态权限表达式：支持更灵活的权限规则设定方式

## 11. 参考

- 角色管理模块
- 菜单管理模块
- 用户管理模块
