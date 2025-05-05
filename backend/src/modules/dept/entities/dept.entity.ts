import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity('sys_department')
export class DepartmentEntity extends BaseEntity {
  @ApiProperty({
    description: '部门ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: '部门名称',
    example: '研发部',
  })
  @Column({ name: 'dept_name', length: 50, comment: '部门名称' })
  deptName: string;

  @ApiProperty({
    description: '父部门ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
    nullable: true,
  })
  @Column({
    name: 'parent_id',
    type: 'uuid',
    nullable: true,
    comment: '父部门ID',
  })
  parentId: string | null;

  @ApiProperty({
    description: '祖级列表',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Column({ length: 500, comment: '祖级列表' })
  ancestors: string;

  @ApiProperty({
    description: '显示顺序',
    example: 1,
  })
  @Column({ name: 'order_num', type: 'int', default: 0, comment: '显示顺序' })
  orderNum: number;

  @ApiProperty({
    description: '负责人',
    example: '张三',
  })
  @Column({ length: 20, nullable: true, comment: '负责人' })
  leader: string;

  @ApiProperty({
    description: '联系电话',
    example: '13800000000',
  })
  @Column({ length: 11, nullable: true, comment: '联系电话' })
  phone: string;

  @ApiProperty({
    description: '邮箱',
    example: 'admin@example.com',
  })
  @Column({ length: 50, nullable: true, comment: '邮箱' })
  email: string;

  @ApiProperty({
    description: '部门状态',
    example: 1,
    enum: [0, 1],
  })
  @Column({ type: 'tinyint', default: 1, comment: '部门状态：0-禁用，1-启用' })
  status: number;

  @ApiProperty({
    description: '删除标志',
    example: 0,
    enum: [0, 2],
  })
  @Column({
    name: 'del_flag',
    type: 'tinyint',
    default: 0,
    comment: '删除标志：0-正常，2-删除',
  })
  delFlag: number;

  @ApiProperty({
    description: '创建时间',
    example: '2023-09-28T15:30:00Z',
  })
  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    comment: '创建时间',
  })
  createdAt: Date;

  @ApiProperty({
    description: '更新时间',
    example: '2023-09-28T15:30:00Z',
  })
  @Column({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
    comment: '更新时间',
  })
  updatedAt: Date;

  // 子部门关系（非数据库字段）
  children: DepartmentEntity[];
}
