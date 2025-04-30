# API开发规范文档

## 一、基础规范

### 1.1 API设计原则

1. **RESTful设计**：遵循资源导向设计
2. **一致性**：保持接口格式和参数命名的一致性
3. **简洁性**：减少嵌套，接口设计尽量简洁直观
4. **版本化**：支持API版本演进
5. **文档化**：使用Swagger/OpenAPI提供详细文档
6. **安全性**：敏感操作必须授权，数据传输加密

### 1.2 请求方法规范

| 方法   | 语义                         | 幂等性 | 使用场景                        |
|--------|------------------------------|--------|----------------------------------|
| GET    | 获取资源                     | 是     | 查询数据，不会修改资源           |
| POST   | 创建资源                     | 否     | 新增数据，提交表单               |
| PUT    | 完整替换资源                 | 是     | 更新完整资源                     |
| PATCH  | 部分更新资源                 | 否     | 更新部分字段                     |
| DELETE | 删除资源                     | 是     | 删除数据                         |

## 二、URL设计规范

### 2.1 URL命名规则

1. **使用名词复数形式**：表示资源集合

```
   /api/v1/users    ✓
   /api/v1/user     ✗
```

2. **URL层次不宜过深**：最多2-3层

   ```
   /api/v1/departments/{deptId}/users    ✓
   /api/v1/departments/{deptId}/managers/{managerId}/tasks    ✗
   ```

3. **使用连字符**：URL中的单词使用连字符(-)分隔，不使用下划线(_)

   ```
   /api/v1/user-logs    ✓
   /api/v1/user_logs    ✗
   ```

4. **避免使用动词**：URL表示资源，操作通过HTTP方法表达

   ```
   POST /api/v1/users    ✓ (创建用户)
   GET /api/v1/create-user    ✗
   ```

### 2.2 URL模式规范

1. **资源集合**：`/api/v1/{resources}`
   - 示例：`/api/v1/users` (获取用户列表)

2. **特定资源**：`/api/v1/{resources}/{resourceId}`
   - 示例：`/api/v1/users/42` (获取ID为42的用户)

3. **子资源集合**：`/api/v1/{resources}/{resourceId}/{subresources}`
   - 示例：`/api/v1/departments/5/users` (获取部门5的所有用户)

4. **特定子资源**：`/api/v1/{resources}/{resourceId}/{subresources}/{subresourceId}`
   - 示例：`/api/v1/departments/5/users/8` (获取部门5中ID为8的用户)

5. **资源操作**：`/api/v1/{resources}/{resourceId}/{action}`
   - 示例：`/api/v1/users/42/reset-password` (特殊操作可使用动词)

## 三、请求参数规范

### 3.1 参数命名规则

1. **使用驼峰式命名法**：首字母小写

   ```json
   {
     "userName": "admin",    ✓
     "user_name": "admin"    ✗
   }
   ```

2. **布尔类型参数**：使用"is"/"has"前缀

   ```json
   {
     "isEnabled": true,
     "hasChildren": false
   }
   ```

3. **日期时间格式**：统一使用ISO8601格式

   ```json
   {
     "createdAt": "2023-04-01T08:30:00Z"
   }
   ```

4. **枚举值参数**：使用有意义的字符串而非数字

   ```json
   {
     "status": "active",    ✓
     "status": 1            ✗
   }
   ```

### 3.2 查询参数规范

1. **分页参数**：统一使用`page`和`pageSize`

   ```
   GET /api/v1/users?page=1&pageSize=10
   ```

2. **排序参数**：使用`orderBy`和`orderType`

   ```
   GET /api/v1/users?orderBy=createdAt&orderType=desc
   ```

3. **筛选参数**：直接使用字段名作为参数

   ```
   GET /api/v1/users?status=active&deptId=5
   ```

4. **模糊搜索**：使用`searchKey`或`keyword`

   ```
   GET /api/v1/users?searchKey=admin
   ```

5. **日期范围**：使用`startDate`和`endDate`或`timeRange`

   ```
   GET /api/v1/logs?startDate=2023-01-01&endDate=2023-01-31
   ```

## 四、响应规范

### 4.1 响应状态码使用

| 状态码 | 使用场景                                        |
|--------|--------------------------------------------------|
| 200    | 请求成功                                         |
| 201    | 资源创建成功                                     |
| 204    | 请求成功但无返回内容（如删除操作）              |
| 400    | 请求参数错误                                     |
| 401    | 未授权（未登录或token无效）                     |
| 403    | 已授权但权限不足                                 |
| 404    | 资源不存在                                       |
| 409    | 资源冲突（如唯一约束冲突）                      |
| 422    | 数据验证失败                                     |
| 429    | 请求频率超限                                     |
| 500    | 服务器内部错误                                   |

### 4.2 响应体结构

1. **标准成功响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    // 业务数据...
  },
  "timestamp": 1692000000000
}
```

2. **分页数据响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      // 数据项...
    ],
    "total": 100,
    "page": 1,
    "pageSize": 10,
    "totalPages": 10
  },
  "timestamp": 1692000000000
}
```

3. **错误响应**：

```json
{
  "code": 40001,
  "message": "参数验证失败",
  "details": [
    {
      "field": "username",
      "message": "用户名不能为空"
    }
  ],
  "path": "/api/v1/users",
  "timestamp": 1692000000000
}
```

## 五、参数验证规范

### 5.1 参数校验规则

1. **必须使用DTO**：每个接口定义专用DTO类进行参数验证

2. **常用验证规则**：

