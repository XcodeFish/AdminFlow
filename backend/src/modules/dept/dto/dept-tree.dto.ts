import { ApiProperty } from '@nestjs/swagger';

export class DeptTreeDto {
  @ApiProperty({
    description: '部门ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: '部门名称',
    example: '研发部',
  })
  deptName: string;

  @ApiProperty({
    description: '父部门ID',
    example: null,
    nullable: true,
  })
  parentId: string | null;

  @ApiProperty({
    description: '显示顺序',
    example: 1,
  })
  orderNum: number;

  @ApiProperty({
    description: '部门状态',
    example: 1,
    enum: [0, 1],
  })
  status: number;

  @ApiProperty({
    description: '子部门',
    type: [DeptTreeDto],
  })
  children: DeptTreeDto[];
}
