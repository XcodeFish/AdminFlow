# AdminFlow

<p align="center">
  <strong>一款功能强大的后台管理系统解决方案</strong>
</p>

<p align="center">简洁有力，体现管理流程的顺畅性</p>

## 📋 项目概述

AdminFlow 是一个现代化的后台管理系统框架，采用前后端分离架构，提供丰富的企业级管理功能和灵活的代码生成器。项目旨在帮助开发者快速构建高质量的企业级管理系统，大幅提升开发效率。

### ✨ 核心特性

- 🔐 **完善的权限管理**：基于RBAC模型的用户、角色、权限和部门管理
- 🛠️ **强大的代码生成器**：通过可视化界面一键生成前后端代码，大幅提升开发效率
- 📊 **丰富的数据可视化**：集成ECharts提供多种图表展示能力
- 🌈 **美观的UI设计**：基于Element Plus的现代化界面设计
- 🔄 **版本管理与追踪**：完整的代码版本管理，支持回滚
- 🔌 **灵活的数据源连接**：支持多种数据库连接与管理
- 📝 **任务管理系统**：内置Todo功能，协助任务管理
- 📱 **响应式设计**：完美适配各种屏幕尺寸

## 🔧 技术栈

### 前端

- **框架**: Vue 3 + TypeScript
- **UI库**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router
- **HTTP客户端**: Axios
- **打包工具**: Vite
- **图表库**: ECharts
- **代码编辑器**: Monaco Editor

### 后端

- **框架**: NestJS
- **ORM**: TypeORM
- **数据库**: MySQL / PostgreSQL
- **API文档**: Swagger
- **身份认证**: JWT + Passport
- **日志**: Winston
- **缓存**: Redis
- **任务调度**: @nestjs/schedule

## 🚀 快速开始

### 系统要求

- Node.js 18+
- MySQL 8.0+ 或 PostgreSQL 14+
- Redis 6+

### 安装

1. 克隆仓库

```bash
git clone https://github.com/your-organization/admin-flow.git
cd admin-flow
```

2. 安装后端依赖

```bash
cd backend
npm install
```

3. 配置后端环境

   复制`.env.example`文件并重命名为`.env`，然后根据您的环境修改配置：

```bash
cp .env.example .env
# 编辑.env文件配置数据库连接
```

4. 初始化数据库

```bash
npm run migration:run
npm run seed:init
```

5. 安装前端依赖

```bash
cd ../frontend
npm install
```

### 启动开发环境

1. 启动后端服务

```bash
cd backend
npm run start:dev
```

2. 启动前端服务

```bash
cd frontend
npm run dev
```

3. 访问系统

   打开浏览器访问: <http://localhost:3000>

   默认管理员账号:
   - 用户名: admin
   - 密码: Admin123

## 💡 核心功能使用指南

### 代码生成器

AdminFlow的代码生成器是系统核心功能，通过可视化配置快速生成CRUD模块。

#### 使用流程

1. **配置数据源**
   - 进入`系统管理 > 代码生成 > 数据源管理`
   - 点击`新建数据源`配置数据库连接信息
   - 测试连接成功后保存

2. **选择数据表**
   - 进入`系统管理 > 代码生成 > 表管理`
   - 选择之前创建的数据源，浏览可用的表
   - 查看表结构详情

3. **创建生成配置**
   - 进入`系统管理 > 代码生成 > 配置管理`
   - 点击`新建配置`，选择数据源和表
   - 配置生成选项，包括模块名称、路径等

4. **使用向导配置**
   - 进入`系统管理 > 代码生成 > 生成向导`
   - 跟随步骤进行配置：
     1. 基本信息配置
     2. 字段属性配置
     3. 页面功能配置
     4. 高级选项配置
     5. 预览确认

5. **预览与生成**
   - 进入`系统管理 > 代码生成 > 代码预览`
   - 查看生成的代码结构和内容
   - 选择`下载`或`部署`操作

6. **版本管理**
   - 进入`系统管理 > 代码生成 > 版本管理`
   - 查看历史版本记录，可进行回滚操作

