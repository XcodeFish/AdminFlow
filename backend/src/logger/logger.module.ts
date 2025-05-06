import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OperationLogModule } from './operation-log/operation-log.module';
import { ApiLogModule } from './api-log/api-log.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [OperationLogModule, ApiLogModule, DashboardModule],
  exports: [OperationLogModule, ApiLogModule, DashboardModule],
})
export class LoggerModule {}
