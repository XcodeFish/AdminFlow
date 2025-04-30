import { ApiProperty } from '@nestjs/swagger';

export class RoleResponseDto {
  @ApiProperty({
    description: '角色ID',
    example: 1
  })
  id: number;

  @ApiProperty({
    description: '角色名称',
    example: '系统管理员'
  })
  roleName: string;

  @ApiProperty({
    description: '角色标识',
    example: 'admin'
  })
  roleKey: string;

  @ApiProperty({
    description: '排序',
    example: 1
  })
  orderNum: number;

  @ApiProperty({
    description: '状态',
    example: 1,
    enum: [0, 1]
  })
  status: number;

  @ApiProperty({
    description: '备注',
    example: '系统管理员'
  })
  remark: string;

  @ApiProperty({
    description: '数据权限范围',
    example: 1,
    enum: [1, 2, 3, 4, 5]
  })
  dataScope: number;
}
