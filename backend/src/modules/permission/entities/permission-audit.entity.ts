// /src/modules/permission/entities/permission-audit.entity.ts

import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

/**
 * 权限审计日志实体
 */
@Entity('sys_permission_audit')
export class PermissionAuditEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 操作类型
   * 1: 角色权限变更
   * 2: 用户角色变更
   */
  @Column({
    type: 'smallint',
    comment: '操作类型: 1-角色权限变更 2-用户角色变更',
  })
  operationType: number;

  /**
   * 目标ID（角色ID或用户ID）
   */
  @Column({ type: 'uuid', comment: '目标ID(角色ID或用户ID)' })
  targetId: string;

  /**
   * 目标名称（角色名称或用户名）
   */
  @Column({ length: 50, comment: '目标名称(角色名称或用户名)' })
  targetName: string;

  /**
   * 变更前数据（JSON格式）
   */
  @Column({ type: 'json', comment: '变更前数据' })
  beforeData: any;

  /**
   * 变更后数据（JSON格式）
   */
  @Column({ type: 'json', comment: '变更后数据' })
  afterData: any;

  /**
   * 操作人ID
   */
  @Column({ type: 'uuid', comment: '操作人ID' })
  operatorId: string;

  /**
   * 操作人名称
   */
  @Column({ length: 50, comment: '操作人名称' })
  operatorName: string;

  /**
   * 操作人IP
   */
  @Column({ length: 50, comment: '操作人IP' })
  operatorIp: string;

  /**
   * 创建时间
   */
  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;
}
