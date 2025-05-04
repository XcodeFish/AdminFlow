import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches, } from 'class-validator';
import { Match } from '../../../core/decorators/match-decorator';

export class ChangePasswordDto {
  @ApiProperty({ description: '当前密码', example: 'Abc123456' })
  @IsNotEmpty({ message: '当前密码不能为空' })
  @IsString()
  oldPassword: string;

  @ApiProperty({
    description: '新密码',
    example: 'Abc123456',
    minLength: 6,
    maxLength: 20,
  })
  @IsNotEmpty({ message: '新密码不能为空' })
  @Length(6, 20, { message: '新密码长度为6-20个字符' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{6,20}$/, {
    message: '新密码必须包含大小写字母和数字',
  })
  newPassword: string;

  @ApiProperty({
    description: '确认新密码',
    example: 'Abc123456',
  })
  @IsNotEmpty({ message: '确认新密码不能为空' })
  @Match('newPassword', { message: '两次密码不一致' })
  confirmPassword: string;
}
