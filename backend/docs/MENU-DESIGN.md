# AdminFlow系统菜单设计文档

## 一、菜单设计概述

### 1.1 设计目标

- 构建层级化、支持动态权限的菜单管理系统
- 实现菜单与权限的紧密集成
- 提供友好的后台管理界面与灵活的前端渲染

### 1.2 核心功能

- **多级菜单结构**：支持无限级菜单层级
- **权限控制**：基于RBAC模型的菜单访问控制
- **动态渲染**：根据用户权限动态生成前端菜单
- **外链支持**：支持内部路由和外部链接
- **状态管理**：菜单的启用/禁用管理

## 二、数据结构设计

### 2.1 菜单表设计

```sql
CREATE TABLE sys_menu (
  id UUID PRIMARY KEY,
  menu_name VARCHAR(50) NOT NULL COMMENT '菜单名称',
  parent_id UUID COMMENT '父菜单ID',
  order_num INT DEFAULT 0 COMMENT '显示顺序',
  path VARCHAR(200) COMMENT '路由地址',
  component VARCHAR(255) COMMENT '组件路径',
  query VARCHAR(255) COMMENT '路由参数',
  is_external SMALLINT DEFAULT 0 COMMENT '是否外链(0否 1是)',
  is_cache SMALLINT DEFAULT 0 COMMENT '是否缓存(0不缓存 1缓存)',
  menu_type CHAR(1) COMMENT '菜单类型(M目录 C菜单 F按钮)',
  is_visible SMALLINT DEFAULT 1 COMMENT '是否显示(0隐藏 1显示)',
  status SMALLINT DEFAULT 1 COMMENT '状态(0禁用 1正常)',
  perms VARCHAR(100) COMMENT '权限标识',
  icon VARCHAR(100) COMMENT '菜单图标',
  created_by VARCHAR(64) COMMENT '创建者',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_by VARCHAR(64) COMMENT '更新者',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  remark VARCHAR(500) COMMENT '备注'
);
```

### 2.2 菜单实体设计（TypeScript）

```typescript
// 菜单实体
@Entity('sys_menu')
export class MenuEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 菜单名称
   */
  @Column({ length: 50, comment: '菜单名称' })
  menuName: string;

  /**
   * 父菜单ID
   */
  @Column({ type: 'uuid', nullable: true, comment: '父菜单ID' })
  parentId: string;

  /**
   * 显示顺序
   */
  @Column({ type: 'int', default: 0, comment: '显示顺序' })
  orderNum: number;

  /**
   * 路由地址
   */
  @Column({ length: 200, nullable: true, comment: '路由地址' })
  path: string;

  /**
   * 组件路径
   */
  @Column({ length: 255, nullable: true, comment: '组件路径' })
  component: string;

  /**
   * 路由参数
   */
  @Column({ length: 255, nullable: true, comment: '路由参数' })
  query: string;

  /**
   * 是否为外链
   * 0: 否
   * 1: 是
   */
  @Column({ type: 'smallint', default: 0, comment: '是否外链(0否 1是)' })
  isExternal: number;

  /**
   * 是否缓存
   * 0: 不缓存
   * 1: 缓存
   */
  @Column({ type: 'smallint', default: 0, comment: '是否缓存(0不缓存 1缓存)' })
  isCache: number;

  /**
   * 菜单类型
   * M: 目录
   * C: 菜单
   * F: 按钮
   */
  @Column({ type: 'char', length: 1, comment: '菜单类型(M目录 C菜单 F按钮)' })
  menuType: string;

  /**
   * 是否可见
   * 0: 隐藏
   * 1: 显示
   */
  @Column({ type: 'smallint', default: 1, comment: '是否显示(0隐藏 1显示)' })
  isVisible: number;

  /**
   * 菜单状态
   * 0: 禁用
   * 1: 正常
   */
  @Column({ type: 'smallint', default: 1, comment: '状态(0禁用 1正常)' })
  status: number;

  /**
   * 权限标识
   * 格式: 模块:操作
   * 如: system:user:list
   */
  @Column({ length: 100, nullable: true, comment: '权限标识' })
  perms: string;

  /**
   * 菜单图标
   */
  @Column({ length: 100, nullable: true, comment: '菜单图标' })
  icon: string;

  /**
   * 备注
   */
  @Column({ length: 500, nullable: true, comment: '备注' })
  remark: string;

  /**
   * 创建者
   */
  @Column({ length: 64, nullable: true, comment: '创建者' })
  createdBy: string;

  /**
   * 创建时间
   */
  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  /**
   * 更新者
   */
  @Column({ length: 64, nullable: true, comment: '更新者' })
  updatedBy: string;

  /**
   * 更新时间
   */
  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  // 父菜单关系
  @ManyToOne(() => MenuEntity, menu => menu.children)
  @JoinColumn({ name: 'parent_id' })
  parent: MenuEntity;

  // 子菜单关系
  @OneToMany(() => MenuEntity, menu => menu.parent)
  children: MenuEntity[];
}
```

