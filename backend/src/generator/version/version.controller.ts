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
import { VersionService } from './services/version.service';
import { QueryVersionDto } from './dto/query-version.dto';

@Controller('api/v1/generator/versions')
export class VersionController {
  private readonly logger = new Logger(VersionController.name);

  constructor(private readonly versionService: VersionService) {}

  @Get(':configId')
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
    return {
      code: 200,
      message: '操作成功',
      data: result,
    };
  }

  @Post(':configId/snapshot')
  async createSnapshot(
    @Param('configId', ParseIntPipe) configId: number,
    @Body('description') description?: string,
  ) {
    this.logger.log(`创建版本快照, 配置ID: ${configId}, 描述: ${description}`);
    const version = await this.versionService.createSnapshot(
      configId,
      description,
    );
    return {
      code: 200,
      message: '创建快照成功',
      data: version,
    };
  }

  @Post(':versionId/rollback')
  async rollback(@Param('versionId', ParseIntPipe) versionId: number) {
    this.logger.log(`回滚版本, 版本ID: ${versionId}`);
    const result = await this.versionService.rollback(versionId);
    return {
      code: 200,
      message: '回滚成功',
      data: result,
    };
  }
}
