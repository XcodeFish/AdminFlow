import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GenVersion } from '../entities/gen-version.entity';
import { CreateVersionDto } from '../dto/create-version.dto';
import { QueryVersionDto } from '../dto/query-version.dto';
import { GeneratorService } from '../../generate/services/generator.service';
import { ConfigService } from '../../config/services/config.service';

@Injectable()
export class VersionService {
  private readonly logger = new Logger(VersionService.name);

  constructor(
    @InjectRepository(GenVersion)
    private versionRepository: Repository<GenVersion>,
    private configService: ConfigService,
    private generatorService: GeneratorService,
  ) {}

  async create(createVersionDto: CreateVersionDto): Promise<GenVersion> {
    try {
      const version = this.versionRepository.create(createVersionDto);
      return this.versionRepository.save(version);
    } catch (error) {
      this.logger.error(`创建版本失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(
    query: QueryVersionDto,
  ): Promise<{
    items: GenVersion[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const { configId, page = 1, limit = 10 } = query;
      const skip = (page - 1) * limit;

      const [items, total] = await this.versionRepository.findAndCount({
        where: { configId },
        skip,
        take: limit,
        order: { createdAt: 'DESC' },
      });

      return {
        items,
        total,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error(`获取版本列表失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOne(id: number): Promise<GenVersion> {
    try {
      const version = await this.versionRepository.findOne({ where: { id } });

      if (!version) {
        throw new NotFoundException(`版本 [ID: ${id}] 不存在`);
      }

      return version;
    } catch (error) {
      this.logger.error(`获取版本详情失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  async rollback(
    versionId: number,
  ): Promise<{ taskId: string; targetVersion: string; rollbackAt: Date }> {
    try {
      // 获取版本信息
      const version = await this.findOne(versionId);

      // 解析配置和文件快照
      const configSnapshot = JSON.parse(version.configSnapshot);
      const fileSnapshot = JSON.parse(version.fileSnapshot);

      // 更新配置
      await this.configService.update(version.configId, configSnapshot);

      // 部署代码
      const deployResult = await this.generatorService.deploy(
        version.configId,
        {
          overwrite: true,
          generateFrontend: true,
          generateBackend: true,
          generateSql: true,
          registerMenu: true,
          registerPermission: true,
        },
      );

      return {
        taskId: deployResult.taskId,
        targetVersion: version.version,
        rollbackAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`回滚版本失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  async createSnapshot(
    configId: number,
    description?: string,
  ): Promise<GenVersion> {
    try {
      // 获取配置信息
      const config = await this.configService.findOne(configId);

      // 生成代码预览
      const previewResult = await this.generatorService.preview(configId);

      // 构建文件快照
      const fileSnapshot = {
        frontend: previewResult.frontend,
        backend: previewResult.backend,
        sql: previewResult.sql,
      };

      // 生成版本号
      const latestVersion = await this.getLatestVersion(configId);
      const newVersion = this.generateNextVersion(latestVersion);

      // 创建版本记录
      const createVersionDto: CreateVersionDto = {
        configId,
        configSnapshot: JSON.stringify(config),
        fileSnapshot: JSON.stringify(fileSnapshot),
        version: newVersion,
        description: description || `${config.moduleName} 版本 ${newVersion}`,
        creator: config.author || 'system',
      };

      return this.create(createVersionDto);
    } catch (error) {
      this.logger.error(`创建版本快照失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async getLatestVersion(configId: number): Promise<string> {
    const latest = await this.versionRepository.findOne({
      where: { configId },
      order: { createdAt: 'DESC' },
    });

    return latest ? latest.version : 'v0.0.0';
  }

  private generateNextVersion(currentVersion: string): string {
    // 解析当前版本号
    const versionPattern = /v(\d+)\.(\d+)\.(\d+)/;
    const match = currentVersion.match(versionPattern);

    if (!match) {
      return 'v1.0.0';
    }

    const major = parseInt(match[1], 10);
    const minor = parseInt(match[2], 10);
    const patch = parseInt(match[3], 10) + 1;

    return `v${major}.${minor}.${patch}`;
  }
}
