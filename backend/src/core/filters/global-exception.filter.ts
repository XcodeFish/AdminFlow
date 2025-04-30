import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '服务器内部错误';
    let code = 50000;
    let details = null;

    // 处理HTTP异常
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;

      if (typeof exceptionResponse === 'object') {
        message = exceptionResponse.message || exception.message;
        details = exceptionResponse.details || exceptionResponse.error;
        code = exceptionResponse.code || status * 100; // 默认错误码
      } else {
        message = exceptionResponse || exception.message;
        code = status * 100;
      }
    }

    // 处理数据库异常
    if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST;
      code = 50001;
      message = '数据库操作失败';

      // 检测唯一约束冲突
      if (exception.message.includes('duplicate key') || exception.message.includes('UNIQUE constraint failed')) {
        code = 40901;
        message = '数据已存在，违反唯一约束';
      }
    }

    // 记录错误日志
    this.logger.error(
      `请求异常: ${request.method} ${request.url} - ${status} ${message}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    // 返回统一的响应格式
    response.status(status).json({
      code,
      message,
      details,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
