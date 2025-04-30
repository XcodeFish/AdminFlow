# 后台管理系统接口设计文档

## 一、文档概述

### 1.1 版本记录

```plaintext
| 版本 | 日期       | 作者 | 修改说明 |
| ---- | ---------- | ---- | -------- |
| V1.0 | 2023-09-15 | coderAngel  | 初始版本 |
| V1.1 | 2023-11-20 | coderAngel  | 添加错误码映射与限流策略 |
```

### 1.2 接口规范

- 基础路径: /api/v1
- 认证方式: Bearer Token（JWT）
- 数据格式: JSON
- 字符编码: UTF-8

## 二、通用规范

### 2.1 请求头

```http
Authorization: Bearer <access_token>
Content-Type: application/json
X-Requested-With: XMLHttpRequest
```

### 2.2 分页参数

```plaintext
| 参数名    | 类型   | 必填 | 说明          |
| --------- | ------ | ---- | ------------- |
| page      | int    | 否   | 当前页码      |
| pageSize  | int    | 否   | 每页条数      |
| orderBy   | string | 否   | 排序字段      |
| orderType | string | 否   | asc/desc      |
| searchKey | string | 否   | 模糊搜索关键字 |
```

### 2.3 响应结构

```json
{
  "code": 200,
  "message": "success",
  "data": {},
  "timestamp": 1692000000000
}

{
  "code": 403,
  "message": "权限不足",
  "path": "/api/v1/users",
  "timestamp": 1692000000000
}

{
  "code": 500,
  "message": "系统错误",
  "path": "/api/v1/users",
  "timestamp": 1692000000000
}
```

### 2.4 HTTP状态码与业务错误码映射

```plaintext
| HTTP状态码 | 业务错误码 | 含义                          | 处理建议                        |
| ---------- | ---------- | ----------------------------- | ------------------------------- |
| 200        | 200        | 成功                          | -                               |
| 400        | 40001      | 请求参数错误                  | 检查请求参数格式和类型          |
| 400        | 40002      | 请求参数验证失败              | 参照接口文档修正参数            |
| 401        | 40101      | Token已过期                   | 使用refreshToken获取新token     |
| 401        | 40102      | Token无效                     | 重新登录获取有效token           |
| 403        | 40301      | 缺少访问权限                  | 联系管理员分配权限              |
| 403        | 40302      | 请求超出限流阈值              | 稍后重试或优化请求频率          |
| 404        | 40401      | 资源不存在                    | 检查资源ID是否正确              |
| 409        | 40901      | 资源冲突(如唯一索引冲突)      | 修改请求数据避免冲突            |
| 500        | 50001      | 数据库连接失败                | 联系管理员检查数据库状态        |
| 500        | 50002      | 内部服务错误                  | 联系开发人员排查                |
| 502        | 50201      | 网关错误                      | 检查微服务可用性                |
| 503        | 50301      | 服务暂时不可用                | 等待服务恢复后重试              |
```

### 2.5 接口限流策略

```plaintext
| 接口类型       | 限流阈值        | 限流窗口      | 超限响应策略         |
| -------------- | --------------- | ------------- | -------------------- |
| 认证类接口     | 5次/分钟/IP     | 60秒          | 锁定10分钟           |
| 普通查询接口   | 60次/分钟/用户  | 60秒          | 降级返回缓存数据     |
| 写操作接口     | 30次/分钟/用户  | 60秒          | 拒绝并返回429状态码  |
| 文件上传接口   | 10次/小时/用户  | 3600秒        | 拒绝并返回429状态码  |
| 导出接口       | 5次/小时/用户   | 3600秒        | 进入队列异步处理     |
```

### 2.6 跨域(CORS)策略配置

```typescript
// NestJS CORS 配置
app.enableCors({
  origin: ['https://admin.example.com', 'https://dev-admin.example.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Disposition'], // 用于文件下载
  credentials: true,
  maxAge: 3600 // 预检请求缓存时间(秒)
});
```

## 三、核心模块接口设计

### 3.1 认证模块

#### 3.1.1 登录

```markdown
- **URL**: /auth/login
- **Method**: POST
- **请求体**:
```json
{
  "username": "admin",
  "password": "RSA(加密后的密码)"
}
```

- **响应体**:

```json
{
  "code": 200,
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi...",
    "expiresIn": 1800
  }
}
```

### 3.2 用户模块

#### 3.2.1 获取用户列表

```markdown
- **URL**: /system/users
- **Method**: GET
- **Query参数**:
  - deptId: 部门ID
  - status: 用户状态（0/1）

- **响应结构**:
```json
{
  "total": 100,
  "currentPage": 1,
  "pageSize": 10,
  "list": [
    {
      "userId": 1,
      "username": "admin",
      "nickName": "管理员",
      "roles": ["超级管理员"],
      "deptName": "技术部",
      "status": 1
    }
  ]
}
```

#### 3.2.2 创建用户

