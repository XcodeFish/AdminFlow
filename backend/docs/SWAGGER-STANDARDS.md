# Swagger文档规范

## 一、基本原则

### 1.1 文档设计目标

1. **清晰性**：API文档应清晰描述每个接口的功能和参数
2. **一致性**：保持文档风格和描述方式的一致性
3. **完整性**：完整涵盖接口的请求参数、响应结构和业务说明
4. **易用性**：提供足够的示例和详细说明，方便前端开发调用

### 1.2 文档分类组织

1. **分组原则**：按业务模块分组，便于查找
2. **版本管理**：在文档中明确标注API版本
3. **适当排序**：接口按照常用频率和逻辑顺序排列
4. **状态区分**：明确标识废弃接口和试验性接口

## 二、Swagger注解规范

### 2.1 模块与控制器注解

```typescript
// 1. 模块分组标记
@ApiTags('用户管理')
@Controller('system/users')
export class UserController {
  // 控制器方法...
}

// 2. 模块级别描述
@ApiExtraModels(UserDto, CreateUserDto, UpdateUserDto)
@Controller('system/users')
export class UserController {
  // 控制器方法...
}
```

### 2.2 接口描述注解

```typescript
@ApiOperation({
  summary: '创建新用户', // 简短概述
  description: '创建一个新的系统用户，必须指定用户名、密码和角色ID', // 详细描述
  externalDocs: {
    url: 'https://admin.example.com/docs/users', // 外部文档链接
    description: '用户管理完整文档'
  }
})
@Post()
create(@Body() createUserDto: CreateUserDto) {
  // 方法实现...
}
```

### 2.3 参数注解规范

```typescript
// 1. 路径参数
@ApiParam({
  name: 'id',
  description: '用户ID',
  required: true,
  type: 'number',
  example: 1
})
@Get(':id')
findOne(@Param('id') id: number) { }

// 2. 查询参数
@ApiQuery({
  name: 'page',
  description: '页码',
  required: false,
  type: 'number',
  example: 1
})
@ApiQuery({
  name: 'pageSize',
  description: '每页数量',
  required: false,
  type: 'number',
  example: 10
})
@Get()
findAll(@Query() query: UserQueryDto) { }

// 3. 请求体
@ApiBody({
  type: CreateUserDto,
  description: '用户创建信息',
  examples: {
    admin: {
      summary: '管理员示例',
      value: {
        username: 'admin',
        password: 'Admin@123',
        email: 'admin@example.com',
        roleIds: [1]
      }
    },
    user: {
      summary: '普通用户示例',
      value: {
        username: 'user01',
        password: 'User@123',
        email: 'user@example.com',
        roleIds: [2]
      }
    }
  }
})
@Post()
create(@Body() createUserDto: CreateUserDto) { }

// 4. 请求头
@ApiHeader({
  name: 'X-API-KEY',
  description: 'API密钥',
  required: true,
  schema: { type: 'string' }
})
@Get('profile')
getProfile() { }
```

### 2.4 响应注解规范

```typescript
// 1. 基本响应
@ApiResponse({
  status: 201,
  description: '用户创建成功',
  type: UserResponseDto
})
@ApiResponse({
  status: 400,
  description: '无效参数'
})
@ApiResponse({
  status: 409,
  description: '用户名已存在'
})
@Post()
create(@Body() createUserDto: CreateUserDto) { }

// 2. 复杂响应(带示例)
@ApiResponse({
  status: 200,
  description: '获取用户列表成功',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          total: {
            type: 'number',
            example: 100
          },
          items: {
            type: 'array',
            items: { $ref: getSchemaPath(UserDto) }
          }
        }
      },
      examples: {
        paginated: {
          summary: '分页响应示例',
          value: {
            total: 100,
            items: [
              { id: 1, username: 'admin', email: 'admin@example.com' },
              { id: 2, username: 'user', email: 'user@example.com' }
            ]
          }
        }
      }
    }
  }
})
@Get()
findAll(@Query() query: UserQueryDto) { }
```

## 三、DTO规范

### 3.1 请求DTO规范

