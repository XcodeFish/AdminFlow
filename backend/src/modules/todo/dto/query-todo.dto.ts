import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsIn, IsInt, Min, Max } from 'class-validator';

export class QueryTodoDto {
  @ApiProperty({
    description: '状态(0:未开始,1:进行中, 2:已完成, 3:已取消, 4:已过期)',
    example: 0,
    enum: [0, 1, 2, 3, 4],
    required: false,
  })
  @IsOptional()
  @IsIn([0, 1, 2, 3, 4], { message: '状态值只能是0, 1, 2, 3, 4' })
  status?: number;

  @ApiProperty({
    description: '页码',
    example: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: '页码必须是整数' })
  @Min(1, { message: '页码最小为1' })
  page?: number = 1;

  @ApiProperty({
    description: '每页条数',
    example: 10,
    default: 10,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: '每页条数必须是整数' })
  @Min(1, { message: '每页条数最小为1' })
  @Max(100, { message: '每页条数最大为100' })
  pageSize?: number = 10;
}
