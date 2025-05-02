import { BaseEntity } from '@common/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { PermissionEntity } from './permission.entity';
import { MenuEntity } from '../../menu/entities/menu.entity';

@Entity('sys_role')
export class RoleEntity extends BaseEntity {
  @ApiProperty({
    description: '角色名称',
    example: '系统管理员',
  })
  @Column({ name: 'role_name', length: 50, comment: '角色名称' })
  roleName: string;

  @ApiProperty({
    description: '角色标识',
    example: 'admin',
  })
  @Column({ name: 'role_key', length: 50, unique: true, comment: '角色标识' })
  roleKey: string;

  @ApiProperty({
    description: '排序',
    example: 1,
  })
  @Column({ type: 'int', default: 0, comment: '显示顺序' })
  orderNum: number;

  @ApiProperty({
    description: '状态',
    example: 1,
    enum: [0, 1],
  })
  @Column({ type: 'tinyint', default: 1, comment: '状态：0-禁用，1-启用' })
  status: number;

  @ApiProperty({
    description: '备注',
    example: '系统管理员',
  })
  @Column({ length: 500, nullable: true, comment: '备注' })
  remark: string;

  @ApiProperty({
    description: '数据权限范围',
    example: 1,
    enum: [1, 2, 3, 4, 5],
  })
  @Column({
    name: 'data_scope',
    type: 'tinyint',
    default: 1,
    comment: '数据范围：1-全部，2-自定义，3-本部门，4-本部门及以下，5-仅本人',
  })
  dataScope: number;

  @ApiProperty({
    description: '父角色ID',
    example: '1',
    nullable: true,
  })
  @Column({ name: 'parent_id', nullable: true, comment: '父角色ID' })
  parentId: string;

  // 父角色关系
  @ManyToOne(() => RoleEntity, (role) => role.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: RoleEntity;

  // 子角色关系
  @OneToMany(() => RoleEntity, (role) => role.parent)
  children: RoleEntity[];

  @ManyToMany(() => UserEntity, (user) => user.roles)
  users: UserEntity[];

  @ManyToMany(() => PermissionEntity, (permission) => permission.roles)
  @JoinTable({
    name: 'sys_role_permission',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: PermissionEntity[];

  @ManyToMany(() => MenuEntity, (menu) => menu.roles)
  menus: MenuEntity[];
}
