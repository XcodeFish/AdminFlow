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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TemplateService } from './services/template.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { QueryTemplateDto } from './dto/query-template.dto';

@ApiTags('代码生成器-模板管理')
@ApiBearerAuth()
@Controller('generator/templates')
export class TemplateController {
  private readonly logger = new Logger(TemplateController.name);

  constructor(private readonly templateService: TemplateService) {}

  @Post()
  @ApiOperation({ summary: '创建模板' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async create(@Body() createTemplateDto: CreateTemplateDto) {
    this.logger.log(`创建模板: ${createTemplateDto.name}`);
    const template = await this.templateService.create(createTemplateDto);
    // return {
    //   code: 200,
    //   message: '创建成功',
    //   data: template,
    // };
    return template;
  }

  @Get()
  @ApiOperation({ summary: '获取模板列表' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async findAll(@Query() query: QueryTemplateDto) {
    this.logger.log(`获取模板列表, 查询参数: ${JSON.stringify(query)}`);
    const result = await this.templateService.findAll(query);
    // return {
    //   code: 200,
    //   message: '操作成功',
    //   data: result,
    // };
    return result;
  }

  @Get(':id')
  @ApiOperation({ summary: '获取模板详情' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`获取模板详情, ID: ${id}`);
    const template = await this.templateService.findOne(id);
    // return {
    //   code: 200,
    //   message: '操作成功',
    //   data: template,
    // };
    return template;
  }

  @Get('key/:templateKey')
  @ApiOperation({ summary: '根据Key获取模板' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async findByKey(@Param('templateKey') templateKey: string) {
    this.logger.log(`根据Key获取模板, Key: ${templateKey}`);
    const template = await this.templateService.findByKey(templateKey);
    // return {
    //   code: 200,
    //   message: '操作成功',
    //   data: template,
    // };
    return template;
  }

  @Put(':id')
  @ApiOperation({ summary: '更新模板' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTemplateDto: UpdateTemplateDto,
  ) {
    this.logger.log(`更新模板, ID: ${id}`);
    const template = await this.templateService.update(id, updateTemplateDto);
    // return {
    //   code: 200,
    //   message: '更新成功',
    //   data: template,
    // };
    return template;
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除模板' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`删除模板, ID: ${id}`);
    await this.templateService.remove(id);
    // return {
    //   code: 200,
    //   message: '删除成功',
    //   data: null,
    // };
    return null;
  }
}
