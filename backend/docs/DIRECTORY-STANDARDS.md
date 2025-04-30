# 后端目录结构规范

## 一、目录规范设计原则

### 1.1 设计理念

1. **关注点分离**：清晰划分各功能模块与层次
2. **目录自解释**：通过目录结构反映系统架构
3. **一致性**：保持命名与结构的一致性
4. **渐进式**：支持从小到大的项目演进

### 1.2 命名规范

1. **文件夹命名**：全小写，多单词用连字符（-）连接
2. **文件命名**：
   - 类文件: 采用大驼峰命名（PascalCase）
   - 配置文件: 全小写，多单词用连字符（-）连接
   - 测试文件: 以`.spec.ts`或`.test.ts`结尾
3. **类命名**：大驼峰命名，并附加相应后缀（Controller/Service/Entity等）

## 二、标准目录结构

```plaintext
/backend/
├── src/                        # 源代码目录
│   ├── main.ts                 # 应用程序入口
│   ├── app.module.ts           # 根模块
│   ├── configs/                # 配置文件目录
│   │   ├── app.config.ts       # 应用配置
│   │   ├── database.config.ts  # 数据库配置
│   │   └── redis.config.ts     # Redis配置
│   │
│   ├── core/                   # 核心模块目录
│   │   ├── decorators/         # 自定义装饰器
│   │   ├── filters/            # 全局异常过滤器
│   │   ├── guards/             # 全局守卫
│   │   ├── interceptors/       # 全局拦截器
│   │   ├── middlewares/        # 全局中间件
│   │   └── utils/              # 工具函数
│   │
│   ├── common/                 # 通用模块目录
│   │   ├── dto/                # 通用DTO
│   │   ├── entities/           # 通用实体类
│   │   ├── enums/              # 枚举定义
│   │   ├── interfaces/         # 接口定义
│   │   └── constants/          # 常量定义
│   │
│   └── modules/                # 业务模块目录
│       ├── auth/               # 认证模块
│       │   ├── dto/            # 数据传输对象
│       │   ├── auth.controller.ts  # 控制器
│       │   ├── auth.service.ts     # 服务层
│       │   ├── auth.module.ts      # 模块定义
│       │   └── auth.spec.ts        # 单元测试
│       │
│       └── user/               # 用户模块
│           ├── dto/            # 数据传输对象
│           ├── entities/       # 实体定义
│           ├── user.controller.ts  # 控制器
│           ├── user.service.ts     # 服务层
│           └── user.module.ts      # 模块定义
│
├── test/                       # 测试目录
│   ├── e2e/                    # 端到端测试
│   └── integration/            # 集成测试
│
├── dist/                       # 编译输出目录
├── node_modules/               # 依赖包目录
├── docs/                       # 文档目录
├── scripts/                    # 脚本目录
├── .env                        # 环境变量
├── .env.development            # 开发环境变量
├── .env.production             # 生产环境变量
├── .eslintrc.js                # ESLint配置
├── .prettierrc                 # Prettier配置
├── nest-cli.json               # Nest CLI配置
├── package.json                # 项目依赖管理
├── tsconfig.json               # TypeScript配置
├── tsconfig.build.json         # TS构建配置
└── README.md                   # 项目说明文档
```

## 三、模块内部结构规范

### 3.1 标准模块结构

每个业务模块应包含以下组件：

```plaintext
/modules/example/
├── dto/                   # 数据传输对象
│   ├── create-example.dto.ts
│   ├── update-example.dto.ts
│   └── query-example.dto.ts
│
├── entities/              # 实体定义
│   └── example.entity.ts
│
├── example.controller.ts  # 控制器
├── example.service.ts     # 服务层
├── example.module.ts      # 模块定义
├── example.repository.ts  # 仓储层(可选)
└── example.spec.ts        # 单元测试
```

### 3.2 复杂模块结构

对于功能复杂的大型模块，可采用以下结构：

