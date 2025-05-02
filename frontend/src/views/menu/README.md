# 动态路由与菜单加载实现说明

在 AdminFlow 前端系统中，动态路由和菜单是通过以下方式实现的：

## 1. 路由结构设计

系统中的路由分为两种类型：

- **静态路由（constantRoutes）**：所有用户都可以访问的路由，如登录页、404页面等
- **动态路由（asyncRoutes）**：需要根据用户权限动态添加的路由，如系统管理、用户管理等

## 2. 路由加载流程

1. **用户登录后获取权限信息**：
   - 在用户登录成功后，通过解析JWT获取用户的角色（roles）和权限（permissions）
   - 这些信息存储在 `userStore` 中

2. **路由权限守卫**：
   - 在 `router/permission.ts` 中的 `setupRouterGuard` 函数设置了全局路由守卫
   - 当用户访问页面时，会先检查认证状态，然后调用 `setupDynamicRoutes` 函数

3. **动态路由加载**：
   - `setupDynamicRoutes` 函数会调用 `permissionStore.loadPermissions()` 来加载权限并生成路由
   - 权限Store（`store/modules/permission.ts`）中的 `generateRoutes` 方法会根据用户权限过滤路由
   - 如果用户是管理员，直接获取所有路由；否则根据权限过滤

4. **路由注册**：
   - 筛选后的路由通过 `router.addRoute()` 方法动态添加到路由表中
   - 这样用户就只能访问有权限的页面

## 3. 菜单API的使用

目前系统中已经实现了菜单相关的API：

```typescript
// 获取当前用户菜单
export function getUserMenus() {
  return request.get<UserMenuInfo[]>('/v1/system/menu/user')
}

// 获取菜单树结构
export function getMenuTree() {
  return request.get<MenuTreeNode[]>('/v1/system/menu/tree')
}
```

但当前的实现中，前端路由配置是基于静态的 `asyncRoutes` 数组和用户权限进行过滤的，并没有直接使用 `getUserMenus` API。

## 4. 改进方向：从后端动态获取菜单

为了实现完全的动态菜单，可以修改 `permission.ts` 中的 `generateRoutes` 方法，使用 `getUserMenus` API 从后端获取菜单数据，然后转换为路由结构：

```typescript
// 伪代码示例
async generateRoutes() {
  try {
    // 从后端获取菜单数据
    const response = await getUserMenus()
    const userMenus = response.data

    // 将后端菜单转换为前端路由格式
    const accessedRoutes = this.transformMenuToRoutes(userMenus)
    this.setRoutes(accessedRoutes)
    return accessedRoutes
  } catch (error) {
    console.error('加载菜单失败', error)
    return []
  }
}

// 将菜单转换为路由
transformMenuToRoutes(menus) {
  // 实现菜单到路由的转换逻辑
  // ...
}
```

## 5. 菜单与路由的映射

菜单数据和路由对象的关系：

1. 菜单数据中的 `path` 对应路由的 `path`
2. 菜单的 `component` 需要被解析为实际的组件（可通过动态import实现）
3. 菜单的 `meta` 信息（如图标、标题等）对应路由的 `meta` 对象
4. 菜单的层级结构通过 `children` 属性映射到路由的嵌套结构

## 6. 实施建议

1. 修改 `permissionStore.loadPermissions()` 方法，调用 `getUserMenus()` API
2. 实现 `transformMenuToRoutes` 方法，将后端菜单数据转换为前端路由格式
3. 路由组件可通过约定的路径规则动态导入，如 `() => import(\`@/views/${menu.component}.vue\`)`
4. 确保基础路由（如仪表盘、登录页）始终可用
