import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsIn } from 'class-validator';

export class UpdateTodoStatusDto {
  @ApiProperty({
    description: '状态(0:未开始,1:进行中, 2:已完成, 3:已取消, 4:已过期)',
    example: 1,
    enum: [0, 1, 2, 3, 4],
  })
  @IsNotEmpty({ message: '状态不能为空' })
  @IsIn([0, 1, 2, 3, 4], { message: '状态值只能是0, 1, 2, 3, 4' })
  status: number;
}
