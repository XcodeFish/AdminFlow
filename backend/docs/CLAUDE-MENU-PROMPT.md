# AdminFlow系统菜单功能开发提示词

## 项目背景

AdminFlow是一个基于NestJS和Vue的后台管理系统，当前需要根据菜单设计文档(`MENU-DESIGN.md`)实现完整的菜单管理功能，包括后端API、数据库设计和前端交互界面。

## 开发目标

请基于`MENU-DESIGN.md`文档设计，实现一个完整的菜单管理功能模块，满足后台系统的菜单管理、权限控制和动态路由生成需求。

## 开发任务

### 1. 后端数据库和实体开发

1. 创建`MenuEntity`实体类，确保包含文档中定义的所有字段
2. 设置与`RoleEntity`的多对多关系，处理菜单与角色的权限映射
3. 实现菜单的树形结构关系(父子层级)

示例代码结构:

```typescript
@Entity('sys_menu')
export class MenuEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, comment: '菜单名称' })
  menuName: string;

  // ... 其他字段按照文档定义

  // 父菜单关系
  @ManyToOne(() => MenuEntity, menu => menu.children)
  @JoinColumn({ name: 'parent_id' })
  parent: MenuEntity;

  // 子菜单关系
  @OneToMany(() => MenuEntity, menu => menu.parent)
  children: MenuEntity[];

  // 角色关联
  @ManyToMany(() => RoleEntity, role => role.menus)
  roles: RoleEntity[];
}
```

### 2. 后端服务层开发

1. 创建`MenuService`服务，实现菜单的CRUD操作
2. 实现基于用户ID获取菜单权限的方法
3. 实现构建前端路由格式的转换方法
4. 实现提取权限标识列表的方法

关键功能点:

```typescript
@Injectable()
export class MenuService {
  // 获取指定用户的菜单权限
  async getMenusByUserId(userId: string): Promise<any>;

  // 构建前端路由所需数据结构
  buildRoutes(menus: MenuEntity[]): any[];

  // 获取树形菜单列表
  async getMenuTree(params?: MenuQueryDto): Promise<MenuEntity[]>;

  // 创建菜单
  async createMenu(createMenuDto: CreateMenuDto): Promise<MenuEntity>;

  // 更新菜单
  async updateMenu(id: string, updateMenuDto: UpdateMenuDto): Promise<MenuEntity>;

  // 删除菜单
  async deleteMenu(id: string): Promise<void>;

  // 为角色分配菜单权限
  async assignMenusToRole(roleId: string, menuIds: string[]): Promise<void>;
}
```

### 3. 后端控制器开发

1. 创建`MenuController`，实现接口处理
2. 确保实现文档中的所有5个菜单管理接口和角色菜单分配接口
3. 添加合适的权限控制和参数验证

接口清单:

```typescript
@Controller('system/menu')
export class MenuController {
  // 获取菜单列表
  @Get('list')
  async getMenuList(@Query() query: MenuQueryDto): Promise<ApiResult<MenuEntity[]>>;

  // 获取菜单详情
  @Get(':id')
  async getMenu(@Param('id') id: string): Promise<ApiResult<MenuEntity>>;

  // 创建菜单
  @Post()
  async createMenu(@Body() createMenuDto: CreateMenuDto): Promise<ApiResult<MenuEntity>>;

  // 更新菜单
  @Put(':id')
  async updateMenu(
    @Param('id') id: string,
    @Body() updateMenuDto: UpdateMenuDto
  ): Promise<ApiResult<MenuEntity>>;

  // 删除菜单
  @Delete(':id')
  async deleteMenu(@Param('id') id: string): Promise<ApiResult<void>>;

  // 获取当前用户菜单
  @Get('user')
  async getUserMenus(@CurrentUser() user: any): Promise<ApiResult<any>>;
}

// 角色菜单分配接口
@Controller('system/role')
export class RoleController {
  @Put(':roleId/menus')
  async assignMenus(
    @Param('roleId') roleId: string,
    @Body() assignMenuDto: AssignMenuDto
  ): Promise<ApiResult<void>>;
}
```

### 4. 前端组件开发

1. 创建菜单管理界面，实现树形结构展示和操作
2. 创建菜单表单组件，根据菜单类型动态调整显示字段
3. 实现菜单拖拽排序功能
4. 角色管理页面中集成菜单权限分配功能

关键组件:

- 菜单管理页(MenuList.vue)
- 菜单编辑表单(MenuForm.vue)
- 菜单树形选择器(MenuTreeSelect.vue)
- 角色菜单分配组件(RoleMenuAssign.vue)

### 5. 前端状态管理

1. 实现菜单权限和路由集成，如文档中的permission.ts设计
2. 集成动态路由生成机制
3. 处理用户菜单和权限的获取与缓存

## 开发规范与要求

1. 所有代码必须使用TypeScript编写，提供完整的类型定义
2. 后端代码遵循NestJS最佳实践，包括依赖注入、模块化和装饰器使用
3. 前端组件使用Vue3的Composition API和TypeScript
4. 接口规范按照RESTful设计原则实现
5. 确保菜单与RBAC权限体系进行紧密集成
6. 实现本地和国际化支持
7. 代码必须有适当的错误处理和日志记录

## 注意事项

1. 菜单权限控制采用基于RBAC的模型，菜单权限与角色关联
2. 菜单分为目录(M)、菜单(C)和按钮(F)三种类型，各有不同的字段要求
3. 前端路由生成需要处理路由懒加载，提高应用性能
4. 需要考虑大量菜单数据时的性能优化
5. 确保移动端适配，遵循响应式设计原则

## 参考文档

- 详细菜单设计文档: `MENU-DESIGN.md`
- 系统权限设计文档: `PERMISSION.md`
- 架构设计文档: `ARCHITECTURE.md`

## 示例数据

提供一些基础的菜单数据以供测试:

```json
[
  {
    "menuName": "系统管理",
    "parentId": null,
    "orderNum": 1,
    "path": "/system",
    "component": null,
    "menuType": "M",
    "isVisible": 1,
    "perms": "system:view",
    "icon": "Setting",
    "children": [
      {
        "menuName": "用户管理",
        "parentId": "[系统管理ID]",
        "orderNum": 1,
        "path": "user",
        "component": "system/user/index",
        "menuType": "C",
        "isVisible": 1,
        "perms": "system:user:list",
        "icon": "User",
        "children": [
          {
            "menuName": "用户查询",
            "parentId": "[用户管理ID]",
            "orderNum": 1,
            "perms": "system:user:query",
            "menuType": "F"
          },
          {
            "menuName": "用户新增",
            "parentId": "[用户管理ID]",
            "orderNum": 2,
            "perms": "system:user:create",
            "menuType": "F"
          }
        ]
      },
      {
        "menuName": "菜单管理",
        "parentId": "[系统管理ID]",
        "orderNum": 2,
        "path": "menu",
        "component": "system/menu/index",
        "menuType": "C",
        "isVisible": 1,
        "perms": "system:menu:list",
        "icon": "Menu"
      }
    ]
  }
]
```

请遵循以上指南，实现AdminFlow系统的菜单管理功能。具体实现应该与`MENU-DESIGN.md`文档保持一致，同时注意与系统的其他模块良好集成。
