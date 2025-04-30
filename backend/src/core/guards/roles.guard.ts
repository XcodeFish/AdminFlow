import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 获取路由上设置的角色
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // 获取路由上设置的权限
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // 如果没有设置角色或权限，则放行
    if (!requiredRoles && !requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // 用户未登录
    if (!user) {
      return false;
    }

    // 检查角色
    if (requiredRoles?.length) {
      const hasRole = user.roles.some((role) => requiredRoles.includes(role));
      if (!hasRole) {
        throw new ForbiddenException('没有足够的角色权限');
      }
    }

    // 检查权限
    if (requiredPermissions?.length) {
      const hasPermission = user.permissions.some((permission) =>
        requiredPermissions.includes(permission),
      );
      if (!hasPermission) {
        throw new ForbiddenException('没有足够的操作权限');
      }
    }

    return true;
  }
}
