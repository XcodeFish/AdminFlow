import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsObject,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class FieldValidateDto {
  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsNumber()
  max?: number;

  @IsOptional()
  @IsNumber()
  min?: number;

  @IsOptional()
  @IsString()
  pattern?: string;
}

export class FieldConfigDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  tsType?: string;

  @IsOptional()
  @IsNumber()
  length?: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsString()
  defaultValue?: string;

  @IsOptional()
  @IsString()
  component?: string;

  @IsOptional()
  @IsString()
  dictType?: string;

  @IsOptional()
  @IsString()
  queryType?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldValidateDto)
  validate?: FieldValidateDto[];

  @IsOptional()
  @IsBoolean()
  showInList?: boolean;

  @IsOptional()
  @IsBoolean()
  showInForm?: boolean;

  @IsOptional()
  @IsBoolean()
  showInSearch?: boolean;
}

export class PageListConfigDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsBoolean()
  showCheckbox?: boolean;

  @IsOptional()
  @IsBoolean()
  showPagination?: boolean;

  @IsOptional()
  @IsNumber()
  pageSize?: number;

  @IsOptional()
  @IsBoolean()
  showOperation?: boolean;

  @IsOptional()
  @IsArray()
  operations?: string[];
}

export class PageFormConfigDto {
  @IsOptional()
  @IsString()
  width?: string;

  @IsOptional()
  @IsString()
  labelWidth?: string;

  @IsOptional()
  @IsString()
  labelPosition?: string;

  @IsOptional()
  @IsString()
  size?: string;
}

export class PagePermissionsDto {
  @IsOptional()
  @IsString()
  list?: string;

  @IsOptional()
  @IsString()
  create?: string;

  @IsOptional()
  @IsString()
  update?: string;

  @IsOptional()
  @IsString()
  delete?: string;

  @IsOptional()
  @IsString()
  export?: string;

  @IsOptional()
  @IsString()
  import?: string;
}

export class PageConfigDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => PageListConfigDto)
  list?: PageListConfigDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PageFormConfigDto)
  form?: PageFormConfigDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PagePermissionsDto)
  permissions?: PagePermissionsDto;
}

export class CreateConfigDto {
  @IsString()
  moduleName: string;

  @IsString()
  tableName: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  datasourceId: number;

  @IsString()
  apiPrefix: string;

  @IsString()
  packageName: string;

  @IsString()
  templateType: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldConfigDto)
  fields: FieldConfigDto[];

  @IsObject()
  @ValidateNested()
  @Type(() => PageConfigDto)
  pageConfig: PageConfigDto;

  @IsOptional()
  @IsString()
  author?: string;
}
