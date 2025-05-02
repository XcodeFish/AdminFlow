# AdminFlow 系统菜单开发指南

## 一、系统菜单概述

AdminFlow系统采用基于RBAC（基于角色的访问控制）的菜单权限管理机制，实现了前后端分离架构下的动态菜单渲染和权限控制。

### 1.1 设计目标

- 实现多级菜单的动态加载与权限控制
- 支持菜单与权限的精细化管理
- 提供灵活的前端路由生成机制
- 保持前后端数据结构的一致性

### 1.2 核心功能

- **多级菜单**：支持无限层级的菜单结构
- **动态路由**：基于后端数据动态生成前端路由
- **权限控制**：菜单与按钮级别的权限管理
- **缓存机制**：支持页面组件缓存

## 二、菜单数据结构

### 2.1 后端菜单实体结构

后端`MenuEntity`包含以下关键字段：

| 字段名 | 类型 | 说明 |
| ------ | ---- | ---- |
| id | string | 菜单ID |
| menuName | string | 菜单名称 |
| parentId | string | 父菜单ID |
| orderNum | number | 显示顺序 |
| path | string | 路由地址 |
| component | string | 组件路径 |
| query | string | 路由参数 |
| isExternal | number | 是否外链(0否 1是) |
| isCache | number | 是否缓存(0不缓存 1缓存) |
| menuType | string | 菜单类型(M目录 C菜单 F按钮) |
| isVisible | number | 是否显示(0隐藏 1显示) |
| status | number | 状态(0禁用 1正常) |
| perms | string | 权限标识 |
| icon | string | 菜单图标 |

### 2.2 前端路由结构

前端路由对象结构：

```typescript
interface RouteItem {
  path: string;                 // 路由路径
  name?: string;                // 路由名称
  component?: any;              // 组件
  redirect?: string;            // 重定向
  meta?: {
    title: string;              // 菜单标题
    icon?: string;              // 菜单图标
    hidden?: boolean;           // 是否在菜单中隐藏
    requiresAuth?: boolean;     // 是否需要认证
    keepAlive?: boolean;        // 是否缓存组件
    activeMenu?: string;        // 激活的菜单项
    permission?: string | string[]; // 权限标识
  };
  children?: RouteItem[];       // 子路由/子菜单
}
```

## 三、菜单数据流转

### 3.1 前后端交互流程

1. **用户登录**：用户登录成功后获取Token
2. **获取菜单数据**：前端调用`getUserMenus`API获取当前用户可访问的菜单
3. **处理菜单数据**：将后端返回的菜单数据转换为前端路由格式
4. **注册动态路由**：将处理后的路由配置添加到Vue Router中
5. **渲染菜单界面**：根据路由配置渲染左侧菜单栏

### 3.2 关键API接口

系统已实现以下菜单相关的API：

```typescript
// 获取当前用户菜单
export function getUserMenus() {
  return request.get<UserMenuInfo[]>('/v1/system/menu/user');
}

// 获取菜单树结构（管理用）
export function getMenuTree() {
  return request.get<MenuTreeNode[]>('/v1/system/menu/tree');
}

// 创建菜单
export function createMenu(data: CreateMenuDTO) {
  return request.post('/v1/system/menu', data);
}

// 更新菜单
export function updateMenu(id: string, data: UpdateMenuDTO) {
  return request.patch(`/v1/system/menu/${id}`, data);
}

// 删除菜单
export function deleteMenu(id: string) {
  return request.delete(`/v1/system/menu/${id}`);
}

// 获取角色菜单ID列表
export function getRoleMenuIds(roleId: string) {
  return request.get<string[]>(`/v1/system/menu/role/${roleId}`);
}

// 分配角色菜单
export function assignRoleMenus(data: AssignRoleMenusDTO) {
  return request.post('/v1/system/menu/role/assign', data);
}
```

## 四、动态路由实现

### 4.1 动态路由生成流程

1. **定义基础路由**：系统中定义了静态路由（如登录页）和动态路由骨架
2. **权限请求**：用户登录后，通过`getUserMenus`获取后端菜单数据
3. **路由转换**：通过`transformMenuToRoutes`方法将菜单数据转换为路由对象
4. **路由注册**：使用`router.addRoute`方法动态注册路由
5. **路由守卫**：在全局路由守卫中处理权限控制逻辑

### 4.2 核心代码实现

