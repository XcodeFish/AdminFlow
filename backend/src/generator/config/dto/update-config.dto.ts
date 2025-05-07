import { PartialType } from '@nestjs/mapped-types';
import { CreateConfigDto } from './create-config.dto';
import { IsBoolean, IsDate, IsOptional } from 'class-validator';

export class UpdateConfigDto extends PartialType(CreateConfigDto) {
  @IsOptional()
  @IsBoolean()
  isGenerated?: boolean;

  @IsOptional()
  @IsDate()
  generatedAt?: Date;
}
