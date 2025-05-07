import { IsBoolean, IsOptional } from 'class-validator';

export class GenerateOptionsDto {
  @IsOptional()
  @IsBoolean()
  overwrite?: boolean = true;

  @IsOptional()
  @IsBoolean()
  generateFrontend?: boolean = true;

  @IsOptional()
  @IsBoolean()
  generateBackend?: boolean = true;

  @IsOptional()
  @IsBoolean()
  generateSql?: boolean = true;

  @IsOptional()
  @IsBoolean()
  registerMenu?: boolean = true;

  @IsOptional()
  @IsBoolean()
  registerPermission?: boolean = true;
}