```typescript
// permission.ts
import { defineStore } from 'pinia';
import { getUserMenus } from '@/api/menu';
import { asyncRoutes, constantRoutes } from '@/router/routes';
import type { RouteRecordRaw } from 'vue-router';
import router from '@/router';

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    routes: [] as RouteRecordRaw[],
    dynamicRoutes: [] as RouteRecordRaw[]
  }),

  actions: {
    setRoutes(routes: RouteRecordRaw[]) {
      this.dynamicRoutes = routes;
      this.routes = constantRoutes.concat(routes);
    },

    // 加载当前用户菜单权限
    async loadPermissions() {
      try {
        // 从后端获取菜单数据
        const response = await getUserMenus();
        const userMenus = response.data;

        // 将后端返回的菜单转换为前端路由格式
        const routes = this.transformMenuToRoutes(userMenus);

        // 设置到store中
        this.setRoutes(routes);

        // 动态添加路由
        routes.forEach(route => {
          router.addRoute(route);
        });

        return routes;
      } catch (error) {
        console.error('加载菜单失败', error);
        return [];
      }
    },

    // 菜单数据转换为路由对象
    transformMenuToRoutes(menus) {
      const routes = [];

      menus.forEach(menu => {
        // 过滤按钮类型菜单
        if (menu.menuType === 'F') return;

        // 构建路由对象
        const route: any = {
          path: menu.path || '',
          name: this.generateRouteName(menu),
          meta: {
            title: menu.menuName,
            icon: menu.icon,
            keepAlive: menu.isCache === 1,
            hidden: menu.isVisible === 0,
            permissions: menu.perms ? [menu.perms] : []
          }
        };

        // 处理外链
        if (menu.isExternal === 1) {
          route.meta.link = menu.path;
          route.component = () => import('@/layout/components/Link.vue');
        }
        // 处理组件路径
        else if (menu.component) {
          // 处理布局组件
          if (menu.component === 'Layout') {
            route.component = () => import('@/layout/index.vue');
          } else {
            // 动态导入组件
            route.component = loadComponent(menu.component);
          }
        }

        // 处理嵌套路由
        if (menu.children && menu.children.length > 0) {
          route.children = this.transformMenuToRoutes(menu.children);

          // 目录类型设置重定向
          if (menu.menuType === 'M' && route.children.length > 0) {
            route.redirect = route.children[0].path;
            route.meta.alwaysShow = true;
          }
        }

        routes.push(route);
      });

      return routes;
    },

    // 生成路由名称
    generateRouteName(menu) {
      return menu.path
        ? menu.path.split('/').filter(Boolean).map(s =>
            s.charAt(0).toUpperCase() + s.slice(1)
          ).join('')
        : `Menu${menu.id}`;
    }
  }
});

// 动态导入组件
function loadComponent(component: string) {
  return () => import(`@/views/${component}.vue`);
}
```

## 五、菜单管理实现

### 5.1 菜单管理页面

菜单管理页面应该实现以下功能：

1. **菜单树展示**：以树形结构展示所有菜单
2. **新增菜单**：支持添加目录、菜单、按钮三种类型
3. **编辑菜单**：修改菜单属性
4. **删除菜单**：删除菜单及其子菜单
5. **排序功能**：调整菜单显示顺序

### 5.2 菜单表单设计

根据不同菜单类型显示不同的表单字段：

1. **目录类型（M）**：
   - 菜单名称、上级菜单、显示顺序
   - 路由地址、图标、状态等

2. **菜单类型（C）**：
   - 菜单名称、上级菜单、显示顺序
   - 路由地址、组件路径、权限标识
   - 是否外链、是否缓存、是否显示等

3. **按钮类型（F）**：
   - 按钮名称、上级菜单、显示顺序
   - 权限标识、状态等

## 六、最佳实践与注意事项

### 6.1 菜单设计建议

1. **层级控制**：建议控制在3层以内，避免导航复杂化
2. **命名规范**：
   - 路由路径使用全小写，单词间用连字符（如`system-config`）
   - 组件路径使用目录结构（如`system/user/index`）
   - 权限标识使用`模块:资源:操作`格式（如`system:user:list`）

3. **组件规范**：
   - 页面组件统一放在`views`目录下
   - 组件路径应与菜单层级保持一致
   - 使用懒加载减小初始加载体积

### 6.2 性能优化

1. **路由懒加载**：使用动态import导入组件
2. **组件缓存**：合理设置`isCache`属性启用组件缓存
3. **菜单数据缓存**：可在localStorage中缓存菜单数据，减少请求

### 6.3 常见问题

1. **路由无法匹配**：
   - 检查路由路径格式是否正确
   - 确认组件路径是否存在
   - 验证权限是否配置正确

2. **菜单不显示**：
   - 检查`isVisible`字段是否为`1`
   - 确认菜单状态`status`是否为`1`
   - 验证用户是否有权限访问该菜单

3. **页面缓存问题**：
   - 确保路由`name`属性与组件`name`一致
   - 正确配置`isCache`字段和`keepAlive`

## 七、进阶功能

### 7.1 国际化支持

可通过扩展菜单表增加`i18nKey`字段实现菜单国际化：

```typescript
// 菜单标题国际化处理
const getMenuTitle = (menu: RouteItem) => {
  if (!menu.meta?.title) return '';
  return menu.meta.i18nKey ? t(menu.meta.i18nKey) : menu.meta.title;
};
```

### 7.2 个性化定制

可实现用户个性化菜单定制功能：

1. **菜单收藏**：允许用户收藏常用菜单
2. **菜单排序**：允许用户调整菜单显示顺序
3. **快捷菜单**：在首页展示用户最常用的功能入口

### 7.3 移动端适配

针对移动端的菜单设计建议：

1. **响应式设计**：小屏设备自动折叠侧边菜单
2. **简化菜单**：移动端考虑使用精简版菜单
3. **手势支持**：添加滑动手势展开/收起菜单