### 2.3 前端菜单路由结构

```typescript
interface RouteItem {
  path: string;                 // 路由路径
  name?: string | symbol;       // 路由名称
  component?: any;              // 组件
  redirect?: string;            // 重定向
  meta?: {
    title?: string;             // 菜单标题
    icon?: string;              // 菜单图标
    hidden?: boolean;           // 是否在菜单中隐藏
    requiresAuth?: boolean;     // 是否需要认证
    keepAlive?: boolean;        // 是否缓存组件
    activeMenu?: string;        // 激活的菜单项
    permission?: string | string[]; // 权限标识
    [key: string]: any;
  };
  children?: RouteItem[];       // 子路由/子菜单
  [key: string]: any;
}
```

## 三、接口设计

### 3.1 菜单管理接口

#### 3.1.1 获取菜单列表

```
GET /api/v1/system/menu/list
```

**请求参数：**

- menuName (string, optional): 菜单名称
- status (number, optional): 状态(0禁用 1正常)

**响应：**

```json
{
  "code": 200,
  "data": [
    {
      "id": "e4b0afc1-4354-4ca5-81af-c14354ca5b95",
      "menuName": "系统管理",
      "parentId": null,
      "orderNum": 1,
      "path": "/system",
      "component": null,
      "query": null,
      "isExternal": 0,
      "isCache": 0,
      "menuType": "M",
      "isVisible": 1,
      "status": 1,
      "perms": "system:view",
      "icon": "Setting",
      "children": [
        {
          "id": "92b57513-5fb5-4eb9-b57f-135fb57eb942",
          "menuName": "用户管理",
          "parentId": "e4b0afc1-4354-4ca5-81af-c14354ca5b95",
          "orderNum": 1,
          "path": "user",
          "component": "system/user/index",
          "isExternal": 0,
          "isCache": 1,
          "menuType": "C",
          "isVisible": 1,
          "status": 1,
          "perms": "system:user:list",
          "icon": "User",
          "children": []
        }
      ]
    }
  ],
  "message": "操作成功"
}
```

#### 3.1.2 获取菜单详情

```
GET /api/v1/system/menu/:id
```

**响应：**

```json
{
  "code": 200,
  "data": {
    "id": "92b57513-5fb5-4eb9-b57f-135fb57eb942",
    "menuName": "用户管理",
    "parentId": "e4b0afc1-4354-4ca5-81af-c14354ca5b95",
    "orderNum": 1,
    "path": "user",
    "component": "system/user/index",
    "query": null,
    "isExternal": 0,
    "isCache": 1,
    "menuType": "C",
    "isVisible": 1,
    "status": 1,
    "perms": "system:user:list",
    "icon": "User",
    "remark": "用户管理菜单"
  },
  "message": "操作成功"
}
```

#### 3.1.3 创建菜单

```
POST /api/v1/system/menu
```

**请求体：**

```json
{
  "menuName": "用户管理",
  "parentId": "e4b0afc1-4354-4ca5-81af-c14354ca5b95",
  "orderNum": 1,
  "path": "user",
  "component": "system/user/index",
  "isExternal": 0,
  "isCache": 1,
  "menuType": "C",
  "isVisible": 1,
  "status": 1,
  "perms": "system:user:list",
  "icon": "User",
  "remark": "用户管理菜单"
}
```

#### 3.1.4 更新菜单

```
PUT /api/v1/system/menu/:id
```

**请求体：**

```json
{
  "menuName": "用户管理",
  "orderNum": 2,
  "isVisible": 1,
  "status": 1,
  "icon": "UserFilled"
}
```

#### 3.1.5 删除菜单

```
DELETE /api/v1/system/menu/:id
```

### 3.2 角色菜单分配接口

```
PUT /api/v1/system/role/:roleId/menus
```

**请求体：**

```json
{
  "menuIds": [
    "e4b0afc1-4354-4ca5-81af-c14354ca5b95",
    "92b57513-5fb5-4eb9-b57f-135fb57eb942"
  ]
}
```

### 3.3 获取当前用户菜单接口

```
GET /api/v1/system/menu/user
```

