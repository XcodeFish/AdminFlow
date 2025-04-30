# 开源后AdminFlow后台管理系统框架架构设计文档

## 1. 核心理念与目标

### 1.1 核心目标

- 构建"开发者友好型"开源后台管理系统基础框架，具备以下特性：

1. 快速启动：10分钟内完成基础环境搭建与系统启动

1. 低学习曲线：提供脚手架工具和标准模板

1. 全栈解决方案：涵盖后台系统90%通用需求

### 1.2 设计原则

1. 约定优于配置：通过目录规范降低配置复杂度

1. 分层解耦：清晰划分Controller/Service/Repository层

1. 渐进式设计：支持从单体架构平滑过渡到微服务

## 2. 技术选型

### 2. 技术选型

```plaintext
| 类别     | 技术栈            | 选型理由                        |
| -------- | ----------------- | ------------------------------- |
| 核心框架 | NestJS 10+        | 内置依赖注入、模块化机制，TypeScript原生支持 |
| ORM      | TypeORM 0.3.17+   | 支持Active Record/Data Mapper双模式，多数据库兼容 |
| 数据库   | MySQL 8+/PostgreSQL 14+ | 事务性场景支持，JSON类型增强    |
| 缓存     | Redis 6+          | 分布式锁支持，内存数据库高性能  |
| 认证鉴权 | JWT + RBAC        | 无状态认证，细粒度权限控制      |
| API文档  | Swagger 4+        | OpenAPI 3.0标准支持，交互式文档 |
| 代码生成器 | Yeoman + Handlebars | 模板化生成，支持自定义模板覆盖 |
| 监控     | Prometheus + Grafana | 多维度指标采集，可视化Dashboard |
| API网关  | Spring Cloud Gateway/Kong | 路由转发、限流熔断、日志监控 |
| 消息队列 | RabbitMQ/Kafka    | 异步处理、削峰填谷、事件驱动架构 |
```

## 3.架构设计

### 3.1 分层架构

```plaintext
┌──────────────┐
│   API层      │  ← RESTful接口定义/参数校验
├──────────────┤
│ 业务逻辑层   │  ← 核心业务逻辑/事务管理
├──────────────┤
│ 数据访问层   │  ← 数据库操作/缓存处理
├──────────────┤
│ 基础设施层   │  ← 通用工具/跨领域服务
└──────────────┘
```

### 3.2 模块划分

```typescript
@Global
┌───────────────────────┐
│   CoreModule          │  ← 全局异常处理/基础DTO/工具类
├───────────────────────┤
│   AuthModule          │  ← JWT签发/RBAC实现/权限拦截
├───────────────────────┤
│   SystemModule        │  ← 用户/角色/菜单/部门管理
├───────────────────────┤
│   MonitorModule       │  ← 系统监控/日志管理
├───────────────────────┤
│   GeneratorModule     │  ← 代码生成器引擎
└───────────────────────┘
```

### 3.3 目录结构 (NestJS)

- 采用分层 + 模块化的设计思路。

```plaintext
/nest-admin-system/backend/
├── main.ts                 # 应用入口
├── app.module.ts           # 根模块
├── config/                 # 配置文件 (@nestjs/config)
│   └── ...
├── core/                   # 核心/共享模块
│   ├── database/           # 数据库连接 (TypeORM)
│   ├── redis/              # Redis 连接
│   ├── filters/            # 全局异常过滤器
│   ├── interceptors/       # 全局拦截器 (响应格式化, 日志)
│   ├── guards/             # 全局守卫 (JWT 认证)
│   ├── decorators/         # 自定义装饰器 (用户信息, 权限)
│   ├── base/               # 基础类 (BaseEntity, BaseController, BaseService)
│   └── utils/              # 通用工具函数
└── modules/                # 业务功能模块
    ├── system/             # 系统管理模块
    │   ├── auth/           # 认证 (登录, JWT)
    │   ├── user/           # 用户管理
    │   ├── role/           # 角色管理
    │   ├── menu/           # 菜单/权限管理
    │   ├── dept/           # 部门管理
    │   ├── dict/           # 字典管理
    │   ├── config/         # 参数配置
    │   ├── log/            # 日志管理 (操作, 登录)
    │   ├── *.module.ts
    │   ├── *.controller.ts
    │   ├── *.service.ts
    │   ├── *.entity.ts
    │   └── dto/
    ├── monitor/            # 系统监控模块
    │   ├── server/         # 服务器监控
    │   ├── cache/          # 缓存监控
    │   └── ...
    ├── tool/               # 系统工具模块
    │   ├── generator/      # ✨ 代码生成器 ✨
    │   │   ├── *.controller.ts
    │   │   ├── *.service.ts
    │   │   └── templates/  # 代码模板 (EJS/Handlebars)
    │   └── swagger/        # Swagger 集成
    ├── schedule/           # 定时任务模块
    │   ├── *.task.ts
    │   └── ...
    └── ...                 # 其他自定义业务模块

```

