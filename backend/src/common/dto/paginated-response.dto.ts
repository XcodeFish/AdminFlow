import { ApiProperty } from '@nestjs/swagger';

export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: '总记录数',
    example: 100
  })
  total: number;

  @ApiProperty({
    description: '当前页',
    example: 1
  })
  page: number;

  @ApiProperty({
    description: '每页大小',
    example: 10
  })
  pageSize: number;

  @ApiProperty({
    description: '总页数',
    example: 10
  })
  totalPages: number;

  @ApiProperty({
    description: '数据列表',
    type: 'array',
    isArray: true
  })
  items: T[];

  constructor(
    items: T[],
    total: number,
    page: number,
    pageSize: number
  ) {
    this.items = items;
    this.total = total;
    this.page = page;
    this.pageSize = pageSize;
    this.totalPages = Math.ceil(total / pageSize);
  }
}
