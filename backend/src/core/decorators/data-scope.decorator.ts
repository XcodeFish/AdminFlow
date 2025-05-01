// /backend/src/core/decorators/data-scope.decorator.ts

import { SetMetadata } from '@nestjs/common';
import { DataScopeType } from '../interceptors/data-scope.interceptor';

export const DATA_SCOPE_KEY = 'dataScope';

/**
 * 数据权限范围装饰器
 * @param scopeType 数据权限类型
 */
export const DataScope = (scopeType: DataScopeType) =>
  SetMetadata(DATA_SCOPE_KEY, scopeType);
