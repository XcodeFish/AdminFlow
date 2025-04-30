import { BaseEntity } from '@common/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToMany } from 'typeorm';
import { RoleEntity } from './role.entity';

@Entity('sys_permission')
export class PermissionEntity extends BaseEntity {
  @ApiProperty({
    description: '权限名称',
    example: '用户管理'
  })
  @Column({ name: 'perm_name', length: 50, comment: '权限名称' })
  permName: string;

  @ApiProperty({
    description: '权限标识',
    example: 'system:user:list'
  })
  @Column({ name: 'perm_key', length: 100, unique: true, comment: '权限标识' })
  permKey: string;

  @ApiProperty({
    description: '权限类型',
    example: 1,
    enum: [0, 1, 2]
  })
  @Column({ name: 'perm_type', type: 'tinyint', comment: '权限类型：0-菜单，1-按钮，2-接口' })
  permType: number;

  @ApiProperty({
    description: '父级ID',
    example: 0
  })
  @Column({ name: 'parent_id', default: 0, comment: '父级ID' })
  parentId: number;

  @ApiProperty({
    description: '排序',
    example: 1
  })
  @Column({ type: 'int', default: 0, comment: '显示顺序' })
  orderNum: number;

  @ApiProperty({
    description: '路由路径',
    example: 'user'
  })
  @Column({ length: 100, nullable: true, comment: '路由路径' })
  path: string;

  @ApiProperty({
    description: '组件路径',
    example: 'system/user/index'
  })
  @Column({ length: 100, nullable: true, comment: '组件路径' })
  component: string;

  @ApiProperty({
    description: '菜单图标',
    example: 'user'
  })
  @Column({ length: 50, nullable: true, comment: '菜单图标' })
  icon: string;

  @ApiProperty({
    description: '状态',
    example: 1,
    enum: [0, 1]
  })
  @Column({ type: 'tinyint', default: 1, comment: '状态：0-禁用，1-启用' })
  status: number;

  @ApiProperty({
    description: '是否可见',
    example: 1
  })
  @Column({ name: 'is_visible', type: 'tinyint', default: 1, comment: '是否可见：0-隐藏，1-显示' })
  isVisible: number;

  @ManyToMany(() => RoleEntity, role => role.permissions)
  roles: RoleEntity[];
}
