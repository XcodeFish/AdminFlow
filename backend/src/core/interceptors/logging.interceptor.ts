import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  constructor(private configService: ConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const userAgent = request.get('user-agent') || '';
    const { ip, method, originalUrl: url } = request;

    const startTime = Date.now();
    const requestId = this.generateRequestId();

    // 添加请求ID到响应头，便于追踪
    response.setHeader('X-Request-ID', requestId);

    // 安全相关头部
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('X-XSS-Protection', '1; mode=block');
    response.setHeader('X-Frame-Options', 'DENY');

    if (this.configService.get('app.nodeEnv') === 'production') {
      response.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }

    // 记录请求开始
    this.logger.log({
      message: `Request started: ${method} ${url}`,
      requestId,
      method,
      url,
      ip,
      userAgent,
      body: this.sanitizeRequestBody(request.body),
      query: request.query,
      params: request.params,
      timestamp: new Date().toISOString(),
    });

    return next.handle().pipe(
      tap(data => {
        const responseTime = Date.now() - startTime;

        // 记录请求完成
        this.logger.log({
          message: `Request completed: ${method} ${url} ${response.statusCode} ${responseTime}ms`,
          requestId,
          method,
          url,
          statusCode: response.statusCode,
          responseTime,
          timestamp: new Date().toISOString(),
        });
      }),
      catchError(error => {
        const responseTime = Date.now() - startTime;

        // 记录请求错误
        this.logger.error({
          message: `Request failed: ${method} ${url} ${responseTime}ms`,
          requestId,
          method,
          url,
          error: error.message,
          stack: error.stack,
          responseTime,
          timestamp: new Date().toISOString(),
        });

        throw error;
      }),
    );
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private sanitizeRequestBody(body: any): any {
    if (!body) return body;

    // 创建深拷贝
    const sanitized = JSON.parse(JSON.stringify(body));

    // 敏感字段列表
    const sensitiveFields = ['password', 'token', 'refreshToken', 'secret', 'creditCard'];

    // 递归查找并遮蔽敏感字段
    this.maskSensitiveData(sanitized, sensitiveFields);

    return sanitized;
  }

  private maskSensitiveData(obj: any, sensitiveFields: string[]): void {
    if (typeof obj !== 'object' || obj === null) return;

    for (const key in obj) {
      if (sensitiveFields.includes(key) && typeof obj[key] === 'string') {
        obj[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object') {
        this.maskSensitiveData(obj[key], sensitiveFields);
      }
    }
  }
}
