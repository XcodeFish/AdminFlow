import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateVersionDto {
  @IsNumber()
  configId: number;

  @IsString()
  configSnapshot: string;

  @IsString()
  fileSnapshot: string;

  @IsString()
  version: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  creator: string;
}
