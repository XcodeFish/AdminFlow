import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { OperationType, OperationStatus } from '../common/enums/logger.enum';

@Entity('sys_operation_log')
export class OperationLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, comment: '操作用户名' })
  username: string;

  @Column({ nullable: true, comment: '用户昵称' })
  nickname: string;

  @Column({
    type: 'enum',
    enum: OperationType,
    default: OperationType.OTHER,
    comment: '操作类型'
  })
  operationType: string;

  @Column({ nullable: true, comment: '操作名称' })
  operationName: string;

  @Column({ nullable: true, comment: '操作模块' })
  module: string;

  @Column({ nullable: true, comment: '操作内容', length: 1000 })
  content: string;

  @Column({ nullable: true, type: 'text', comment: '请求参数' })
  requestParams: string;

  @Column({ nullable: true, type: 'text', comment: '响应结果' })
  responseResult: string;

  @Column({ nullable: true, comment: 'IP地址' })
  ip: string;

  @Column({ nullable: true, comment: 'IP所属地区' })
  location: string;

  @Column({ nullable: true, comment: '用户代理', length: 500 })
  userAgent: string;

  @Column({ nullable: true, comment: '请求方法' })
  requestMethod: string;

  @Column({ nullable: true, comment: '请求URL', length: 500 })
  requestUrl: string;

  @Column({
    type: 'tinyint',
    default: OperationStatus.SUCCESS,
    comment: '操作状态(1成功,0失败)'
  })
  status: number;

  @Column({ nullable: true, comment: '错误信息', length: 2000 })
  errorMessage: string;

  @Column({ type: 'datetime', nullable: true, comment: '操作时间' })
  operationTime: Date;

  @Column({ nullable: true, default: 0, comment: '操作耗时(毫秒)' })
  duration: number;

  @CreateDateColumn({ comment: '创建时间' })
  createTime: Date;

  @Column({ nullable: true, comment: '创建者' })
  createBy: string;

  @UpdateDateColumn({ comment: '更新时间' })
  updateTime: Date;

  @Column({ nullable: true, comment: '更新者' })
  updateBy: string;
}
