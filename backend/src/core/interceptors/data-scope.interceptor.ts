// /backend/src/core/interceptors/data-scope.interceptor.ts

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

export enum DataScopeType {
  ALL = 1, // 全部数据权限
  CUSTOM = 2, // 自定义数据权限
  DEPT = 3, // 本部门数据权限
  DEPT_BELOW = 4, // 本部门及以下数据权限
  SELF = 5, // 仅本人数据权限
}

export const DATA_SCOPE_KEY = 'dataScope';

@Injectable()
export class DataScopeInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const dataScope = this.reflector.get<DataScopeType>(
      DATA_SCOPE_KEY,
      context.getHandler(),
    );

    // 如果没有设置数据权限范围，直接放行
    if (!dataScope) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // 如果没有用户信息，直接放行
    if (!user) {
      return next.handle();
    }

    // 应用数据权限条件到请求中
    this.applyDataScope(request, user, dataScope);

    return next.handle();
  }

  private applyDataScope(
    request: any,
    user: any,
    dataScope: DataScopeType,
  ): void {
    // 从角色中获取数据权限
    const roleDataScope = this.getRoleDataScope(user);

    // 默认使用接口指定的数据权限
    let finalScope = dataScope;

    // 如果角色数据权限范围更小，则使用更小的范围
    if (roleDataScope > dataScope) {
      finalScope = roleDataScope;
    }

    // 根据最终数据权限设置查询条件
    switch (finalScope) {
      case DataScopeType.ALL:
        // 全部数据权限，不需要添加条件
        break;
      case DataScopeType.CUSTOM:
        // 自定义数据权限，获取用户可访问的部门ID列表
        const deptIds = user.deptIds || [];
        request.dataScope = { deptIds };
        break;
      case DataScopeType.DEPT:
        // 本部门数据权限
        request.dataScope = { deptId: user.deptId };
        break;
      case DataScopeType.DEPT_BELOW:
        // 本部门及以下数据权限，递归查询所有子部门
        const deptAndChildIds = [user.deptId]; // 实际应用中需要查询子部门
        request.dataScope = { deptIds: deptAndChildIds };
        break;
      case DataScopeType.SELF:
        // 仅本人数据权限
        request.dataScope = { userId: user.id };
        break;
    }
  }

  private getRoleDataScope(user: any): DataScopeType {
    // 获取用户角色中的最小数据权限范围
    if (!user.roles || user.roles.length === 0) {
      return DataScopeType.SELF; // 默认最小权限
    }

    // 获取最小的数据权限范围（数字越大，权限范围越小）
    return Math.max(
      ...user.roles.map((role) => role.dataScope || DataScopeType.ALL),
    );
  }
}
