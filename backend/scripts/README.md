# 管理脚本目录

本目录包含系统的各种管理脚本，用于初始化数据、维护系统等。

## 脚本列表

### 1. 重置管理员密码 (reset-admin-password.ts)

重置管理员账户的密码。

```bash
# 运行方式
npm run ts-node -- scripts/reset-admin-password.ts
```

### 2. 初始化基础菜单 (init-menu.ts)

初始化系统基础菜单结构，包括：

- 仪表盘（菜单，无父级）
- 系统管理（目录，无父级）
  - 用户管理（系统管理的子菜单）
  - 角色管理（系统管理的子菜单）
  - 菜单管理（系统管理的子菜单）

```bash
# 运行方式
npm run init:menu
```

注意：此脚本只能在菜单表为空时运行，否则会提示已存在菜单数据。如需重新初始化，请先清空菜单表。

## 如何添加新脚本

1. 在本目录下创建新的TypeScript脚本文件
2. 在`package.json`中添加对应的npm脚本命令
3. 更新本README文件，添加新脚本的说明

## 通用模板

新脚本可以参考以下模板：

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const logger = new Logger('ScriptName');

  try {
    // 在这里编写脚本逻辑
    logger.log('脚本开始执行...');

    // 获取服务
    // const someService = app.get(SomeService);

    // 执行操作

    logger.log('脚本执行完成');
  } catch (error) {
    logger.error(`脚本执行失败: ${error.message}`);
    logger.error(error.stack);
  } finally {
    await app.close();
  }
}

bootstrap();
```
