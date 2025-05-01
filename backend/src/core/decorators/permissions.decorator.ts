import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * 权限要求装饰器
 * 用于标记需要特定权限的路由
 * @param permissions 需要的权限标识列表
 */
export const Permissions = (permissions: string | string[]) => {
  const permArray = Array.isArray(permissions) ? permissions : [permissions];
  return SetMetadata(PERMISSIONS_KEY, permArray);
};

/**
 * 权限要求装饰器 (别名)
 * @param permissions 需要的权限标识列表
 */
export const RequirePermissions = Permissions;