## 4.关键实现细节

### 4.1 数据层优化策略

1. 缓存穿透防护：布隆过滤器+空值缓存
1. 事务管理：TypeORM事务装饰器

```typescript
// 简单事务装饰器实现
export function Transaction() {
  return function(target: any, methodName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function(...args: any[]) {
      const queryRunner = getConnection().createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // 将事务管理器注入到方法的上下文中
        const result = await originalMethod.apply(this, [...args, queryRunner.manager]);
        await queryRunner.commitTransaction();
        return result;
      } catch (error) {
        // 发生错误时自动回滚事务
        await queryRunner.rollbackTransaction();
        this.logger.error(`Transaction failed: ${error.message}`, error.stack);
        throw error;
      } finally {
        // 无论成功或失败，最终都要释放连接
        await queryRunner.release();
      }
    };

    return descriptor;
  };
}

// 使用示例
@Injectable()
export class TransferService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly logger: Logger,
  ) {}

  @Transaction()
  async transferFunds(fromUserId: number, toUserId: number, amount: number, entityManager?: EntityManager) {
    // 使用传入的entityManager确保操作在同一事务中
    const manager = entityManager || getManager();

    // 锁定相关记录，防止并发问题
    const fromUser = await manager.findOne(User, fromUserId, { lock: { mode: 'pessimistic_write' } });
    if (!fromUser || fromUser.balance < amount) {
      throw new BadRequestException('余额不足或用户不存在');
    }

    const toUser = await manager.findOne(User, toUserId, { lock: { mode: 'pessimistic_write' } });
    if (!toUser) {
      throw new NotFoundException('接收方用户不存在');
    }

    // 执行转账逻辑
    fromUser.balance -= amount;
    toUser.balance += amount;

    // 记录交易历史
    const transaction = new Transaction();
    transaction.fromUserId = fromUserId;
    transaction.toUserId = toUserId;
    transaction.amount = amount;
    transaction.createdAt = new Date();

    // 保存所有变更
    await manager.save(fromUser);
    await manager.save(toUser);
    await manager.save(transaction);

    return { success: true, message: '转账成功' };
  }
}
```

### 4.2 接口安全设计

```markdown
1. **防XSS**:
   - 所有响应头设置 `Content-Type: application/json`
   - 输入参数全局过滤 `<>/script` 标签

2. **CSRF防护**:
   - 启用SameSite Cookie策略
   - 敏感操作要求携带Header `X-Requested-With: XMLHttpRequest`

3. **SQL注入防护**:
   - TypeORM参数化查询
   - 禁用原始SQL语句执行

4. **JWT安全**:
   - 双Token机制（accessToken 30分钟 + refreshToken 7天）
   - 强制HTTPS传输

5. **敏感数据加密**:
   - 密码存储使用bcrypt哈希
   - 敏感接口参数RSA加密传输
```

### 4.3 API限流策略

