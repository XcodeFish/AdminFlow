import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('todo')
export class TodoEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ comment: '待办事项内容' })
  content: string;

  @Column({ comment: '开始时间', type: 'timestamp' })
  startTime: Date;

  @Column({
    comment: '状态(0:未开始,1:进行中, 2:已完成, 3:已取消, 4:已过期)',
    type: 'tinyint',
    default: 0,
  })
  status: number;

  @Column({ comment: '用户ID', type: 'uuid' })
  userId: string;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;
}
