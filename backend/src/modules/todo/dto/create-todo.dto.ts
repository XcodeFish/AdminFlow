import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Length, IsISO8601 } from 'class-validator';

export class CreateTodoDto {
  @ApiProperty({
    description: '待办事项内容',
    example: '完成用户模块开发',
  })
  @IsNotEmpty({ message: '内容不能为空' })
  @Length(1, 200, { message: '内容长度为2-100个字符' })
  content: string;

  @ApiProperty({
    description: '开始时间',
    example: '2023-10-01T08:00:00Z',
  })
  @IsNotEmpty({ message: '开始时间不能为空' })
  @IsISO8601()
  startTime: Date;
}
