import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RoleEntity } from '../../user/entities/role.entity';

/**
 * 权限实体
 */
@Entity('sys_permission')
export class PermissionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 权限名称
   */
  @Column({ length: 50, comment: '权限名称' })
  permName: string;

  /**
   * 权限标识
   * 格式: 模块:资源:操作
   * 如: system:user:create
   */
  @Column({ length: 100, unique: true, comment: '权限标识' })
  permKey: string;

  /**
   * 权限类型
   * 0: 菜单权限
   * 1: 操作权限
   * 2: 数据权限
   */
  @Column({ type: 'smallint', comment: '权限类型: 0-菜单 1-操作 2-数据' })
  permType: number;

  /**
   * 父级权限ID
   */
  @Column({ type: 'uuid', nullable: true, comment: '父级权限ID' })
  parentId: string;

  /**
   * 显示顺序
   */
  @Column({ type: 'int', default: 0, comment: '显示顺序' })
  orderNum: number;

  /**
   * 路由地址
   */
  @Column({ length: 200, nullable: true, comment: '路由地址' })
  path: string;

  /**
   * 组件路径
   */
  @Column({ length: 255, nullable: true, comment: '组件路径' })
  component: string;

  /**
   * 权限状态
   * 0: 禁用
   * 1: 正常
   */
  @Column({ type: 'smallint', default: 1, comment: '状态: 0-禁用 1-正常' })
  status: number;

  /**
   * 是否可见
   * 0: 隐藏
   * 1: 显示
   */
  @Column({ type: 'smallint', default: 1, comment: '是否可见: 0-隐藏 1-显示' })
  isVisible: number;

  /**
   * 菜单图标
   */
  @Column({ length: 100, nullable: true, comment: '菜单图标' })
  icon: string;

  /**
   * 备注
   */
  @Column({ length: 500, nullable: true, comment: '备注' })
  remark: string;

  /**
   * 创建时间
   */
  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  /**
   * 更新时间
   */
  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  // 父权限关系
  @ManyToOne(() => PermissionEntity, (permission) => permission.children, {
    nullable: true,
  })
  @JoinColumn({ name: 'parent_id' })
  parent: PermissionEntity;

  // 子权限关系
  @OneToMany(() => PermissionEntity, (permission) => permission.parent)
  children: PermissionEntity[];

  // 与角色的多对多关系
  @ManyToMany(() => RoleEntity, (role) => role.permissions)
  roles: RoleEntity[];
}
