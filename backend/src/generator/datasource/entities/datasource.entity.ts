import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('gen_datasource')
export class Datasource {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 20 })
  type: string; // mysql, postgresql, etc.

  @Column({ length: 100 })
  host: string;

  @Column()
  port: number;

  @Column({ length: 50 })
  database: string;

  @Column({ length: 50 })
  username: string;

  @Column({ type: 'text', select: false })
  password: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'json', nullable: true })
  options: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