```typescript
export class CreateUserDto {
  @ApiProperty({
    description: '用户名',
    example: 'admin',
    minLength: 4,
    maxLength: 20
  })
  @IsNotEmpty({ message: '用户名不能为空' })
  @Length(4, 20, { message: '用户名长度为4-20个字符' })
  username: string;

  @ApiProperty({
    description: '密码',
    example: 'Admin@123',
    minLength: 8,
    maxLength: 20,
    format: 'password'
  })
  @IsNotEmpty({ message: '密码不能为空' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{8,20}$/, {
    message: '密码必须包含大小写字母和数字，长度8-20位'
  })
  password: string;

  @ApiProperty({
    description: '邮箱',
    example: 'admin@example.com',
    format: 'email'
  })
  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  @ApiProperty({
    description: '手机号',
    required: false,
    example: '13800138000'
  })
  @IsOptional()
  @IsPhoneNumber('CN', { message: '手机号格式不正确' })
  phone?: string;

  @ApiProperty({
    description: '角色ID列表',
    type: [Number],
    example: [1, 2]
  })
  @IsArray({ message: '角色ID必须是数组' })
  @ArrayNotEmpty({ message: '角色ID不能为空' })
  roleIds: number[];
}
```

### 3.2 响应DTO规范

```typescript
export class UserDto {
  @ApiProperty({
    description: '用户ID',
    example: 1
  })
  id: number;

  @ApiProperty({
    description: '用户名',
    example: 'admin'
  })
  username: string;

  @ApiProperty({
    description: '邮箱',
    example: 'admin@example.com'
  })
  email: string;

  @ApiProperty({
    description: '角色列表',
    type: [RoleDto]
  })
  roles: RoleDto[];

  @ApiProperty({
    description: '创建时间',
    format: 'date-time',
    example: '2023-01-01T08:00:00Z'
  })
  createdAt: Date;
}

// 分页响应DTO
export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: '总记录数',
    example: 100
  })
  total: number;

  @ApiProperty({
    description: '当前页',
    example: 1
  })
  page: number;

  @ApiProperty({
    description: '每页大小',
    example: 10
  })
  pageSize: number;

  @ApiProperty({
    description: '数据列表',
    type: 'array',
    isArray: true
  })
  items: T[];
}

// 使用泛型DTO
@ApiOkResponse({
  description: '获取用户列表成功',
  type: PaginatedResponseDto
})
@Get()
async findAll(@Query() query: UserQueryDto): Promise<PaginatedResponseDto<UserDto>> {
  // 实现...
}
```

### 3.3 通用查询DTO

```typescript
export class BaseQueryDto {
  @ApiProperty({
    description: '页码',
    required: false,
    default: 1,
    example: 1
  })
  @IsOptional()
  @IsInt({ message: '页码必须是整数' })
  @Min(1, { message: '页码不能小于1' })
  @Transform(({ value }) => parseInt(value, 10))
  page?: number = 1;

  @ApiProperty({
    description: '每页数量',
    required: false,
    default: 10,
    example: 10
  })
  @IsOptional()
  @IsInt({ message: '每页数量必须是整数' })
  @Min(1, { message: '每页数量不能小于1' })
  @Max(100, { message: '每页数量不能大于100' })
  @Transform(({ value }) => parseInt(value, 10))
  pageSize?: number = 10;

  @ApiProperty({
    description: '排序字段',
    required: false,
    example: 'createdAt'
  })
  @IsOptional()
  @IsString()
  orderBy?: string;

  @ApiProperty({
    description: '排序方式',
    required: false,
    enum: ['asc', 'desc'],
    default: 'desc',
    example: 'desc'
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'], { message: '排序方式必须是asc或desc' })
  orderType?: 'asc' | 'desc' = 'desc';

  @ApiProperty({
    description: '关键字搜索',
    required: false,
    example: 'admin'
  })
  @IsOptional()
  @IsString()
  searchKey?: string;
}

// 继承基础查询DTO
export class UserQueryDto extends BaseQueryDto {
  @ApiProperty({
    description: '状态筛选',
    required: false,
    enum: [0, 1],
    example: 1
  })
  @IsOptional()
  @IsEnum([0, 1], { message: '状态值必须是0或1' })
  @Transform(({ value }) => parseInt(value, 10))
  status?: number;

  @ApiProperty({
    description: '部门ID',
    required: false,
    example: 1
  })
  @IsOptional()
  @IsInt({ message: '部门ID必须是整数' })
  @Transform(({ value }) => parseInt(value, 10))
  deptId?: number;
}
```

## 四、Swagger UI配置

### 4.1 主应用配置

