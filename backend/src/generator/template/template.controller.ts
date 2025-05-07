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
import { TemplateService } from './services/template.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { QueryTemplateDto } from './dto/query-template.dto';

@Controller('api/v1/generator/templates')
export class TemplateController {
  private readonly logger = new Logger(TemplateController.name);

  constructor(private readonly templateService: TemplateService) {}

  @Post()
  async create(@Body() createTemplateDto: CreateTemplateDto) {
    this.logger.log(`创建模板: ${createTemplateDto.name}`);
    const template = await this.templateService.create(createTemplateDto);
    return {
      code: 200,
      message: '创建成功',
      data: template,
    };
  }

  @Get()
  async findAll(@Query() query: QueryTemplateDto) {
    this.logger.log(`获取模板列表, 查询参数: ${JSON.stringify(query)}`);
    const result = await this.templateService.findAll(query);
    return {
      code: 200,
      message: '操作成功',
      data: result,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`获取模板详情, ID: ${id}`);
    const template = await this.templateService.findOne(id);
    return {
      code: 200,
      message: '操作成功',
      data: template,
    };
  }

  @Get('key/:templateKey')
  async findByKey(@Param('templateKey') templateKey: string) {
    this.logger.log(`根据Key获取模板, Key: ${templateKey}`);
    const template = await this.templateService.findByKey(templateKey);
    return {
      code: 200,
      message: '操作成功',
      data: template,
    };
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTemplateDto: UpdateTemplateDto,
  ) {
    this.logger.log(`更新模板, ID: ${id}`);
    const template = await this.templateService.update(id, updateTemplateDto);
    return {
      code: 200,
      message: '更新成功',
      data: template,
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`删除模板, ID: ${id}`);
    await this.templateService.remove(id);
    return {
      code: 200,
      message: '删除成功',
      data: null,
    };
  }
}
