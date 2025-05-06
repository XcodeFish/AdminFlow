import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiLogService } from '../api-log.service';
import { ErrorLevel } from '../../common/enums/logger.enum';
import { getClientIp } from '../../common/utils/ip.util';
import { parseUserAgent } from '../../common/utils/user-agent.util';
import { v4 as uuidv4 } from 'uuid';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  constructor(private readonly apiLogService: ApiLogService) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    
    // 获取异常信息
    const status = 
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    
    const message = 
      exception instanceof HttpException
        ? exception.message
        : exception.message || '内部服务器错误';

    // 确定错误级别
    let errorLevel = ErrorLevel.ERROR;
    if (status >= 400 && status < 500) {
      errorLevel = ErrorLevel.WARN;
    }

    // 生成唯一的跟踪ID
    const traceId = uuidv4();
    
    // 记录API日志
    const user = request.user || {};
    const apiLog = {
      traceId,
      requestUrl: request.originalUrl,
      requestMethod: request.method,
      requestIp: getClientIp(request),
      userAgent: parseUserAgent(request.headers['user-agent'] as string),
      userId: user['id'],
      username: user['username'] || '未知用户',
      requestHeaders: JSON.stringify(this.sanitizeHeaders(request.headers)),
      requestParams: JSON.stringify({
        query: request.query,
        body: this.sanitizeRequestBody(request.body),
        params: request.params,
      }),
      responseHeaders: JSON.stringify({}),
      responseBody: JSON.stringify({
        code: status,
        message,
        timestamp: Date.now(),
      }),
      status,
      errorLevel,
      errorMessage: message,
      stackTrace: exception.stack,
      duration: 0, // 异常情况下无法计算准确的持续时间
      requestTime: new Date(),
      responseTime: new Date(),
      createBy: user['username'] || '系统',
      updateBy: user['username'] || '系统',
    };

    // 异步保存API日志
    this.apiLogService.create(apiLog).catch(err => {
      console.error('保存API异常日志失败:', err);
    });

    // 构建错误响应
    const errorResponse = {
      code: status,
      message,
      timestamp: Date.now(),
      traceId,
    };

    // 设置跟踪ID到响应头
    response.setHeader('X-Trace-Id', traceId);
    
    // 发送错误响应
    response.status(status).json(errorResponse);
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
    sensitiveFields.forEach(field => {
      if (sanitized[field] !== undefined) {
        sanitized[field] = '******';
      }
    });

    return sanitized;
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
    const sensitiveFields = ['password', 'newPassword', 'oldPassword', 'confirmPassword', 'token'];
    sensitiveFields.forEach(field => {
      if (sanitized[field] !== undefined) {
        sanitized[field] = '******';
      }
    });

    return sanitized;
  }
}
