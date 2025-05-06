import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsDateString, IsString, IsNumber, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ErrorLevel } from '../../common/enums/logger.enum';

/**
 * 接口日志查询DTO
 */
export class ApiLogQueryDto {
  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页条数', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pageSize?: number = 10;

  @ApiPropertyOptional({ description: '开始时间', example: '2023-05-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiPropertyOptional({ description: '结束时间', example: '2023-05-10T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  endTime?: string;

  @ApiPropertyOptional({ description: '请求URL', example: '/api/v1/users' })
  @IsOptional()
  @IsString()
  requestUrl?: string;

  @ApiPropertyOptional({ description: '请求方法', example: 'POST' })
  @IsOptional()
  @IsString()
  requestMethod?: string;

  @ApiPropertyOptional({ description: 'HTTP状态码', example: 200 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  status?: number;

  @ApiPropertyOptional({
    description: '错误级别',
    enum: ErrorLevel,
    example: ErrorLevel.ERROR
  })
  @IsOptional()
  @IsEnum(ErrorLevel)
  errorLevel?: string;

  @ApiPropertyOptional({ description: '最小耗时(毫秒)', example: 500 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minDuration?: number;
}

/**
 * 接口日志详情DTO
 */
export class ApiLogDetailDto {
  @ApiProperty({ description: '日志ID' })
  id: number;

  @ApiProperty({ description: '追踪ID' })
  traceId: string;

  @ApiProperty({ description: '请求URL' })
  requestUrl: string;

  @ApiProperty({ description: '请求方法' })
  requestMethod: string;

  @ApiProperty({ description: '请求IP' })
  requestIp: string;

  @ApiProperty({ description: '用户代理' })
  userAgent: string;

  @ApiProperty({ description: '用户ID' })
  userId: number;

  @ApiProperty({ description: '用户名' })
  username: string;

  @ApiProperty({ description: '请求头' })
  requestHeaders: any;

  @ApiProperty({ description: '请求参数' })
  requestParams: any;

  @ApiProperty({ description: '响应头' })
  responseHeaders: any;

  @ApiProperty({ description: '响应体' })
  responseBody: any;

  @ApiProperty({ description: 'HTTP状态码' })
  status: number;

  @ApiProperty({ description: '错误级别', enum: ErrorLevel })
  errorLevel: string;

  @ApiProperty({ description: '错误信息' })
  errorMessage: string;

  @ApiProperty({ description: '错误堆栈' })
  stackTrace: string;

  @ApiProperty({ description: '请求耗时(毫秒)' })
  duration: number;

  @ApiProperty({ description: '请求时间' })
  requestTime: Date;

  @ApiProperty({ description: '响应时间' })
  responseTime: Date;
}

/**
 * 删除接口日志DTO
 */
export class DeleteApiLogDto {
  @ApiProperty({ description: '日志ID数组', type: [Number] })
  @IsArray()
  @Type(() => Number)
  ids: number[];
}
