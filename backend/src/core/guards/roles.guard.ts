import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);
  private readonly adminRoleKey: string;

  constructor(
    private reflector: Reflector,
    private configService: ConfigService,
  ) {
    // 从配置中获取超级管理员角色标识
    this.adminRoleKey = configService.get('app.adminRoleKey', 'admin');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
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

    const { user, path, method } = context.switchToHttp().getRequest();

    // 用户未登录
    if (!user) {
      this.logger.warn(`未认证访问: ${method} ${path}`);
      return false;
    }

    this.logger.debug(
      `用户[${user.id}/${user.username}]访问: ${method} ${path}`,
    );
    this.logger.debug(`所需角色: ${requiredRoles?.join(', ') || '无'}`);
    this.logger.debug(`所需权限: ${requiredPermissions?.join(', ') || '无'}`);
    this.logger.debug(`用户角色: ${user.roles?.join(', ') || '无'}`);
    this.logger.debug(`用户权限: ${user.permissions?.join(', ') || '无'}`);

    // 检查用户是否为超级管理员
    // 1. 通过角色判断
    const isAdminByRole = user.roles?.includes(this.adminRoleKey);
    // 2. 通过JWT负载标记判断
    const isAdminByFlag = user.isAdmin === true;

    // 如果任一条件满足，则认为是超级管理员
    if (isAdminByRole || isAdminByFlag) {
      this.logger.debug(`超级管理员[${user.username}]访问，自动授权`);
      return true;
    }

    // 检查角色
    if (requiredRoles?.length) {
      const hasRole = requiredRoles.some((role) => user.roles?.includes(role));
      if (!hasRole) {
        this.logger.warn(
          `用户[${user.username}]角色权限不足: ${requiredRoles.join(', ')}`,
        );
        throw new ForbiddenException('没有足够的角色权限');
      }
    }

    // 检查权限
    if (requiredPermissions?.length) {
      // 确保用户权限是数组
      const userPermissions = Array.isArray(user.permissions)
        ? user.permissions
        : [];

      const hasPermission = requiredPermissions.some((permission) =>
        userPermissions.includes(permission),
      );

      if (!hasPermission) {
        this.logger.warn(
          `用户[${user.username}]操作权限不足: ${requiredPermissions.join(
            ', ',
          )}`,
        );
        throw new ForbiddenException('没有足够的操作权限');
      }
    }

    return true;
  }
}
