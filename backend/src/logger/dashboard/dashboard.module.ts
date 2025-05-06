import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { OperationLogEntity } from '../operation-log/operation-log.entity';
import { ApiLogEntity } from '../api-log/api-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([OperationLogEntity, ApiLogEntity]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