```plaintext
/modules/complex-module/
├── controllers/           # 控制器目录
│   ├── feature1.controller.ts
│   └── feature2.controller.ts
│
├── services/              # 服务层目录
│   ├── feature1.service.ts
│   └── feature2.service.ts
│
├── dto/                   # DTO目录
│   ├── feature1/
│   └── feature2/
│
├── entities/              # 实体目录
│   ├── entity1.entity.ts
│   └── entity2.entity.ts
│
├── repositories/          # 仓储层目录
├── interfaces/            # 接口定义目录
├── constants/             # 常量定义目录
└── complex-module.module.ts  # 模块定义
```

## 四、文件内容规范

### 4.1 模块文件结构

```typescript
// example.module.ts
@Module({
  imports: [
    // 先引入外部模块
    TypeOrmModule.forFeature([ExampleEntity]),
    // 再引入内部模块
    SharedModule,
  ],
  controllers: [ExampleController],
  providers: [
    ExampleService,
    // 其他providers
  ],
  exports: [
    ExampleService,
  ],
})
export class ExampleModule {}
```

### 4.2 控制器文件结构

```typescript
// example.controller.ts
@ApiTags('示例模块')
@Controller('examples')
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  @Post()
  @ApiOperation({ summary: '创建示例' })
  create(@Body() createDto: CreateExampleDto) {
    return this.exampleService.create(createDto);
  }

  // 其他API方法
}
```

### 4.3 服务层文件结构

```typescript
// example.service.ts
@Injectable()
export class ExampleService {
  constructor(
    @InjectRepository(ExampleEntity)
    private readonly exampleRepository: Repository<ExampleEntity>,
    private readonly otherService: OtherService,
  ) {}

  // 方法实现
}
```

## 五、最佳实践

### 5.1 导入顺序规范

```typescript
// 1. Node.js内置模块
import * as fs from 'fs';
import * as path from 'path';

// 2. 第三方模块
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

// 3. 本地模块(按路径深度排序)
import { BaseEntity } from '../../common/entities/base.entity';
import { CreateUserDto } from './dto/create-user.dto';
```

### 5.2 代码分组规范

对于具有大量方法的服务类，应采用逻辑分组，并用注释标识：

```typescript
@Injectable()
export class UserService {
  // ----------------
  // 基础CRUD操作
  // ----------------
  async create() { /* ... */ }
  async findAll() { /* ... */ }

  // ----------------
  // 业务操作
  // ----------------
  async resetPassword() { /* ... */ }
  async assignRoles() { /* ... */ }

  // ----------------
  // 辅助方法
  // ----------------
  private validateUser() { /* ... */ }
}
```

### 5.3 新模块创建流程

1. 使用Nest CLI创建骨架: `nest g module modules/new-module`
2. 创建相关组件: `nest g controller modules/new-module`
3. 按照标准结构创建其他必要目录
4. 编写单元测试

## 六、多环境支持规范

### 6.1 环境配置文件组织

```plaintext
/backend/
├── .env                  # 共享环境变量
├── .env.development      # 开发环境
├── .env.test             # 测试环境
├── .env.staging          # 预发布环境
└── .env.production       # 生产环境
```

### 6.2 构建与部署配置

```plaintext
/backend/
├── Dockerfile            # 生产环境Docker配置
├── Dockerfile.dev        # 开发环境Docker配置
└── docker-compose.yml    # 本地开发编排
```

## 七、案例

### 7.1 用户模块示例

```plaintext
/modules/user/
├── dto/
│   ├── create-user.dto.ts
│   ├── update-user.dto.ts
│   └── user-query.dto.ts
├── entities/
│   ├── user.entity.ts
│   └── user-log.entity.ts
├── interfaces/
│   └── user-info.interface.ts
├── user.controller.ts
├── user.service.ts
├── user.module.ts
└── user.spec.ts
```
