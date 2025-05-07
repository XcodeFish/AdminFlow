import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('gen_version')
export class GenVersion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  configId: number;

  @Column({ type: 'text' })
  configSnapshot: string; // 完整配置快照

  @Column({ type: 'text' })
  fileSnapshot: string; // 生成文件快照

  @Column({ length: 50 })
  version: string; // 版本号，如v1.0.0

  @Column({ length: 200, nullable: true })
  description: string;

  @Column({ length: 50 })
  creator: string;

  @CreateDateColumn()
  createdAt: Date;
}
