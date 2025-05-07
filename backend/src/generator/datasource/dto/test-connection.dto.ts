import { IsString, IsNumber, IsOptional, IsObject } from 'class-validator';

export class TestConnectionDto {
  @IsString()
  type: string;

  @IsString()
  host: string;

  @IsNumber()
  port: number;

  @IsString()
  database: string;

  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsObject()
  options?: Record<string, any>;
}
