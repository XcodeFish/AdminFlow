import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class AssignRolePermissionsDto {
  @ApiProperty({
    description: '权限标识列表',
    example: ['system:user:create', 'system:user:update'],
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  permKeys: string[];
}
