import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsUUID,
  Length,
  Matches,
} from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({ description: '权限名称', example: '用户查询' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  permName: string;

  @ApiProperty({
    description: '权限标识',
    example: 'system:user:query',
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  @Matches(/^[a-z][a-z0-9:]*$/i, {
    message: '权限标识只能包含字母、数字和冒号，且必须以字母开头',
  })
  permKey: string;

  @ApiProperty({
    description: '权限类型 0-菜单权限 1-操作权限 2-数据权限',
    example: 1,
  })
  @IsInt()
  @Min(0)
  @Max(2)
  permType: number;

  @ApiProperty({
    description: '父权限ID',
    example: '00000000-0000-0000-0000-000000000000',
    required: false,
  })
  @IsOptional()
  @IsString()
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
    example: 'user',
    required: false,
  })
  @IsOptional()
  @IsString()
  path?: string;

  @ApiProperty({
    description: '组件路径',
    example: 'system/user/index',
    required: false,
  })
  @IsOptional()
  @IsString()
  component?: string;

  @ApiProperty({
    description: '权限状态 0-禁用 1-正常',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1)
  status?: number = 1;

  @ApiProperty({
    description: '是否可见 0-隐藏 1-显示',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1)
  isVisible?: number = 1;

  @ApiProperty({
    description: '菜单图标',
    example: 'user',
    required: false,
  })
  @IsOptional()
  @IsString()
  icon?: string;
}
