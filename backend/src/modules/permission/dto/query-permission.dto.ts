import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryPermissionDto {
  @ApiProperty({
    description: '权限名称',
    required: false,
  })
  @IsOptional()
  @IsString()
  permName?: string;

  @ApiProperty({
    description: '权限类型: 0-菜单 1-操作 2-数据',
    required: false,
    enum: [0, 1, 2],
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  permType?: number;

  @ApiProperty({
    description: '状态: 0-禁用 1-正常',
    required: false,
    enum: [0, 1],
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  status?: number;
}
