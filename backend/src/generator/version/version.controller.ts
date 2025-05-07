import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Logger,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { VersionService } from './services/version.service';
import { QueryVersionDto } from './dto/query-version.dto';

@ApiTags('代码生成器-版本管理')
@ApiBearerAuth()
@Controller('generator/versions')
export class VersionController {
  private readonly logger = new Logger(VersionController.name);

  constructor(private readonly versionService: VersionService) {}

  @Get(':configId')
  @ApiOperation({ summary: '获取版本列表' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async findAll(
    @Param('configId', ParseIntPipe) configId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    this.logger.log(
      `获取版本列表, 配置ID: ${configId}, 页码: ${page}, 每页数量: ${limit}`,
    );
    const query: QueryVersionDto = { configId, page, limit };
    const result = await this.versionService.findAll(query);
    // return {
    //   code: 200,
    //   message: '操作成功',
    //   data: result,
    // };
    return result;
  }

  @Post(':configId/snapshot')
  @ApiOperation({ summary: '创建版本快照' })
  @ApiResponse({ status: 201, description: '创建快照成功' })
  async createSnapshot(
    @Param('configId', ParseIntPipe) configId: number,
    @Body('description') description?: string,
  ) {
    this.logger.log(`创建版本快照, 配置ID: ${configId}, 描述: ${description}`);
    const version = await this.versionService.createSnapshot(
      configId,
      description,
    );
    // return {
    //   code: 200,
    //   message: '创建快照成功',
    //   data: version,
    // };
    return version;
  }

  @Post(':versionId/rollback')
  @ApiOperation({ summary: '回滚到指定版本' })
  @ApiResponse({ status: 200, description: '回滚成功' })
  async rollback(@Param('versionId', ParseIntPipe) versionId: number) {
    this.logger.log(`回滚版本, 版本ID: ${versionId}`);
    const result = await this.versionService.rollback(versionId);
    // return {
    //   code: 200,
    //   message: '回滚成功',
    //   data: result,
    // };
    return result;
  }
}
