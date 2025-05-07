import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('gen_config')
export class GenConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ length: 100 })
  moduleName: string;

  @Index()
  @Column({ length: 100 })
  tableName: string;

  @Column({ length: 200, nullable: true })
  description: string;

  @Index()
  @Column()
  datasourceId: number;

  @Column({ length: 200 })
  apiPrefix: string;

  @Column({ length: 200 })
  packageName: string;

  @Index()
  @Column({ length: 50 })
  templateType: string;

  @Column({ type: 'json' })
  fields: string;

  @Column({ type: 'json' })
  pageConfig: string;

  @Index()
  @Column({ default: false })
  isGenerated: boolean;

  @Column({ nullable: true })
  generatedAt: Date;

  @Column({ length: 50, nullable: true })
  author: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
