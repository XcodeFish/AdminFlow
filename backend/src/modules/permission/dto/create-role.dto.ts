import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  IsOptional,
  Length,
  Matches,
} from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ description: '角色名称', example: '系统管理员' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  roleName: string;

  @ApiProperty({
    description: '角色标识',
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  @Matches(/^[a-zA-Z][a-zA-Z0-9_]*$/, {
    message: '角色标识只能包含字母、数字和下划线，且必须以字母开头',
  })
  roleKey: string;

  @ApiProperty({
    description: '数据权限: 1-全部 2-自定义 3-本部门 4-部门及以下 5-仅本人',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  dataScope?: number = 1;

  @ApiProperty({
    description: '父角色ID',
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
  orderNum?: number = 0;

  @ApiProperty({
    description: '角色状态 0-禁用 1-正常',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1)
  status?: number = 1;

  @ApiProperty({
    description: '备注',
    example: '系统管理员角色',
    required: false,
  })
  @IsOptional()
  @IsString()
  remark?: string;
}
