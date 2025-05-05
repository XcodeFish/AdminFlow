import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';

export class QueryDepartmentDto extends BaseQueryDto {
  @ApiProperty({
    description: '部门名称',
    example: '研发部',
    required: false,
  })
  @IsOptional()
  @IsString()
  deptName?: string;

  @ApiProperty({
    description: '部门状态',
    example: 1,
    enum: [0, 1],
    required: false,
  })
  @IsOptional()
  @IsEnum([0, 1], { message: '状态值必须是0或1' })
  @Transform(({ value }) => parseInt(value, 10))
  status?: number;

  @ApiProperty({
    description: '父部门ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsOptional()
  @IsUUID(4, { message: '父部门ID必须是有效的UUID' })
  parentId?: string;
}
