import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateTemplateDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  type: string;

  @IsString()
  templateKey: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsBoolean()
  isBuiltin?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
