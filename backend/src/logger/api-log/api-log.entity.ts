import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ErrorLevel } from '../common/enums/logger.enum';

@Entity('sys_api_log')
export class ApiLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, comment: '追踪ID' })
  traceId: string;

  @Column({ nullable: true, comment: '请求URL', length: 500 })
  requestUrl: string;

  @Column({ nullable: true, comment: '请求方法' })
  requestMethod: string;

  @Column({ nullable: true, comment: '请求IP' })
  requestIp: string;

  @Column({ nullable: true, comment: '用户代理', length: 500 })
  userAgent: string;

  @Column({ nullable: true, comment: '用户ID' })
  userId: number;

  @Column({ nullable: true, comment: '用户名' })
  username: string;

  @Column({ nullable: true, type: 'text', comment: '请求头' })
  requestHeaders: string;

  @Column({ nullable: true, type: 'text', comment: '请求参数' })
  requestParams: string;

  @Column({ nullable: true, type: 'text', comment: '响应头' })
  responseHeaders: string;

  @Column({ nullable: true, type: 'text', comment: '响应体' })
  responseBody: string;

  @Column({ nullable: true, default: 200, comment: 'HTTP状态码' })
  status: number;

  @Column({
    type: 'enum',
    enum: ErrorLevel,
    default: ErrorLevel.INFO,
    comment: '错误级别'
  })
  errorLevel: string;

  @Column({ nullable: true, comment: '错误信息', length: 2000 })
  errorMessage: string;

  @Column({ nullable: true, type: 'text', comment: '错误堆栈' })
  stackTrace: string;

  @Column({ nullable: true, default: 0, comment: '请求耗时(毫秒)' })
  duration: number;

  @Column({ type: 'datetime', nullable: true, comment: '请求时间' })
  requestTime: Date;

  @Column({ type: 'datetime', nullable: true, comment: '响应时间' })
  responseTime: Date;

  @CreateDateColumn({ comment: '创建时间' })
  createTime: Date;

  @Column({ nullable: true, comment: '创建者' })
  createBy: string;

  @UpdateDateColumn({ comment: '更新时间' })
  updateTime: Date;

  @Column({ nullable: true, comment: '更新者' })
  updateBy: string;
}
