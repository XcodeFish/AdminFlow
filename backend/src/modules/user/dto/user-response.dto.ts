import { ApiProperty } from '@nestjs/swagger';
import { RoleResponseDto } from './role-response.dto';

export class UserResponseDto {
  @ApiProperty({
    description: '用户ID',
    example: 1
  })
  id: string;

  @ApiProperty({
    description: '用户名',
    example: 'admin'
  })
  username: string;

  @ApiProperty({
    description: '昵称',
    example: '系统管理员'
  })
  nickname: string;

  @ApiProperty({
    description: '真实姓名',
    example: '张三'
  })
  realName: string;

  @ApiProperty({
    description: '邮箱',
    example: 'admin@example.com'
  })
  email: string;

  @ApiProperty({
    description: '手机号',
    example: '13800138000'
  })
  phone: string;

  @ApiProperty({
    description: '性别',
    example: 1,
    enum: [0, 1, 2]
  })
  gender: number;

  @ApiProperty({
    description: '头像',
    example: 'https://example.com/avatar.png'
  })
  avatar: string;

  @ApiProperty({
    description: '状态',
    example: 1,
    enum: [0, 1]
  })
  status: number;

  @ApiProperty({
    description: '部门ID',
    example: 1
  })
  deptId: number;

  @ApiProperty({
    description: '角色列表',
    type: [RoleResponseDto]
  })
  roles: RoleResponseDto[];

  @ApiProperty({
    description: '创建时间',
    example: '2023-01-01T08:00:00Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: '最后登录时间',
    example: '2023-01-01T08:00:00Z'
  })
  lastLoginTime: Date;
}
