import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { TimeGranularity } from '../../common/enums/logger.enum';

/**
 * 日志统计查询DTO
 */
export class LogStatsQueryDto {
  @ApiProperty({ description: '开始时间', example: '2023-05-01T00:00:00Z' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ description: '结束时间', example: '2023-05-10T23:59:59Z' })
  @IsDateString()
  endTime: string;

  @ApiPropertyOptional({
    description: '时间粒度',
    enum: TimeGranularity,
    default: TimeGranularity.DAY,
  })
  @IsOptional()
  @IsEnum(TimeGranularity)
  timeGranularity?: TimeGranularity = TimeGranularity.DAY;
}

/**
 * 操作日志统计结果DTO
 */
export class OperationLogStatsDto {
  @ApiProperty({ description: '各操作类型的操作次数' })
  operationTypesCount: Record<string, number>;

  @ApiProperty({ description: '操作成功与失败的次数' })
  operationStatusCount: { success: number; fail: number };

  @ApiProperty({ description: '操作最频繁的模块TOP10' })
  topModules: Array<{ name: string; count: number }>;

  @ApiProperty({ description: '操作最频繁的用户TOP10' })
  topUsers: Array<{ username: string; count: number }>;

  @ApiProperty({ description: '按时间粒度统计的操作次数分布' })
  timeDistribution: Array<{ time: string; count: number }>;
}

/**
 * 接口日志统计结果DTO
 */
export class ApiLogStatsDto {
  @ApiProperty({ description: '各HTTP方法的请求次数' })
  methodCount: Record<string, number>;

  @ApiProperty({ description: '各HTTP状态码的分布' })
  statusCount: Record<string, number>;

  @ApiProperty({ description: '响应最慢的接口TOP10' })
  topSlowApis: Array<{ 
    url: string; 
    method: string; 
    avgDuration: number; 
    count: number 
  }>;

  @ApiProperty({ description: '错误率最高的接口TOP10' })
  topErrorApis: Array<{ 
    url: string; 
    method: string; 
    errorCount: number; 
    totalCount: number 
  }>;

  @ApiProperty({ description: '按时间粒度统计的请求次数和平均响应时间' })
  timeDistribution: Array<{ 
    time: string; 
    count: number; 
    avgDuration: number 
  }>;
}
