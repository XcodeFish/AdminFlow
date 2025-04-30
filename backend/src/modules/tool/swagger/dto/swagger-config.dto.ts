import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class SwaggerConfigDto {
  @ApiProperty({ description: 'API标题', example: 'Admin Flow API' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @ApiProperty({
    description: 'API描述',
    example: 'Admin Flow System API文档',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'API版本', example: '1.0' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  version?: string;

  @ApiProperty({ description: 'API基础路径', example: '/api/v1' })
  @IsOptional()
  @IsString()
  basePath?: string;
}
