import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsObject,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateDatasourceDto } from './create-datasource.dto';

export class UpdateDatasourceDto extends PartialType(CreateDatasourceDto) {}
