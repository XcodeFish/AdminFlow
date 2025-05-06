import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsDateString, IsString, IsNumber, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { OperationType, OperationStatus } from '../../common/enums/logger.enum';

/**
 * 操作日志查询DTO
 */
export class OperationLogQueryDto {
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

  @ApiPropertyOptional({ description: '操作用户名', example: 'admin' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ 
    description: '操作类型', 
    enum: OperationType,
    example: OperationType.INSERT 
  })
  @IsOptional()
  @IsEnum(OperationType)
  operationType?: string;

  @ApiPropertyOptional({ description: '操作模块', example: '用户管理' })
  @IsOptional()
  @IsString()
  module?: string;

  @ApiPropertyOptional({ 
    description: '操作状态', 
    enum: OperationStatus,
    example: OperationStatus.SUCCESS
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  status?: number;
}

/**
 * 操作日志详情DTO
 */
export class OperationLogDetailDto {
  @ApiProperty({ description: '日志ID' })
  id: number;

  @ApiProperty({ description: '操作用户名' })
  username: string;

  @ApiProperty({ description: '用户昵称' })
  nickname: string;

  @ApiProperty({ description: '操作类型', enum: OperationType })
  operationType: string;

  @ApiProperty({ description: '操作名称' })
  operationName: string;

  @ApiProperty({ description: '操作模块' })
  module: string;

  @ApiProperty({ description: '操作内容' })
  content: string;

  @ApiProperty({ description: '请求参数' })
  requestParams: any;

  @ApiProperty({ description: '响应结果' })
  responseResult: any;

  @ApiProperty({ description: 'IP地址' })
  ip: string;

  @ApiProperty({ description: 'IP所属地区' })
  location: string;

  @ApiProperty({ description: '用户代理' })
  userAgent: string;

  @ApiProperty({ description: '请求方法' })
  requestMethod: string;

  @ApiProperty({ description: '请求URL' })
  requestUrl: string;

  @ApiProperty({ description: '操作状态', enum: OperationStatus })
  status: number;

  @ApiProperty({ description: '错误信息' })
  errorMessage: string;

  @ApiProperty({ description: '操作时间' })
  operationTime: Date;

  @ApiProperty({ description: '操作耗时(毫秒)' })
  duration: number;
}

/**
 * 删除操作日志DTO
 */
export class DeleteOperationLogDto {
  @ApiProperty({ description: '日志ID数组', type: [Number] })
  @IsArray()
  @Type(() => Number)
  ids: number[];
}
