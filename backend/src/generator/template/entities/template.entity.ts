import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('gen_template')
export class Template {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 200, nullable: true })
  description: string;

  @Column({ length: 50 })
  type: string; // backend, frontend, etc.

  @Column({ length: 50, unique: true })
  templateKey: string; // unique key for template

  @Column({ type: 'text' })
  content: string; // template content

  @Column({ default: false })
  isBuiltin: boolean;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
