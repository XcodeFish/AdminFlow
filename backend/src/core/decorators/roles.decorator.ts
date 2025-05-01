import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * 角色要求装饰器
 * @param roles 需要的角色列表
 */
export const Roles = (roles: string | string[]) => {
  const rolesArray = Array.isArray(roles) ? roles : [roles];
  return SetMetadata(ROLES_KEY, rolesArray);
};

/**
 * 角色要求装饰器 (别名)
 * @param roles 需要的角色列表
 */
export const RequireRoles = Roles;