```typescript
// 限流守卫实现
@Injectable()
export class ThrottlerGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // 获取请求IP或用户ID作为限流键
    const key = request.user ? `throttle:user:${request.user.id}:${request.path}`
                             : `throttle:ip:${request.ip}:${request.path}`;

    // 获取路由的限流配置
    const throttleConfig = this.reflector.get<ThrottleConfig>(
      'throttle',
      context.getHandler()
    ) || this.getDefaultThrottleConfig(request.path);

    const { limit, ttl } = throttleConfig;

    // 使用Redis实现计数器
    const count = await this.redisService.incr(key);
    if (count === 1) {
      await this.redisService.expire(key, ttl);
    }

    // 设置响应头，告知客户端限流状态
    response.header('X-RateLimit-Limit', limit.toString());
    response.header('X-RateLimit-Remaining', Math.max(0, limit - count).toString());

    // 超过限制，拒绝请求
    if (count > limit) {
      throw new ThrottleException(throttleConfig.message || '请求过于频繁，请稍后再试');
    }

    return true;
  }

  // 根据路径获取默认限流配置
  private getDefaultThrottleConfig(path: string): ThrottleConfig {
    if (path.includes('/auth/')) {
      return { limit: 5, ttl: 60, type: 'IP' }; // 认证接口
    } else if (path.includes('/upload/')) {
      return { limit: 10, ttl: 3600, type: 'USER' }; // 上传接口
    } else if (path.includes('/export/')) {
      return { limit: 5, ttl: 3600, type: 'USER' }; // 导出接口
    } else if (path.match(/\/(create|update|delete)/)) {
      return { limit: 30, ttl: 60, type: 'USER' }; // 写操作接口
    } else {
      return { limit: 60, ttl: 60, type: 'USER' }; // 查询接口
    }
  }
}

// 使用方式
@Controller('users')
export class UserController {
  @Throttle({ limit: 20, ttl: 60 }) // 自定义限流
  @Get()
  findAll() {
    // 查询用户列表
  }
}
```

### 4.4 日志脱敏实现

```typescript
// 日志脱敏拦截器
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly logger: Logger,
    private readonly configService: ConfigService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, path, ip, headers, body, query } = request;
    const userAgent = headers['user-agent'];
    const userId = request.user?.id;

    // 请求开始时间
    const startTime = Date.now();

    // 脱敏敏感字段
    const maskedBody = this.maskSensitiveData(body);
    const maskedQuery = this.maskSensitiveData(query);

    // 记录请求日志
    this.logger.log({
      type: 'REQUEST',
      method,
      path,
      ip,
      userAgent,
      userId,
      body: maskedBody,
      query: maskedQuery,
      timestamp: new Date().toISOString(),
    });

    return next.handle().pipe(
      tap((data) => {
        // 记录响应日志
        const responseTime = Date.now() - startTime;
        this.logger.log({
          type: 'RESPONSE',
          method,
          path,
          statusCode: context.switchToHttp().getResponse().statusCode,
          responseTime: `${responseTime}ms`,
          userId,
          timestamp: new Date().toISOString(),
        });
      }),
      catchError((error) => {
        // 记录错误日志
        const responseTime = Date.now() - startTime;
        this.logger.error({
          type: 'ERROR',
          method,
          path,
          statusCode: error.status || 500,
          message: error.message,
          stack: this.configService.get('NODE_ENV') === 'production' ? undefined : error.stack,
          responseTime: `${responseTime}ms`,
          userId,
          timestamp: new Date().toISOString(),
        });

        throw error;
      }),
    );
  }

  // 敏感数据脱敏处理
  private maskSensitiveData(data: any): any {
    if (!data) return data;

    const maskedData = { ...data };
    const sensitiveFields = [
      'password', 'oldPassword', 'newPassword',
      'idCard', 'phone', 'email', 'bankAccount'
    ];

    sensitiveFields.forEach(field => {
      if (maskedData[field]) {
        if (field === 'idCard' && typeof maskedData[field] === 'string') {
          maskedData[field] = maskedData[field].replace(/^(.{6})(.*)(.{4})$/, '$1****$3');
        } else if (field === 'phone' && typeof maskedData[field] === 'string') {
          maskedData[field] = maskedData[field].replace(/^(.{3})(.*)(.{4})$/, '$1****$3');
        } else if (field.includes('password')) {
          maskedData[field] = '******';
        } else if (field === 'email' && typeof maskedData[field] === 'string') {
          const parts = maskedData[field].split('@');
          if (parts.length === 2) {
            maskedData[field] = `${parts[0].substring(0, 3)}***@${parts[1]}`;
          }
        } else {
          maskedData[field] = '******';
        }
      }
    });

    return maskedData;
  }
}
```
