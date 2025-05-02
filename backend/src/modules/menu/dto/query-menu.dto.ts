import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn, Length } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryMenuDto {
  @ApiProperty({
    description: '菜单名称',
    example: '系统管理',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 50)
  menuName?: string;

  @ApiProperty({
    description: '菜单状态',
    example: 1,
    enum: [0, 1],
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(['0', '1'])
  status?: string;

  @ApiProperty({
    description: '页码',
    example: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({
    description: '每页数量',
    example: 10,
    required: false,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;
}
