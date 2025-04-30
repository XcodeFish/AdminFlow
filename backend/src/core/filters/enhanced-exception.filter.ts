import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Catch()
export class EnhancedExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(EnhancedExceptionFilter.name);

  constructor(private configService: ConfigService) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '服务器内部错误';
    let code = 'INTERNAL_SERVER_ERROR';
    let data = null;

    // 处理HTTP异常
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || exception.message;
        code = (exceptionResponse as any).error || HttpStatus[status];
        data = (exceptionResponse as any).data || null;
      }
    } else {
      // 处理非HTTP异常
      message = exception.message || '服务器内部错误';
    }

    // 记录错误日志
    this.logger.error({
      message: `${request.method} ${request.url} - ${status} ${message}`,
      exception,
      stack: exception.stack,
      requestBody: request.body,
      requestParams: request.params,
      requestQuery: request.query,
      timestamp: new Date().toISOString(),
    });

    // 不在生产环境下返回堆栈信息
    const errorResponse: any = {
      statusCode: status,
      message,
      code,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (data) {
      errorResponse.data = data;
    }

    if (this.configService.get('app.nodeEnv') !== 'production') {
      errorResponse.stack = exception.stack;
    }

    response.status(status).json(errorResponse);
  }
}
