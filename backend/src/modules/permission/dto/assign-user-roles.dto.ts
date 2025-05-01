import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class AssignUserRolesDto {
  @ApiProperty({
    description: '角色标识列表',
    example: ['admin', 'user'],
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  roleKeys: string[];
}
