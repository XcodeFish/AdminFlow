import { SetMetadata } from '@nestjs/common';
import { OperationType } from '../../common/enums/logger.enum';

export const OPERATION_LOG_KEY = 'operation_log';

export interface OperationLogOptions {
  module: string;
  operationType: OperationType;
  operationName: string;
  content?: string;
  skipResult?: boolean;
}

/**
 * 操作日志装饰器
 * @param options 操作日志选项
 */
export const OperationLog = (options: OperationLogOptions) => {
  return SetMetadata(OPERATION_LOG_KEY, options);
};
