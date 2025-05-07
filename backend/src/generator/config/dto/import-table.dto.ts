import { IsString, IsNumber, IsOptional } from 'class-validator';

export class ImportTableDto {
  @IsNumber()
  datasourceId: number;

  @IsString()
  tableName: string;

  @IsString()
  templateType: string;

  @IsOptional()
  @IsString()
  author?: string;
}
