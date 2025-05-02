import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * 获取当前登录用户信息的装饰器
 *
 * 用法:
 * @CurrentUser() user: any - 获取完整用户对象
 * @CurrentUser('userId') userId: string - 获取用户ID
 * @CurrentUser('username') username: string - 获取用户名
 * @CurrentUser('roles') roles: string[] - 获取用户角色
 * @CurrentUser('permissions') permissions: string[] - 获取用户权限
 * @CurrentUser('isAdmin') isAdmin: boolean - 获取是否为管理员
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  },
);