### 用户和权限管理

1. **用户管理**
   - 创建、编辑、删除用户
   - 重置密码、禁用账号

2. **角色管理**
   - 创建角色并分配权限
   - 设置数据权限范围

3. **菜单管理**
   - 配置系统菜单结构
   - 设置菜单权限

4. **部门管理**
   - 管理组织机构树形结构
   - 分配部门管理权限

### 系统监控

1. **操作日志**
   - 查看用户操作记录
   - 支持多条件筛选

2. **系统日志**
   - 查看系统运行日志
   - 错误定位与追踪

## 📦 项目结构

### 前端目录结构

```
frontend/
├── public/              # 静态资源
├── src/
│   ├── api/             # API接口定义
│   ├── assets/          # 静态资源
│   ├── components/      # 公共组件
│   ├── composables/     # 组合式API
│   ├── hooks/           # 自定义钩子
│   ├── layout/          # 布局组件
│   ├── router/          # 路由配置
│   ├── store/           # Pinia状态管理
│   ├── styles/          # 全局样式
│   ├── types/           # TypeScript类型定义
│   ├── utils/           # 工具函数
│   ├── views/           # 页面视图
│   │   ├── dashboard/   # 仪表盘
│   │   ├── generator/   # 代码生成器
│   │   ├── login/       # 登录页
│   │   └── system/      # 系统管理
│   ├── App.vue          # 根组件
│   └── main.ts          # 入口文件
├── index.html           # HTML模板
└── vite.config.ts       # Vite配置
```

### 后端目录结构

```
backend/
├── dist/                # 编译输出
├── docs/                # 文档
├── scripts/             # 脚本工具
├── sql/                 # SQL文件
├── src/
│   ├── common/          # 公共代码
│   ├── configs/         # 配置文件
│   ├── core/            # 核心模块
│   ├── database/        # 数据库相关
│   ├── generator/       # 代码生成器
│   │   ├── config/      # 生成器配置
│   │   ├── datasource/  # 数据源管理
│   │   ├── generate/    # 代码生成
│   │   ├── template/    # 代码模板
│   │   └── version/     # 版本管理
│   ├── logger/          # 日志模块
│   ├── modules/         # 功能模块
│   │   ├── auth/        # 认证模块
│   │   ├── dept/        # 部门模块
│   │   ├── menu/        # 菜单模块
│   │   ├── permission/  # 权限模块
│   │   ├── user/        # 用户模块
│   │   └── tool/        # 工具模块
│   ├── types/           # 类型定义
│   ├── app.module.ts    # 应用模块
│   └── main.ts          # 入口文件
├── templates/           # 邮件等模板
└── tsconfig.json        # TypeScript配置
```

## 🧩 代码生成器模板

AdminFlow提供多种代码生成模板，满足不同业务场景需求：

1. **标准CRUD模板**: 标准的增删改查页面
2. **树形结构模板**: 适用于部门、菜单等树形数据
3. **主从表模板**: 适用于订单-订单项等主从结构
4. **图表分析模板**: 包含数据可视化展示
5. **高级表单模板**: 包含复杂表单和工作流

## 🔍 高级功能

### 自定义模板

您可以通过以下步骤自定义代码生成模板：

1. 在`backend/src/generator/template`目录下创建新模板
2. 使用Handlebars语法编写模板代码
3. 在模板配置中注册新模板
4. 在生成配置中选择该模板

### API调用

AdminFlow提供完整的API接口，可以通过API进行所有操作：

```
# Swagger API文档
http://localhost:7080/api/docs
```

## 🤝 贡献指南

我们欢迎所有形式的贡献，无论是提交bug、功能建议还是代码贡献。请遵循以下步骤：

1. Fork本仓库
2. 创建新的分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

## 📜 许可证

本项目采用MIT许可证 - 详见 [LICENSE](LICENSE) 文件

## 📧 联系方式

项目维护者: 管理员团队 - <admin@adminflow.com>

---

**AdminFlow** - 让管理系统开发更简单高效
