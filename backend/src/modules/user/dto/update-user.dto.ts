import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
  IsArray,
  IsInt,
  Min,
  IsEnum,
  ArrayNotEmpty,
  IsUUID,
} from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    description: '昵称',
    example: '系统管理员',
    required: false
  })
  @IsOptional()
  @IsString()
  @Length(1, 50, { message: '昵称长度不能超过50个字符' })
  nickname?: string;

  @ApiProperty({
    description: '真实姓名',
    example: '张三',
    required: false
  })
  @IsOptional()
  @IsString()
  @Length(1, 50, { message: '真实姓名长度不能超过50个字符' })
  realName?: string;

  @ApiProperty({
    description: '邮箱',
    example: 'admin@example.com',
    required: false
  })
  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  email?: string;

  @ApiProperty({
    description: '手机号',
    example: '13800138000',
    required: false
  })
  @IsOptional()
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone?: string;

  @ApiProperty({
    description: '性别',
    example: 1,
    enum: [0, 1, 2],
    required: false
  })
  @IsOptional()
  @IsEnum([0, 1, 2], { message: '性别值必须是0、1或2' })
  gender?: number;

  @ApiProperty({
    description: '头像',
    example: 'https://example.com/avatar.png',
    required: false
  })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({
    description: '备注',
    example: '系统管理员',
    required: false
  })
  @IsOptional()
  @IsString()
  remark?: string;

  @ApiProperty({
    description: '状态',
    example: 1,
    enum: [0, 1],
    required: false
  })
  @IsOptional()
  @IsEnum([0, 1], { message: '状态值必须是0或1' })
  status?: number;

  @ApiProperty({
    description: '部门ID',
    example: 1,
    required: false
  })
  @IsOptional()
  @IsUUID(4, { message: '部门ID必须是有效的UUID' })
  deptId?: string;

  @ApiProperty({
    description: '角色ID列表',
    example: ['1', '2'],
    type: [String],
    required: false
  })
  @IsOptional()
  @IsArray({ message: '角色ID必须是数组' })
  @ArrayNotEmpty({ message: '至少选择一个角色' })
  @IsUUID(4, { each: true, message: '角色ID必须是有效的UUID' })
  roleIds?: string[];
}
