import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsUUID,
  Length,
  IsInt,
  Min,
  IsEmail,
  IsEnum,
  IsMobilePhone,
} from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty({
    description: '部门名称',
    example: '研发部',
  })
  @IsNotEmpty({ message: '部门名称不能为空' })
  @Length(1, 50, { message: '部门名称长度为1-50个字符' })
  deptName: string;

  @ApiProperty({
    description: '父部门ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsUUID(4, { message: '父部门ID必须是有效的UUID' })
  parentId?: string | null = null;

  @ApiProperty({
    description: '显示顺序',
    example: 1,
    default: 0,
  })
  @IsOptional()
  @IsInt({ message: '显示顺序必须是整数' })
  @Min(0, { message: '显示顺序必须大于等于0' })
  orderNum?: number = 0;

  @ApiProperty({
    description: '负责人',
    example: '张三',
    required: false,
  })
  @IsOptional()
  @Length(1, 20, { message: '负责人长度为1-20个字符' })
  leader?: string;

  @ApiProperty({
    description: '联系电话',
    example: '13800000000',
    required: false,
  })
  @IsOptional()
  @Length(11, 11, { message: '联系电话必须是11位' })
  @IsMobilePhone('zh-CN', {}, { message: '联系电话格式不正确' })
  phone?: string;

  @ApiProperty({
    description: '邮箱',
    example: 'admin@example.com',
    required: false,
  })
  @IsOptional()
  @Length(5, 50, { message: '邮箱长度为5-50个字符' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  email?: string;

  @ApiProperty({
    description: '部门状态',
    example: 1,
    enum: [0, 1],
    default: 1,
    required: false,
  })
  @IsOptional()
  @IsEnum([0, 1], { message: '状态值必须是0或1' })
  status?: number = 1;
}