```typescript
// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger配置
  const config = new DocumentBuilder()
    .setTitle('管理系统API文档')
    .setDescription('本文档提供后台管理系统所有API接口详细说明')
    .setVersion('1.0')
    .addTag('认证管理', '登录认证相关接口')
    .addTag('用户管理', '系统用户相关接口')
    .addTag('角色管理', '角色与权限相关接口')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
        description: '输入JWT令牌',
      },
      'bearerAuth'
    )
    .addServer('/api/v1', '开发环境API')
    .addServer('https://api.example.com/v1', '生产环境API')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [PaginatedResponseDto, ErrorResponseDto],
    deepScanRoutes: true,
  });

  // 添加自定义CSS
  const customOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      displayRequestDuration: true,
    },
    customCss: `
      .swagger-ui .topbar { background-color: #3f51b5; }
      .swagger-ui .info .title { font-size: 25px; }
      .swagger-ui .opblock-tag { font-size: 18px; }
    `,
    customSiteTitle: '管理系统API文档',
  };

  SwaggerModule.setup('api-docs', app, document, customOptions);

  await app.listen(3000);
}
```

### 4.2 自定义插件与增强

```typescript
// swagger.plugin.ts
export class SwaggerEnhancer {
  static enhance(document: OpenAPIObject): OpenAPIObject {
    // 1. 添加通用错误响应
    this.addCommonErrorResponses(document);

    // 2. 自定义排序
    this.customizeTagOrder(document);

    return document;
  }

  private static addCommonErrorResponses(document: OpenAPIObject): void {
    const paths = document.paths;

    // 为每个路径添加通用错误响应
    for (const path in paths) {
      for (const method in paths[path]) {
        const operation = paths[path][method];

        // 401未授权
        if (!operation.responses['401']) {
          operation.responses['401'] = {
            description: '未授权',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponseDto',
                },
                example: {
                  code: 401,
                  message: '未授权或Token已过期',
                  timestamp: '2023-01-01T08:00:00Z'
                }
              }
            }
          };
        }

        // 403禁止访问
        if (!operation.responses['403']) {
          operation.responses['403'] = {
            description: '禁止访问',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponseDto',
                },
                example: {
                  code: 403,
                  message: '权限不足',
                  timestamp: '2023-01-01T08:00:00Z'
                }
              }
            }
          };
        }
      }
    }
  }

  private static customizeTagOrder(document: OpenAPIObject): void {
    // 自定义标签顺序
    const orderedTags = [
      '认证管理',
      '用户管理',
      '角色管理',
      '菜单管理',
      '部门管理',
      '字典管理',
      '日志管理',
      '系统监控'
    ];

    document.tags = orderedTags.map(name => {
      const existingTag = document.tags.find(tag => tag.name === name);
      return existingTag || { name, description: '' };
    });
  }
}

// 使用增强器
const document = SwaggerModule.createDocument(app, config);
const enhancedDocument = SwaggerEnhancer.enhance(document);
SwaggerModule.setup('api-docs', app, enhancedDocument, customOptions);
```

## 五、文档示例

### 5.1 完整控制器示例

```typescript
@ApiTags('用户管理')
@ApiBearerAuth('bearerAuth')
@Controller('system/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: '创建用户' })
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({
    description: '用户创建成功',
    type: UserDto
  })
  @ApiBadRequestResponse({ description: '参数验证失败' })
  @ApiConflictResponse({ description: '用户名已存在' })
  @RequirePermissions('system:user:create')
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: '获取用户列表' })
  @ApiQuery({ type: UserQueryDto })
  @ApiOkResponse({
    description: '获取用户列表成功',
    type: PaginatedResponseDto
  })
  @RequirePermissions('system:user:list')
  async findAll(@Query() query: UserQueryDto) {
    return this.userService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取用户详情' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiOkResponse({
    description: '获取用户详情成功',
    type: UserDetailDto
  })
  @ApiNotFoundResponse({ description: '用户不存在' })
  @RequirePermissions('system:user:info')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新用户' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({
    description: '用户更新成功',
    type: UserDto
  })
  @ApiNotFoundResponse({ description: '用户不存在' })
  @ApiBadRequestResponse({ description: '参数验证失败' })
  @RequirePermissions('system:user:update')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除用户' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiNoContentResponse({ description: '用户删除成功' })
  @ApiNotFoundResponse({ description: '用户不存在' })
  @ApiForbiddenResponse({ description: '不能删除超级管理员' })
  @RequirePermissions('system:user:delete')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.userService.remove(id);
  }

  @Post(':id/reset-password')
  @ApiOperation({ summary: '重置用户密码' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiOkResponse({ description: '密码重置成功' })
  @ApiNotFoundResponse({ description: '用户不存在' })
  @RequirePermissions('system:user:reset-password')
  async resetPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() resetPasswordDto: ResetPasswordDto
  ) {
    await this.userService.resetPassword(id, resetPasswordDto.password);
    return { message: '密码重置成功' };
  }
}
```

### 5.2 分级查询接口实例

```typescript
@ApiTags('部门管理')
@ApiBearerAuth('bearerAuth')
@Controller('system/departments')
export class DepartmentController {
  constructor(private readonly deptService: DepartmentService) {}

  @Get('tree')
  @ApiOperation({ summary: '获取部门树结构' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: [0, 1],
    description: '状态过滤(0-禁用 1-启用)'
  })
  @ApiOkResponse({
    description: '获取成功',
    schema: {
      type: 'array',
      items: {
        $ref: getSchemaPath(DeptTreeDto)
      }
    },
    content: {
      'application/json': {
        example: [
          {
            id: 1,
            name: '总公司',
            orderNum: 1,
            status: 1,
            children: [
              {
                id: 2,
                name: '研发部',
                orderNum: 1,
                status: 1,
                children: []
              },
              {
                id: 3,
                name: '市场部',
                orderNum: 2,
                status: 1,
                children: []
              }
            ]
          }
        ]
      }
    }
  })
  @RequirePermissions('system:dept:list')
  async getDeptTree(@Query('status') status?: number) {
    return this.deptService.getDeptTree(status);
  }
}
```

## 六、安全与敏感信息处理

### 6.1 敏感字段处理

```typescript
// 1. 密码字段不展示
export class UserDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'admin' })
  username: string;

  // 密码不应在响应中返回
  @ApiHideProperty()
  password: string;

  // 其他字段...
}

// 2. 敏感信息脱敏展示
export class UserDetailDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'admin' })
  username: string;

  @ApiProperty({
    description: '手机号(脱敏)',
    example: '138****8000'
  })
  phone: string;

  @ApiProperty({
    description: '邮箱(脱敏)',
    example: 'adm***@example.com'
  })
  email: string;

  // 其他字段...
}
```

### 6.2 接口权限标记

```typescript
@ApiTags('权限管理')
@ApiBearerAuth('bearerAuth')
@ApiSecurity('permissions', ['system:permission:manage'])
@Controller('system/permissions')
export class PermissionController {
  // 方法实现...
}
```

## 七、最佳实践

### 7.1 接口文档检查清单

**基本检查项**:

- [ ] 所有接口都有@ApiOperation装饰器
- [ ] 所有接口都有@ApiResponse装饰器
- [ ] 所有参数都有类型定义和说明
- [ ] 所有DTO类都有适当的@ApiProperty装饰器
- [ ] 所有示例数据都是有效且符合业务逻辑的
- [ ] 所有必填字段都有明确标识

**进阶检查项**:

- [ ] 接口分组合理，便于查找
- [ ] 复杂参数有清晰的示例
- [ ] 枚举值有明确的文字说明
- [ ] 错误响应包含足够的错误信息
- [ ] 废弃的接口和参数有明确标识
- [ ] 相关接口之间有导航链接
- [ ] 文档中不包含敏感信息

### 7.2 文档维护准则

1. **同步更新**：代码变更时同步更新文档
2. **文档评审**：新接口需要文档评审通过
3. **版本管理**：文档版本与API版本保持一致
4. **废弃标记**：不再使用的接口应标记为废弃
5. **文档测试**：定期测试文档中的示例请求

### 7.3 文档生成与导出

```typescript
// 导出OpenAPI规范文件
import * as fs from 'fs';
import * as path from 'path';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export function exportOpenApiSpec(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('管理系统API文档')
    .setVersion('1.0')
    // 其他配置...
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const outputPath = path.resolve(process.cwd(), 'api-docs');

  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  // 输出JSON格式
  fs.writeFileSync(
    path.join(outputPath, 'openapi-spec.json'),
    JSON.stringify(document, null, 2)
  );

  // 输出YAML格式 (需要js-yaml包)
  // const yaml = require('js-yaml');
  // fs.writeFileSync(
  //   path.join(outputPath, 'openapi-spec.yaml'),
  //   yaml.dump(document)
  // );

  console.log(`OpenAPI规范已导出到: ${outputPath}`);
}
