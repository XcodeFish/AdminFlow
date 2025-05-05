import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 获取路由需要的权限
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // 如果没有设置权限要求，则允许访问
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // 获取请求对象
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // 确保用户信息存在
    if (!user) {
      throw new ForbiddenException('未授权访问');
    }

    // 如果是管理员，直接放行
    if (user.isAdmin === true) {
      return true;
    }

    // 检查用户是否有需要的权限
    const hasPermission = this.matchPermissions(
      requiredPermissions,
      user.permissions || [],
    );

    if (!hasPermission) {
      throw new ForbiddenException('权限不足');
    }

    return true;
  }

  // 判断用户是否拥有所需权限
  private matchPermissions(
    requiredPermissions: string[],
    userPermissions: string[],
  ): boolean {
    return requiredPermissions.some(
      (permission) =>
        userPermissions.includes(permission) || userPermissions.includes('*'), // 超级管理员权限
    );
  }
}
