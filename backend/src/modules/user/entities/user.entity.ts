import { BaseEntity } from '@common/entities/base.entity';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinTable, ManyToMany, Index } from 'typeorm';
import { Exclude } from 'class-transformer';
import { RoleEntity } from './role.entity';

@Entity('sys_user')
export class UserEntity extends BaseEntity {
  @ApiProperty({
    description: '用户名',
    example: 'admin'
  })
  @Index('idx_username')
  @Column({ length: 50, unique: true, comment: '用户名' })
  username: string;

  @ApiHideProperty()
  @Exclude()
  @Column({ comment: '密码' })
  password: string;

  @ApiProperty({
    description: '昵称',
    example: '系统管理员'
  })
  @Column({ length: 50, nullable: true, comment: '昵称' })
  nickname: string;

  @ApiProperty({
    description: '真实姓名',
    example: '张三'
  })
  @Index('idx_real_name')
  @Column({ name: 'real_name', length: 50, nullable: true, comment: '真实姓名' })
  realName: string;

  @ApiProperty({
    description: '邮箱',
    example: 'admin@example.com'
  })
  @Index('idx_email')
  @Column({ length: 100, nullable: true, comment: '邮箱' })
  email: string;

  @ApiProperty({
    description: '手机号',
    example: '13800138000'
  })
  @Index('idx_phone')
  @Column({ length: 20, nullable: true, comment: '手机号' })
  phone: string;

  @ApiProperty({
    description: '性别',
    example: 1,
    enum: [0, 1, 2]
  })
  @Column({ type: 'tinyint', default: 0, comment: '性别：0-未知，1-男，2-女' })
  gender: number;

  @ApiProperty({
    description: '头像',
    example: 'https://example.com/avatar.png'
  })
  @Column({ length: 255, nullable: true, comment: '头像URL' })
  avatar: string;

  @ApiProperty({
    description: '备注',
    example: '系统管理员'
  })
  @Column({ length: 500, nullable: true, comment: '备注' })
  remark: string;

  @ApiProperty({
    description: '状态',
    example: 1,
    enum: [0, 1]
  })
  @Column({ type: 'tinyint', default: 1, comment: '状态：0-禁用，1-启用' })
  status: number;

  @ApiProperty({
    description: '部门ID',
    example: 1
  })
  @Column({ name: 'dept_id', nullable: true, comment: '部门ID' })
  deptId: number;

  @ApiProperty({
    description: '最后登录时间',
    example: '2023-01-01T08:00:00Z'
  })
  @Column({ name: 'last_login_time', nullable: true, comment: '最后登录时间' })
  lastLoginTime: Date;

  @ApiProperty({
    description: '用户角色',
    type: [RoleEntity]
  })
  @ManyToMany(() => RoleEntity, role => role.users)
  @JoinTable({
    name: 'sys_user_role',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' }
  })
  roles: RoleEntity[];
}