```typescript
// 用户创建DTO示例
export class CreateUserDto {
  @IsNotEmpty({ message: '用户名不能为空' })
  @Length(4, 20, { message: '用户名长度为4-20个字符' })
  username: string;

  @IsNotEmpty({ message: '密码不能为空' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{8,20}$/, {
    message: '密码必须包含大小写字母和数字，长度8-20位'
  })
  password: string;

  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  @IsOptional()
  @IsPhoneNumber('CN', { message: '手机号格式不正确' })
  phone?: string;
}
```

3. **自定义验证器**：使用`@ValidatorConstraint()`创建复杂验证逻辑

## 六、接口文档规范

### 6.1 Swagger注解规范

```typescript
@ApiTags('用户管理')
@Controller('users')
export class UserController {
  @ApiOperation({ summary: '创建用户' })
  @ApiResponse({ status: 201, description: '用户创建成功', type: UserResponseDto })
  @ApiResponse({ status: 400, description: '参数验证失败' })
  @ApiResponse({ status: 409, description: '用户名已存在' })
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    // 具体实现...
  }

  @ApiOperation({ summary: '获取用户列表' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 10 })
  @ApiResponse({ status: 200, type: UserPaginatedResponseDto })
  @Get()
  findAll(@Query() query: UserQueryDto) {
    // 具体实现...
  }
}
```

### 6.2 接口描述标准

1. **接口摘要（summary）**：简明描述功能，动词+名词
2. **接口描述（description）**：补充说明，可包含用例
3. **参数说明**：每个参数提供描述、示例和验证规则
4. **响应示例**：提供成功和失败的响应示例

## 七、身份认证与授权规范

### 7.1 认证头部规范

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 7.2 权限标识规范

```typescript
@Controller('users')
export class UserController {
  @Post()
  @RequirePermissions('system:user:create')
  create() {
    // 实现...
  }

  @Delete(':id')
  @RequirePermissions('system:user:delete')
  remove() {
    // 实现...
  }
}
```

## 八、版本控制

### 8.1 版本策略

1. **URL路径版本**：`/api/v1/users`（推荐）
2. **查询参数版本**：`/api/users?version=1`
3. **请求头版本**：`Accept: application/vnd.company.v1+json`

### 8.2 版本兼容性原则

1. **向后兼容**：新版本必须兼容旧版本
2. **追加而非修改**：新增字段，不删除已有字段
3. **废弃流程**：字段废弃先标记为"deprecated"，下个大版本才移除

## 九、最佳实践

### 9.1 幂等性设计

1. **使用幂等令牌**：对关键业务操作使用幂等令牌防止重复提交

```http
X-Idempotency-Key: 123e4567-e89b-12d3-a456-426614174000
```

2. **条件请求**：使用条件头，如`If-Match`、`If-None-Match`

### 9.2 批量操作

1. **批量创建**：POST操作支持数组输入

```json
// POST /api/v1/users
{
  "users": [
    { "username": "user1", "email": "user1@example.com" },
    { "username": "user2", "email": "user2@example.com" }
  ]
}
```

2. **批量删除**：DELETE操作支持多ID

```
DELETE /api/v1/users?ids=1,2,3
```

### 9.3 大数据处理

1. **分页必须**：返回大量数据时强制分页
2. **异步导出**：大数据导出使用异步任务
3. **数据流式处理**：超大数据集合使用流式API

## 十、代码示例

### 10.1 控制器实现示范

```typescript
@ApiTags('用户管理')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: '获取用户列表' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 10 })
  @Get()
  @RequirePermissions('system:user:list')
  async findAll(@Query() query: UserQueryDto) {
    const { page = 1, pageSize = 10 } = query;
    const result = await this.userService.findAll(query);

    return {
      list: result.items,
      total: result.total,
      page,
      pageSize
    };
  }

  @ApiOperation({ summary: '获取用户详情' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @Get(':id')
  @RequirePermissions('system:user:info')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.findById(id);
    if (!user) {
      throw new NotFoundException(`ID为${id}的用户不存在`);
    }
    return user;
  }

  @ApiOperation({ summary: '创建用户' })
  @Post()
  @RequirePermissions('system:user:create')
  @HttpCode(201)
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.userService.create(createUserDto);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('用户名已存在');
      }
      throw error;
    }
  }

  @ApiOperation({ summary: '更新用户' })
  @Patch(':id')
  @RequirePermissions('system:user:update')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @ApiOperation({ summary: '删除用户' })
  @Delete(':id')
  @RequirePermissions('system:user:delete')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.userService.remove(id);
    if (!result.affected) {
      throw new NotFoundException(`ID为${id}的用户不存在`);
    }
  }
}
```

### 10.2 API异常处理

```typescript
// 全局异常过滤器
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '服务器内部错误';
    let code = 50000;
    let details = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;

      message = exceptionResponse.message || exception.message;

      // 处理验证错误
      if (exception instanceof ValidationException) {
        code = 40002;
        details = exceptionResponse.errors;
      }
      // 处理业务异常
      else if (exception instanceof BusinessException) {
        code = exceptionResponse.code || 40000;
      }
      // 处理标准HTTP异常
      else {
        switch (status) {
          case HttpStatus.UNAUTHORIZED:
            code = 40100;
            break;
          case HttpStatus.FORBIDDEN:
            code = 40300;
            break;
          case HttpStatus.NOT_FOUND:
            code = 40400;
            break;
          case HttpStatus.BAD_REQUEST:
            code = 40000;
            break;
          default:
            code = status * 100; // 50000 for 500, etc.
        }
      }
    }

    // 数据库异常处理
    if (exception instanceof QueryFailedError) {
      code = 50001;
      message = '数据库操作失败';
      // 根据错误码细分
      if (exception.message.includes('ER_DUP_ENTRY')) {
        code = 40901;
        message = '数据已存在，违反唯一约束';
      }
    }

    response.status(status).json({
      code,
      message,
      details,
      path: request.url,
      timestamp: new Date().getTime()
    });
  }
}
```
