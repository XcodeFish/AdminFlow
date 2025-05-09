import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  IsArray,
  IsInt,
  Min,
  Max,
  ArrayNotEmpty,
  IsEnum,
  IsUUID,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: '用户名',
    example: 'admin',
    minLength: 2,
    maxLength: 20,
  })
  @IsNotEmpty({ message: '用户名不能为空' })
  @Length(2, 20, { message: '用户名长度为4-20个字符' })
  @IsString()
  username: string;

  @ApiProperty({
    description: '密码',
    example: 'Admin@123',
    minLength: 6,
    maxLength: 20,
  })
  @IsNotEmpty({ message: '密码不能为空' })
  @Length(6, 20, { message: '密码长度为6-20个字符' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{6,20}$/, {
    message: '密码必须包含大小写字母和数字，长度6-20位',
  })
  password: string;

  @ApiProperty({
    description: '昵称',
    example: '系统管理员',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(1, 50, { message: '昵称长度不能超过50个字符' })
  nickname?: string;

  @ApiProperty({
    description: '真实姓名',
    example: '张三',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(1, 50, { message: '真实姓名长度不能超过50个字符' })
  realName?: string;

  @ApiProperty({
    description: '邮箱',
    example: 'admin@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  email?: string;

  @ApiProperty({
    description: '手机号',
    example: '13800138000',
    required: false,
  })
  @IsOptional()
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone?: string;

  @ApiProperty({
    description: '性别',
    example: 1,
    enum: [0, 1, 2],
    required: false,
  })
  @IsOptional()
  @IsEnum([0, 1, 2], { message: '性别值必须是0、1或2' })
  gender?: number;

  @ApiProperty({
    description: '头像',
    example: 'https://example.com/avatar.png',
    required: false,
  })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({
    description: '备注',
    example: '系统管理员',
    required: false,
  })
  @IsOptional()
  @IsString()
  remark?: string;

  @ApiProperty({
    description: '状态',
    example: 1,
    enum: [0, 1],
    default: 1,
    required: false,
  })
  @IsOptional()
  @IsEnum([0, 1], { message: '状态值必须是0或1' })
  status?: number;

  @ApiProperty({
    description: '部门ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsOptional()
  @IsUUID(4, { message: '部门ID必须是有效的UUID' })
  deptId?: string;

  @ApiProperty({
    description: '角色ID列表',
    example: [1, 2],
    type: [Number],
    required: false,
  })
  @IsOptional()
  @IsArray({ message: '角色ID必须是数组' })
  @ArrayNotEmpty({ message: '至少选择一个角色' })
  @IsInt({ each: true, message: '角色ID必须是整数' })
  @Min(1, { each: true, message: '角色ID必须大于0' })
  roleIds?: number[];
}
