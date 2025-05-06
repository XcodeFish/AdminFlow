import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OperationLogController } from './operation-log.controller';
import { OperationLogService } from './operation-log.service';
import { OperationLogEntity } from './operation-log.entity';
import { OperationLogInterceptor } from './interceptors/operation-log.interceptor';

@Module({
  imports: [
    TypeOrmModule.forFeature([OperationLogEntity]),
  ],
  controllers: [OperationLogController],
  providers: [OperationLogService, OperationLogInterceptor],
  exports: [OperationLogService, OperationLogInterceptor],
})
export class OperationLogModule {}
