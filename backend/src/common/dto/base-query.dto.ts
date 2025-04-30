import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class BaseQueryDto {
  @ApiProperty({
    description: '页码',
    required: false,
    default: 1,
    example: 1
  })
  @IsOptional()
  @IsInt({ message: '页码必须是整数' })
  @Min(1, { message: '页码不能小于1' })
  @Transform(({ value }) => parseInt(value, 10))
  page?: number = 1;

  @ApiProperty({
    description: '每页数量',
    required: false,
    default: 10,
    example: 10
  })
  @IsOptional()
  @IsInt({ message: '每页数量必须是整数' })
  @Min(1, { message: '每页数量不能小于1' })
  @Max(100, { message: '每页数量不能大于100' })
  @Transform(({ value }) => parseInt(value, 10))
  pageSize?: number = 10;

  @ApiProperty({
    description: '排序字段',
    required: false,
    example: 'createdAt'
  })
  @IsOptional()
  @IsString()
  orderBy?: string;

  @ApiProperty({
    description: '排序方式',
    required: false,
    enum: ['asc', 'desc'],
    default: 'desc',
    example: 'desc'
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'], { message: '排序方式必须是asc或desc' })
  orderType?: 'asc' | 'desc' = 'desc';

  @ApiProperty({
    description: '关键字搜索',
    required: false,
    example: 'admin'
  })
  @IsOptional()
  @IsString()
  searchKey?: string;
}
