import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ApiLogService } from '../api-log.service';
import { ErrorLevel } from '../../common/enums/logger.enum';
import { getClientIp } from '../../common/utils/ip.util';
import { parseUserAgent } from '../../common/utils/user-agent.util';

@Injectable()
export class ApiLogInterceptor implements NestInterceptor {
  constructor(private readonly apiLogService: ApiLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // 如果是Swagger等不需要记录的路径，直接放行
    const request = context.switchToHttp().getRequest<Request>();
    if (this.isExcludedPath(request.path)) {
      return next.handle();
    }

    const traceId = uuidv4();
    const startTime = Date.now();
    const requestTime = new Date();

    // 设置追踪ID到响应头
    const response = context.switchToHttp().getResponse<Response>();
    response.setHeader('X-Trace-Id', traceId);

    return next.handle().pipe(
      tap({
        next: (data) => {
          // 记录成功响应
          this.saveApiLog(context, traceId, startTime, requestTime, data);
        },
        error: (error) => {
          // 记录错误响应
          this.saveApiLog(
            context,
            traceId,
            startTime,
            requestTime,
            null,
            error,
          );
        },
      }),
    );
  }

  /**
   * 保存API日志
   */
  private async saveApiLog(
    context: ExecutionContext,
    traceId: string,
    startTime: number,
    requestTime: Date,
    data?: any,
    error?: Error,
  ): Promise<void> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const duration = Date.now() - startTime;
    const responseTime = new Date();
    const user = request.user || {}; // 假设用户信息在request.user中
    const status = error ? error['status'] || 500 : response.statusCode || 200;

    // 获取错误级别
    let errorLevel = ErrorLevel.INFO;
    if (status >= 400 && status < 500) {
      errorLevel = ErrorLevel.WARN;
    } else if (status >= 500) {
      errorLevel = ErrorLevel.ERROR;
    }

    // 构建API日志对象
    const apiLog = {
      traceId,
      requestUrl: request.originalUrl,
      requestMethod: request.method,
      requestIp: getClientIp(request),
      userAgent: parseUserAgent(request.headers['user-agent'] as string),
      userId: user['id'],
      username: user['username'] || '未知用户',
      requestHeaders: JSON.stringify(this.sanitizeHeaders(request.headers)),
      requestParams: JSON.stringify(this.getRequestParams(request)),
      responseHeaders: JSON.stringify(this.getResponseHeaders(response)),
      responseBody: JSON.stringify(this.sanitizeResponseBody(data)),
      status,
      errorLevel,
      errorMessage: error ? error.message : null,
      stackTrace: error ? error.stack : null,
      duration,
      requestTime,
      responseTime,
      createBy: user['username'] || '系统',
      updateBy: user['username'] || '系统',
    };

    // 异步保存API日志
    this.apiLogService.create(apiLog).catch((err) => {
      console.error('保存API日志失败:', err);
    });
  }

  /**
   * 处理请求头，移除敏感信息
   */
  private sanitizeHeaders(headers: any): any {
    if (!headers) {
      return headers;
    }

    const sanitized = { ...headers };

    // 移除敏感字段
    const sensitiveFields = ['authorization', 'cookie', 'x-api-key'];
    sensitiveFields.forEach((field) => {
      if (sanitized[field] !== undefined) {
        sanitized[field] = '******';
      }
    });

    return sanitized;
  }

  /**
   * 处理响应体，移除敏感信息或截断大数据
   */
  private sanitizeResponseBody(body: any): any {
    if (!body) {
      return body;
    }

    // 如果响应体太大，截断避免日志膨胀
    const bodyStr = JSON.stringify(body);
    if (bodyStr.length > 10000) {
      return {
        _truncated: true,
        message: `Response body too large (${bodyStr.length} bytes), truncated`,
      };
    }

    return body;
  }

  /**
   * 获取请求参数，合并query和body
   */
  private getRequestParams(request: Request): any {
    return {
      query: request.query,
      body: this.sanitizeRequestBody(request.body),
      params: request.params,
    };
  }

  /**
   * 处理请求体，移除敏感信息
   */
  private sanitizeRequestBody(body: any): any {
    if (!body) {
      return body;
    }

    const sanitized = { ...body };

    // 移除敏感字段
    const sensitiveFields = [
      'password',
      'newPassword',
      'oldPassword',
      'confirmPassword',
      'token',
    ];
    sensitiveFields.forEach((field) => {
      if (sanitized[field] !== undefined) {
        sanitized[field] = '******';
      }
    });

    return sanitized;
  }

  /**
   * 获取响应头
   */
  private getResponseHeaders(response: Response): any {
    return response.getHeaders();
  }

  /**
   * 检查是否是排除记录的路径
   */
  private isExcludedPath(path: string): boolean {
    // 排除swagger文档路径、健康检查等
    const excludePaths = ['/api-docs', '/swagger', '/health', '/favicon.ico'];

    return excludePaths.some((excludePath) => path.startsWith(excludePath));
  }
}
