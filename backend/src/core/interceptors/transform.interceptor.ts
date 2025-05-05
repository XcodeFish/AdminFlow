import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { instanceToPlain } from 'class-transformer';
import { Result } from '../result/result'

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (data instanceof Result) {
          return instanceToPlain(data);
        }

        // 否则进行包装
        return {
          code: 200,
          data: data ? instanceToPlain(data) : data,
          message: '操作成功',
          timestamp: new Date().toISOString(),
        };
      }),
    );
    // return next.handle().pipe(
    //   map(data => ({
    //     code: 200,
    //     data: data ? instanceToPlain(data) : data,
    //     message: '操作成功',
    //     timestamp: new Date().toISOString(),
    //   })),
    // );
  }
}
