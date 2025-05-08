import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Put,
  ParseIntPipe,
} from '@nestjs/common';
import { TemplateService } from '../services/template.service';
import { CreateTemplateDto } from '../dto/create-template.dto';
import { UpdateTemplateDto } from '../dto/update-template.dto';
import { QueryTemplateDto } from '../dto/query-template.dto';

@Controller('generator/template')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Post()
  async create(@Body() createTemplateDto: CreateTemplateDto) {
    const data = await this.templateService.create(createTemplateDto);
    return {
      code: 200,
      message: '创建成功',
      data,
    };
  }

  @Get()
  async findAll(@Query() query: QueryTemplateDto) {
    const data = await this.templateService.findAll(query);
    return {
      code: 200,
      message: '操作成功',
      data,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.templateService.findOne(id);
    return {
      code: 200,
      message: '操作成功',
      data,
    };
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTemplateDto: UpdateTemplateDto,
  ) {
    const data = await this.templateService.update(id, updateTemplateDto);
    return {
      code: 200,
      message: '更新成功',
      data,
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.templateService.remove(id);
    return {
      code: 200,
      message: '删除成功',
      data: null,
    };
  }

  @Post('fix-vue-list')
  async fixVueListTemplate() {
    const template = await this.templateService.findByKey('vue-list');

    // 修复嵌套语法
    const fixedContent = template.content.replace(
      /<el-table-column label="{{this\.comment}}" align="center">\s*<template #default="\{ row \}">\s*{{ row\.{{this\.name}} }}\s*<\/template>\s*<\/el-table-column>/g,
      '<el-table-column label="{{this.comment}}" align="center" prop="{{this.name}}" />',
    );

    template.content = fixedContent;
    const updated = await this.templateService.update(template.id, template);

    return {
      code: 200,
      message: '修复成功',
      data: updated,
    };
  }
}
