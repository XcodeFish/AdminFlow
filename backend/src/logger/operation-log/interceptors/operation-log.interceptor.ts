import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import { OPERATION_LOG_KEY, OperationLogOptions } from '../decorators/operation-log.decorator';
import { OperationLogService } from '../operation-log.service';
import { OperationStatus } from '../../common/enums/logger.enum';
import { getClientIp } from '../../common/utils/ip.util';
import { parseUserAgent } from '../../common/utils/user-agent.util';

@Injectable()
export class OperationLogInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly operationLogService: OperationLogService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // 获取操作日志元数据
    const operationLogOptions = this.reflector.get<OperationLogOptions>(
      OPERATION_LOG_KEY,
      context.getHandler(),
    );

    // 如果没有设置操作日志元数据，则不记录
    if (!operationLogOptions) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const startTime = Date.now();
    let responseData: any = {};

    // 处理请求
    return next.handle().pipe(
      tap({
        next: (data) => {
          // 记录成功响应
          responseData = data;
          this.saveOperationLog(context, operationLogOptions, startTime, true, data);
        },
        error: (error) => {
          // 记录错误响应
          this.saveOperationLog(context, operationLogOptions, startTime, false, null, error);
        },
      }),
    );
  }

  /**
   * 保存操作日志
   */
  private async saveOperationLog(
    context: ExecutionContext,
    options: OperationLogOptions,
    startTime: number,
    isSuccess: boolean,
    data?: any,
    error?: Error,
  ): Promise<void> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const duration = Date.now() - startTime;
    const user = request.user || {}; // 假设用户信息在request.user中

    // 构建操作日志对象
    const operationLog = {
      username: user['username'] || '未知用户',
      nickname: user['nickname'] || '未知用户',
      operationType: options.operationType,
      operationName: options.operationName,
      module: options.module,
      content: this.formatContent(options, request, data),
      requestParams: JSON.stringify(this.sanitizeRequestParams(request.body)),
      responseResult: options.skipResult ? null : JSON.stringify(data),
      ip: getClientIp(request),
      location: '内网IP', // 这里可以调用IP地址库获取位置信息
      userAgent: parseUserAgent(request.headers['user-agent'] as string),
      requestMethod: request.method,
      requestUrl: request.originalUrl,
      status: isSuccess ? OperationStatus.SUCCESS : OperationStatus.FAILED,
      errorMessage: error ? error.message : null,
      operationTime: new Date(),
      duration,
      createBy: user['username'] || '系统',
      updateBy: user['username'] || '系统',
    };

    // 异步保存操作日志
    this.operationLogService.create(operationLog).catch(err => {
      console.error('保存操作日志失败:', err);
    });
  }

  /**
   * 格式化操作内容
   */
  private formatContent(
    options: OperationLogOptions,
    request: Request,
    data?: any,
  ): string {
    if (options.content) {
      return options.content;
    }

    // 根据不同的操作类型生成默认内容
    const user = request.user || {};
    const username = user['username'] || '未知用户';
    
    switch (options.operationType) {
      case 'LOGIN':
        return `用户[${username}]登录系统`;
      case 'LOGOUT':
        return `用户[${username}]退出系统`;
      case 'INSERT':
        return `新增${options.module}`;
      case 'UPDATE':
        return `修改${options.module}`;
      case 'DELETE':
        return `删除${options.module}`;
      case 'EXPORT':
        return `导出${options.module}`;
      case 'IMPORT':
        return `导入${options.module}`;
      default:
        return `操作${options.module}`;
    }
  }

  /**
   * 处理请求参数，移除敏感信息
   */
  private sanitizeRequestParams(params: any): any {
    if (!params) {
      return params;
    }

    const sanitized = { ...params };
    
    // 移除敏感字段
    const sensitiveFields = ['password', 'newPassword', 'oldPassword', 'confirmPassword', 'token'];
    sensitiveFields.forEach(field => {
      if (sanitized[field] !== undefined) {
        sanitized[field] = '******';
      }
    });

    return sanitized;
  }
}
