import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Put,
  Logger,
  ParseIntPipe,
} from '@nestjs/common';
import { ConfigService } from './services/config.service';
import { CreateConfigDto } from './dto/create-config.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import { QueryConfigDto } from './dto/query-config.dto';
import { ImportTableDto } from './dto/import-table.dto';

@Controller('api/v1/generator/configs')
export class ConfigController {
  private readonly logger = new Logger(ConfigController.name);

  constructor(private readonly configService: ConfigService) {}

  @Post()
  async create(@Body() createConfigDto: CreateConfigDto) {
    this.logger.log(`创建代码生成配置: ${createConfigDto.moduleName}`);
    const config = await this.configService.create(createConfigDto);
    return {
      code: 200,
      message: '创建成功',
      data: config,
    };
  }

  @Get()
  async findAll(@Query() query: QueryConfigDto) {
    this.logger.log(`获取代码生成配置列表, 查询参数: ${JSON.stringify(query)}`);
    const result = await this.configService.findAll(query);
    return {
      code: 200,
      message: '操作成功',
      data: result,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`获取代码生成配置详情, ID: ${id}`);
    const config = await this.configService.findOne(id);
    return {
      code: 200,
      message: '操作成功',
      data: config,
    };
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateConfigDto: UpdateConfigDto,
  ) {
    this.logger.log(`更新代码生成配置, ID: ${id}`);
    const config = await this.configService.update(id, updateConfigDto);
    return {
      code: 200,
      message: '更新成功',
      data: config,
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`删除代码生成配置, ID: ${id}`);
    await this.configService.remove(id);
    return {
      code: 200,
      message: '删除成功',
      data: null,
    };
  }

  @Post('import-table')
  async importTable(@Body() importTableDto: ImportTableDto) {
    this.logger.log(`导入表结构: ${importTableDto.tableName}`);
    const config = await this.configService.importTable(importTableDto);
    return {
      code: 200,
      message: '导入成功',
      data: config,
    };
  }
}
