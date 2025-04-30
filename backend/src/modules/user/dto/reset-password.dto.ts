import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: '新密码',
    example: 'Admin@123',
    minLength: 6,
    maxLength: 20
  })
  @IsNotEmpty({ message: '密码不能为空' })
  @IsString()
  @Length(6, 20, { message: '密码长度为6-20个字符' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{6,20}$/, {
    message: '密码必须包含大小写字母和数字，长度6-20位'
  })
  password: string;
}
