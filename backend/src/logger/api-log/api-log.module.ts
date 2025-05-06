import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiLogController } from './api-log.controller';
import { ApiLogService } from './api-log.service';
import { ApiLogEntity } from './api-log.entity';
import { ApiLogInterceptor } from './interceptors/api-log.interceptor';
import { ApiExceptionFilter } from './filters/api-exception.filter';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApiLogEntity]),
  ],
  controllers: [ApiLogController],
  providers: [ApiLogService, ApiLogInterceptor, ApiExceptionFilter],
  exports: [ApiLogService, ApiLogInterceptor, ApiExceptionFilter],
})
export class ApiLogModule {}
