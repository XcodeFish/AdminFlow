import { IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryVersionDto {
  @IsNumber()
  configId: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;
}
