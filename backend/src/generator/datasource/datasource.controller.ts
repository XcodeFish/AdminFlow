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
import { DatasourceService } from './services/datasource.service';
import { MetadataService } from './services/metadata.service';
import { CreateDatasourceDto } from './dto/create-datasource.dto';
import { UpdateDatasourceDto } from './dto/update-datasource.dto';
import { TestConnectionDto } from './dto/test-connection.dto';
import { QueryDatasourceDto } from './dto/query-datasource.dto';
import { QueryTablesDto } from './dto/query-tables.dto';

@ApiTags('代码生成器-数据源管理')
@ApiBearerAuth()
@Controller('generator/datasource')
export class DatasourceController {
  private readonly logger = new Logger(DatasourceController.name);

  constructor(
    private readonly datasourceService: DatasourceService,
    private readonly metadataService: MetadataService,
  ) {}

  @Post()
  @ApiOperation({ summary: '创建数据源' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async create(@Body() createDatasourceDto: CreateDatasourceDto) {
    this.logger.log(`创建数据源: ${createDatasourceDto.name}`);
    const datasource = await this.datasourceService.create(createDatasourceDto);
    // return {
    //   code: 200,
    //   message: '创建成功',
    //   data: datasource,
    // };
    return datasource;
  }

  @Get()
  @ApiOperation({ summary: '获取数据源列表' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async findAll(@Query() query: QueryDatasourceDto) {
    this.logger.log(`获取数据源列表, 查询参数: ${JSON.stringify(query)}`);
    const result = await this.datasourceService.findAll(query);
    // return {
    //   code: 200,
    //   message: '操作成功',
    //   data: result,
    // };
    return result;
  }

  @Get(':id')
  @ApiOperation({ summary: '获取数据源详情' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`获取数据源详情, ID: ${id}`);
    const datasource = await this.datasourceService.findOne(id);
    // return {
    //   code: 200,
    //   message: '操作成功',
    //   data: datasource,
    // };
    return datasource;
  }

  @Put(':id')
  @ApiOperation({ summary: '更新数据源' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDatasourceDto: UpdateDatasourceDto,
  ) {
    this.logger.log(`更新数据源, ID: ${id}`);
    const datasource = await this.datasourceService.update(
      id,
      updateDatasourceDto,
    );
    // return {
    //   code: 200,
    //   message: '更新成功',
    //   data: datasource,
    // };
    return datasource;
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除数据源' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`删除数据源, ID: ${id}`);
    await this.datasourceService.remove(id);
    // return {
    //   code: 200,
    //   message: '删除成功',
    //   data: null,
    // };
    return null;
  }

  @Post('test-connection')
  @ApiOperation({ summary: '测试数据库连接' })
  @ApiResponse({ status: 200, description: '连接成功' })
  async testConnection(@Body() testConnectionDto: TestConnectionDto) {
    this.logger.log(
      `测试数据库连接: ${testConnectionDto.host}:${testConnectionDto.port}`,
    );
    const result = await this.datasourceService.testConnection(
      testConnectionDto,
    );
    // return {
    //   code: 200,
    //   message: '连接成功',
    //   data: result,
    // };
    return result;
  }

  @Get(':id/tables')
  @ApiOperation({ summary: '获取数据库表列表' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getTables(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: QueryTablesDto,
  ) {
    this.logger.log(
      `获取数据库表列表, 数据源ID: ${id}, 查询参数: ${JSON.stringify(query)}`,
    );
    const result = await this.metadataService.getTables(id, query);
    // return {
    //   code: 200,
    //   message: '操作成功',
    //   data: result,
    // };
    return result;
  }

  @Get(':datasourceId/tables/:tableName')
  @ApiOperation({ summary: '获取表结构详情' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getTableDetail(
    @Param('datasourceId', ParseIntPipe) datasourceId: number,
    @Param('tableName') tableName: string,
  ) {
    this.logger.log(
      `获取表结构详情, 数据源ID: ${datasourceId}, 表名: ${tableName}`,
    );
    const result = await this.metadataService.getTableDetail(
      datasourceId,
      tableName,
    );
    // return {
    //   code: 200,
    //   message: '操作成功',
    //   data: result,
    // };
    return result;
  }
}