**响应：**

```json
{
  "code": 200,
  "data": {
    "menus": [
      {
        "name": "System",
        "path": "/system",
        "hidden": false,
        "redirect": "/system/user",
        "component": "Layout",
        "alwaysShow": true,
        "meta": {
          "title": "系统管理",
          "icon": "Setting",
          "noCache": false
        },
        "children": [
          {
            "name": "User",
            "path": "user",
            "hidden": false,
            "component": "system/user/index",
            "meta": {
              "title": "用户管理",
              "icon": "User",
              "noCache": false
            }
          }
        ]
      }
    ],
    "permissions": ["system:view", "system:user:list", "system:user:query"]
  },
  "message": "操作成功"
}
```

## 四、菜单权限与路由集成实现

### 4.1 后端菜单权限逻辑

```typescript
@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(MenuEntity)
    private readonly menuRepository: Repository<MenuEntity>,
    @InjectRepository(RoleMenuEntity)
    private readonly roleMenuRepository: Repository<RoleMenuEntity>,
  ) {}

  /**
   * 根据用户ID获取菜单权限
   */
  async getMenusByUserId(userId: string): Promise<any> {
    // 查询用户拥有的角色
    const roles = await this.getUserRoles(userId);

    // 如果用户是管理员，直接返回所有菜单
    if (roles.some(role => role.roleKey === 'admin')) {
      return this.getAllMenus();
    }

    // 根据角色ID获取菜单ID列表
    const menuIds = await this.getMenuIdsByRoles(roles.map(role => role.id));

    // 根据菜单ID获取菜单树结构
    return this.getMenuTreeByIds(menuIds);
  }

  /**
   * 构建前端路由所需数据结构
   */
  buildRoutes(menus: MenuEntity[]): any[] {
    // 将菜单转换成前端路由格式
    return menus.map(menu => {
      const route: any = {
        name: this.formatComponentName(menu.menuName),
        path: menu.path,
        hidden: menu.isVisible === 0,
        component: this.loadComponent(menu),
        meta: {
          title: menu.menuName,
          icon: menu.icon,
          noCache: menu.isCache === 0
        }
      };

      // 处理目录类型
      if (menu.menuType === 'M') {
        route.alwaysShow = true;
        route.redirect = 'noRedirect';
      }

      // 处理外链
      if (menu.isExternal === 1) {
        route.meta.link = menu.path;
      }

      // 处理子菜单
      if (menu.children && menu.children.length > 0) {
        route.children = this.buildRoutes(menu.children);
      }

      return route;
    });
  }

  /**
   * 获取用户权限列表
   */
  async getPermissionsByUserId(userId: string): Promise<string[]> {
    const menus = await this.getMenusByUserId(userId);
    return this.extractPermissions(menus);
  }

  /**
   * 从菜单中提取权限标识
   */
  private extractPermissions(menus: MenuEntity[]): string[] {
    const permissions: string[] = [];

    const extract = (items: MenuEntity[]) => {
      items.forEach(item => {
        if (item.perms) {
          permissions.push(item.perms);
        }
        if (item.children && item.children.length > 0) {
          extract(item.children);
        }
      });
    };

    extract(menus);
    return [...new Set(permissions)]; // 去重
  }
}
```

### 4.2 前端动态路由生成实现

```typescript
// store/modules/permission.ts

import { defineStore } from 'pinia'
import { asyncRoutes, constantRoutes } from '@/router/routes'
import type { RouteRecordRaw } from 'vue-router'
import { getRouters } from '@/api/menu'

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    routes: [] as RouteRecordRaw[],
    dynamicRoutes: [] as RouteRecordRaw[]
  }),

  actions: {
    setRoutes(routes: RouteRecordRaw[]) {
      this.dynamicRoutes = routes
      this.routes = constantRoutes.concat(routes)
    },

    // 根据后端返回的菜单数据生成路由
    async generateRoutes() {
      try {
        // 从后端获取路由数据
        const response = await getRouters()
        const { menus } = response.data

        // 转换后端菜单为前端路由格式
        const accessedRoutes = this.filterAsyncRoutes(asyncRoutes, menus)

        this.setRoutes(accessedRoutes)
        return accessedRoutes
      } catch (error) {
        console.error('获取菜单异常', error)
        return []
      }
    },

    // 与本地路由匹配
    filterAsyncRoutes(routes: RouteRecordRaw[], menus: any[]): RouteRecordRaw[] {
      const res: RouteRecordRaw[] = []

      routes.forEach(route => {
        const tmp = { ...route }
        // 检查当前路由是否在后端返回的菜单中
        const hasPermission = menus.some(menu =>
          menu.path === tmp.path ||
          (menu.meta?.permission &&
           Array.isArray(tmp.meta?.permission) &&
           tmp.meta.permission.includes(menu.meta.permission))
        )

        if (hasPermission) {
          if (tmp.children) {
            tmp.children = this.filterAsyncRoutes(tmp.children, menus)
          }
          res.push(tmp)
        }
      })

      return res
    }
  }
})
```

