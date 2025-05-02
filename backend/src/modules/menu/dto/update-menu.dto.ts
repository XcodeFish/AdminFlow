import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  IsIn,
  Length,
  IsUUID,
} from 'class-validator';

export class UpdateMenuDto {
  @ApiProperty({
    description: '菜单名称',
    example: '系统管理',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  menuName?: string;

  @ApiProperty({
    description: '父菜单ID',
    example: '1',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiProperty({
    description: '显示顺序',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  orderNum?: number;

  @ApiProperty({
    description: '路由地址',
    example: '/system/user',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 200)
  path?: string;

  @ApiProperty({
    description: '组件路径',
    example: 'system/user/index',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  component?: string;

  @ApiProperty({
    description: '路由参数',
    example: '{"id": 1}',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  query?: string;

  @ApiProperty({
    description: '是否为外链',
    example: 0,
    enum: [0, 1],
    required: false,
  })
  @IsOptional()
  @IsInt()
  @IsIn([0, 1])
  isExternal?: number;

  @ApiProperty({
    description: '是否缓存',
    example: 0,
    enum: [0, 1],
    required: false,
  })
  @IsOptional()
  @IsInt()
  @IsIn([0, 1])
  isCache?: number;

  @ApiProperty({
    description: '菜单类型',
    example: 'C',
    enum: ['M', 'C', 'F'],
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(['M', 'C', 'F'])
  menuType?: string;

  @ApiProperty({
    description: '菜单显示状态',
    example: 1,
    enum: [0, 1],
    required: false,
  })
  @IsOptional()
  @IsInt()
  @IsIn([0, 1])
  isVisible?: number;

  @ApiProperty({
    description: '菜单状态',
    example: 1,
    enum: [0, 1],
    required: false,
  })
  @IsOptional()
  @IsInt()
  @IsIn([0, 1])
  status?: number;

  @ApiProperty({
    description: '权限标识',
    example: 'system:user:list',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  perms?: string;

  @ApiProperty({
    description: '菜单图标',
    example: 'user',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  icon?: string;

  @ApiProperty({
    description: '备注',
    example: '用户管理菜单',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  remark?: string;
}
