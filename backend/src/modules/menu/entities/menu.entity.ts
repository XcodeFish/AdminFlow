import { BaseEntity } from '@common/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { RoleEntity } from '../../user/entities/role.entity';

@Entity('sys_menu')
export class MenuEntity extends BaseEntity {
  @ApiProperty({
    description: '菜单名称',
    example: '系统管理',
  })
  @Column({ name: 'menu_name', length: 50, comment: '菜单名称' })
  menuName: string;

  @ApiProperty({
    description: '父菜单ID',
    example: '1',
    nullable: true,
  })
  @Column({ name: 'parent_id', nullable: true, comment: '父菜单ID' })
  parentId: string;

  @ApiProperty({
    description: '显示顺序',
    example: 1,
  })
  @Column({ name: 'order_num', type: 'int', default: 0, comment: '显示顺序' })
  orderNum: number;

  @ApiProperty({
    description: '路由地址',
    example: '/system/user',
    nullable: true,
  })
  @Column({ length: 200, nullable: true, comment: '路由地址' })
  path: string;

  @ApiProperty({
    description: '组件路径',
    example: 'system/user/index',
    nullable: true,
  })
  @Column({ length: 255, nullable: true, comment: '组件路径' })
  component: string;

  @ApiProperty({
    description: '路由参数',
    example: '{"id": 1}',
    nullable: true,
  })
  @Column({ length: 255, nullable: true, comment: '路由参数' })
  query: string;

  @ApiProperty({
    description: '是否为外链',
    example: 0,
    enum: [0, 1],
  })
  @Column({
    name: 'is_external',
    type: 'tinyint',
    default: 0,
    comment: '是否为外链（0否 1是）',
  })
  isExternal: number;

  @ApiProperty({
    description: '是否缓存',
    example: 0,
    enum: [0, 1],
  })
  @Column({
    name: 'is_cache',
    type: 'tinyint',
    default: 0,
    comment: '是否缓存（0不缓存 1缓存）',
  })
  isCache: number;

  @ApiProperty({
    description: '菜单类型',
    example: 'C',
    enum: ['M', 'C', 'F'],
  })
  @Column({
    name: 'menu_type',
    type: 'char',
    length: 1,
    comment: '菜单类型（M目录 C菜单 F按钮）',
  })
  menuType: string;

  @ApiProperty({
    description: '菜单状态',
    example: 1,
    enum: [0, 1],
  })
  @Column({
    name: 'is_visible',
    type: 'tinyint',
    default: 1,
    comment: '菜单状态（0隐藏 1显示）',
  })
  isVisible: number;

  @ApiProperty({
    description: '菜单状态',
    example: 1,
    enum: [0, 1],
  })
  @Column({
    type: 'tinyint',
    default: 1,
    comment: '菜单状态（0停用 1正常）',
  })
  status: number;

  @ApiProperty({
    description: '权限标识',
    example: 'system:user:list',
    nullable: true,
  })
  @Column({ length: 100, nullable: true, comment: '权限标识' })
  perms: string;

  @ApiProperty({
    description: '菜单图标',
    example: 'user',
    nullable: true,
  })
  @Column({ length: 100, nullable: true, comment: '菜单图标' })
  icon: string;

  @ApiProperty({
    description: '备注',
    example: '用户管理菜单',
    nullable: true,
  })
  @Column({ length: 500, nullable: true, comment: '备注' })
  remark: string;

  // 父菜单关系
  @ManyToOne(() => MenuEntity, (menu) => menu.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: MenuEntity;

  // 子菜单关系
  @OneToMany(() => MenuEntity, (menu) => menu.parent)
  children: MenuEntity[];

  // 角色与菜单的多对多关系
  @ManyToMany(() => RoleEntity, (role) => role.menus)
  @JoinTable({
    name: 'sys_role_menu',
    joinColumn: { name: 'menu_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: RoleEntity[];
}
