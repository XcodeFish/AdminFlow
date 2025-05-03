import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsIn } from 'class-validator';

export class UpdateTodoStatusDto {
  @ApiProperty({
    description: '状态(0:未完成, 1:已完成, 2:已取消)',
    example: 1,
    enum: [0, 1, 2],
  })
  @IsNotEmpty({ message: '状态不能为空' })
  @IsIn([0, 1, 2], { message: '状态值只能是0, 1, 2' })
  status: number;
}