```markdown
- **URL**: /system/users
- **Method**: POST
- **请求体**:
```json
{
  "username": "newUser",
  "password": "RSA(加密后的密码)",
  "nickName": "新用户",
  "deptId": 1,
  "roles": [],
  "status": 1,
  "email": "newUser@example.com",
  "phone": "12345678901",
  "remark": "新用户备注",
  "avatar": "https://example.com/avatar.png",
  "sex": "男",
  "birthday": "1990-01-01",
  "address": "地址",
  "idCard": "123456789012345678",
  "workExperience": "1年",
  "startDate": "2020-01-01",
  "jobTitle": "软件工程师",
  "department": "技术部"
}
```

### 3.3 角色管理

#### 3.3.1 创建角色

```markdown
- **URL**: /system/roles
- **Method**: POST
- **权限标识**: system:role:add
- **请求体**:
```json
{
  "roleName": "财务主管",
  "roleKey": "finance",
  "menuIds": [101, 102],
  "remark": "财务相关权限"
}
```

### 3.4 菜单管理

#### 3.4.1 菜单树查询

```markdown
- **URL**: /system/menus/tree
- **Method**: GET
- **响应示例**:
```json
[
  {
    "menuId": 1,
    "menuName": "系统管理",
    "icon": "setting",
    "path": "/system",
    "permission": "system:view",
    "component": "Layout",
    "alwaysShow": true,
    "status": 1,
    "children": [
      {
        "menuId": 101,
        "menuName": "用户管理",
        "path": "/system/users",
        "permission": "system:user:list",
        "component": "system/users",
        "status": 1,
        "icon": "user",
        "alwaysShow": true
      }
    ]
  }
]
```

## 四、高级设计

### 4.1 文件上传

```markdown
- **URL**: /common/upload
- **Method**: POST
- **Content-Type**: multipart/form-data
- **参数**:
  - file: 文件对象
  - type: 业务类型（avatar/export等）

- **响应**:
```json
{
  "url": "/uploads/2023/08/20/filename.jpg",
  "size": 10240,
  "hash": "a1b2c3d4"
}
```

### 4.2 操作日志

```markdown
- **URL**: /monitor/logs
- **Method**: GET
- **查询参数**:
  - operName: 操作人员
  - status: 操作状态（0失败 1成功）
  - beginTime: 开始时间（时间戳）

- **响应字段**:
  - operId: 日志ID
  - title: 操作模块
  - businessType: 业务类型（0其它 1新增 2修改...）
  - operIp: 操作IP
  - operTime: 操作时间

```

### 4.3 日志脱敏机制

```typescript
// 日志脱敏配置
const sensitiveFields = [
  'password', 'oldPassword', 'newPassword',
  'idCard', 'phone', 'email', 'bankAccount'
];

// 脱敏处理器
function maskSensitiveData(data) {
  if (!data) return data;

  const masked = { ...data };
  sensitiveFields.forEach(field => {
    if (masked[field]) {
      if (field === 'idCard' && typeof masked[field] === 'string') {
        masked[field] = masked[field].replace(/^(.{6})(.*)(.{4})$/, '$1****$3');
      } else if (field === 'phone' && typeof masked[field] === 'string') {
        masked[field] = masked[field].replace(/^(.{3})(.*)(.{4})$/, '$1****$3');
      } else if (field.includes('password')) {
        masked[field] = '******';
      } else if (field === 'email' && typeof masked[field] === 'string') {
        const parts = masked[field].split('@');
        if (parts.length === 2) {
          masked[field] = `${parts[0].substring(0, 3)}***@${parts[1]}`;
        }
      } else {
        masked[field] = '******';
      }
    }
  });

  return masked;
}

// 日志记录中间件
app.use((req, res, next) => {
  const maskedBody = maskSensitiveData(req.body);
  const maskedQuery = maskSensitiveData(req.query);

  logger.info({
    method: req.method,
    path: req.path,
    body: maskedBody,
    query: maskedQuery,
    ip: req.ip,
    userId: req.user?.id
  });

  next();
});
```

## 五、安全设计附录

### 5.1 敏感参数加密

```markdown
- **加密字段**：
  - 登录密码（RSA公钥加密）
  - 手机号（AES加密存储）

- **加密流程**：
  前端 → 获取公钥 → 加密参数 → 传输加密字符串
```

### 5.2 权限标识规范

| 模块   | 资源  | 操作   | 完整标识          |
| ------ | ----- | ------ | ----------------- |
| system | user  | create | system:user:create |
| monitor| log   | delete | monitor:log:delete |

### 5.3 API安全检查清单

```markdown
1. **所有接口安全措施**
   - [x] 参数校验（类型、格式、长度）
   - [x] SQL注入防护（参数化查询）
   - [x] XSS防护（内容转义）
   - [x] CSRF防护（Token验证）

2. **认证接口安全措施**
   - [x] 限流防暴力破解
   - [x] 密码强度校验
   - [x] 登录日志记录
   - [x] 异常登录检测与通知

3. **文件上传接口安全**
   - [x] 文件类型校验
   - [x] 文件大小限制
   - [x] 文件内容扫描
   - [x] 文件存储安全配置（禁止直接执行）

4. **数据导出接口安全**
   - [x] 访问权限校验
   - [x] 数据量限制
   - [x] 异步导出大数据
   - [x] 导出文件临时链接（有效期设置）
```
