import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { BaseQueryDto } from '@common/dto/base-query.dto';

export class UserQueryDto extends BaseQueryDto {
  @ApiProperty({
    description: '用户状态',
    required: false,
    enum: [0, 1],
    example: 1
  })
  @IsOptional()
  @IsEnum([0, 1], { message: '状态值必须是0或1' })
  @Transform(({ value }) => parseInt(value, 10))
  status?: number;

  @ApiProperty({
    description: '部门ID',
    required: false,
    example: 1
  })
  @IsOptional()
  @IsInt({ message: '部门ID必须是整数' })
  @Transform(({ value }) => parseInt(value, 10))
  deptId?: number;

  @ApiProperty({
    description: '角色ID',
    required: false,
    example: 1
  })
  @IsOptional()
  @IsInt({ message: '角色ID必须是整数' })
  @Transform(({ value }) => parseInt(value, 10))
  roleId?: number;
}