## 五、菜单与权限管理界面设计

### 5.1 菜单管理界面

- **功能区域**：
  1. 树形菜单结构展示
  2. 菜单搜索功能
  3. 批量操作功能条
  4. 操作按钮区

- **UI布局**：
  1. 顶部：面包屑导航和操作按钮
  2. 内容区：带有拖拽排序功能的树形表格
  3. 右侧：增删改查操作栏

- **交互设计**：
  1. 菜单拖拽排序
  2. 菜单启用/禁用状态切换
  3. 菜单类型选择联动表单字段

### 5.2 菜单表单设计

菜单表单根据选择的菜单类型动态调整显示的字段：

1. **目录类型（M）显示字段**：
   - 菜单名称
   - 上级菜单
   - 显示排序
   - 路由地址
   - 菜单图标
   - 菜单状态

2. **菜单类型（C）显示字段**：
   - 菜单名称
   - 上级菜单
   - 显示排序
   - 路由地址
   - 组件路径
   - 权限标识
   - 菜单图标
   - 是否显示
   - 是否缓存
   - 菜单状态

3. **按钮类型（F）显示字段**：
   - 按钮名称
   - 上级菜单
   - 显示排序
   - 权限标识
   - 按钮状态

## 六、菜单功能最佳实践

### 6.1 菜单设计建议

1. **层级控制**：
   - 建议控制在3层以内，避免导航复杂化
   - 同一层级菜单项不超过8个

2. **命名规范**：
   - 菜单名称简洁明了，一般不超过6个字符
   - 权限标识遵循 `模块:资源:操作` 格式

3. **图标使用**：
   - 顶级菜单必须设置图标
   - 子菜单图标可选但建议保持一致性

### 6.2 性能优化

1. **懒加载**：
   - 对于大型应用，采用路由懒加载技术

2. **缓存策略**：
   - 根据isCache字段决定是否缓存组件
   - 常用菜单设置缓存，提高访问速度

3. **权限缓存**：
   - 用户菜单权限支持本地缓存，减少请求
   - 权限变更时主动清除缓存

### 6.3 菜单安全建议

1. **权限控制**：
   - 菜单访问权限与API权限同步控制
   - 前后端双重权限校验

2. **特殊菜单**：
   - 敏感操作菜单（如系统配置）应设置更高权限
   - 关键菜单操作应记录审计日志

## 七、菜单国际化支持

### 7.1 数据结构扩展

```sql
ALTER TABLE sys_menu ADD COLUMN i18n_key VARCHAR(100) COMMENT '国际化标识';
```

### 7.2 前端实现

```typescript
// 菜单标题国际化处理
const getMenuTitle = (menu: RouteItem) => {
  if (!menu.meta?.title) return '';

  const hasKey = menu.meta.i18nKey && t(menu.meta.i18nKey);
  if (hasKey) {
    return t(menu.meta.i18nKey);
  }

  return menu.meta.title;
};
```

## 八、菜单与移动端适配

### 8.1 响应式设计

1. **布局调整**：
   - 小屏幕设备自动折叠侧边菜单
   - 移动端显示汉堡菜单按钮

2. **交互优化**：
   - 移动端支持滑动手势展开/收起菜单
   - 优化触摸屏点击区域大小

### 8.2 移动端专属设计

1. **简化菜单**：
   - 移动端可配置精简版菜单
   - 隐藏部分复杂操作选项

2. **布局差异化**：
   - 移动端可使用底部导航栏替代侧边栏
   - 支持常用菜单快捷方式

## 九、菜单功能扩展方向

### 9.1 个性化定制

1. **用户收藏**：
   - 允许用户收藏常用菜单
   - 提供个人自定义菜单排序

2. **主题换肤**：
   - 菜单支持明暗主题切换
   - 可自定义菜单颜色方案

### 9.2 高级功能

1. **小部件集成**：
   - 菜单项支持集成消息通知数量
   - 支持动态徽标显示

2. **智能菜单**：
   - 基于用户使用频率动态调整菜单顺序
   - 支持基于AI推荐的常用菜单
