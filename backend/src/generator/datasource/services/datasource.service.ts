import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Datasource } from '../entities/datasource.entity';
import { CreateDatasourceDto } from '../dto/create-datasource.dto';
import { UpdateDatasourceDto } from '../dto/update-datasource.dto';
import { QueryDatasourceDto } from '../dto/query-datasource.dto';
import { TestConnectionDto } from '../dto/test-connection.dto';
import { DatabaseConnectionService } from './database-connection.service';

@Injectable()
export class DatasourceService {
  private readonly logger = new Logger(DatasourceService.name);

  constructor(
    @InjectRepository(Datasource)
    private datasourceRepository: Repository<Datasource>,
    private databaseConnectionService: DatabaseConnectionService,
  ) {}

  async create(createDatasourceDto: CreateDatasourceDto): Promise<Datasource> {
    try {
      // 测试连接
      await this.databaseConnectionService.testConnection({
        type: createDatasourceDto.type,
        host: createDatasourceDto.host,
        port: createDatasourceDto.port,
        username: createDatasourceDto.username,
        password: createDatasourceDto.password,
        database: createDatasourceDto.database,
        options: createDatasourceDto.options,
      });

      const datasource = this.datasourceRepository.create(createDatasourceDto);
      return this.datasourceRepository.save(datasource);
    } catch (error) {
      this.logger.error(`创建数据源失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(
    query: QueryDatasourceDto,
  ): Promise<{
    items: Datasource[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const { name, type, page = 1, limit = 10 } = query;
      const skip = (page - 1) * limit;

      const queryBuilder =
        this.datasourceRepository.createQueryBuilder('datasource');

      if (name) {
        queryBuilder.andWhere('datasource.name LIKE :name', {
          name: `%${name}%`,
        });
      }

      if (type) {
        queryBuilder.andWhere('datasource.type = :type', { type });
      }

      const [items, total] = await queryBuilder
        .skip(skip)
        .take(limit)
        .orderBy('datasource.createdAt', 'DESC')
        .getManyAndCount();

      return {
        items,
        total,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error(`获取数据源列表失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOne(id: number): Promise<Datasource> {
    try {
      // 查询时包含password字段
      const datasource = await this.datasourceRepository.findOne({
        where: { id },
        select: [
          'id',
          'name',
          'type',
          'host',
          'port',
          'database',
          'username',
          'password',
          'isActive',
          'options',
          'createdAt',
          'updatedAt',
        ],
      });

      if (!datasource) {
        throw new NotFoundException(`数据源 [ID: ${id}] 不存在`);
      }

      return datasource;
    } catch (error) {
      this.logger.error(`获取数据源详情失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(
    id: number,
    updateDatasourceDto: UpdateDatasourceDto,
  ): Promise<Datasource> {
    try {
      const datasource = await this.findOne(id);

      // 如果修改了连接信息，则测试连接
      if (
        updateDatasourceDto.host !== undefined ||
        updateDatasourceDto.port !== undefined ||
        updateDatasourceDto.username !== undefined ||
        updateDatasourceDto.password !== undefined ||
        updateDatasourceDto.database !== undefined ||
        updateDatasourceDto.type !== undefined
      ) {
        await this.databaseConnectionService.testConnection({
          type: updateDatasourceDto.type || datasource.type,
          host: updateDatasourceDto.host || datasource.host,
          port: updateDatasourceDto.port || datasource.port,
          username: updateDatasourceDto.username || datasource.username,
          password: updateDatasourceDto.password || datasource.password,
          database: updateDatasourceDto.database || datasource.database,
          options: updateDatasourceDto.options || datasource.options,
        });

        // 关闭旧连接
        await this.databaseConnectionService.closeConnection(id);
      }

      // 更新实体
      Object.assign(datasource, updateDatasourceDto);
      await this.datasourceRepository.save(datasource);

      return this.datasourceRepository.findOne({ where: { id } });
    } catch (error) {
      this.logger.error(`更新数据源失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const datasource = await this.findOne(id);
      await this.databaseConnectionService.closeConnection(id);
      await this.datasourceRepository.remove(datasource);
    } catch (error) {
      this.logger.error(`删除数据源失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  async testConnection(
    testConnectionDto: TestConnectionDto,
  ): Promise<{ connected: boolean; version: string; connectTime: string }> {
    try {
      return this.databaseConnectionService.testConnection(testConnectionDto);
    } catch (error) {
      this.logger.error(`测试数据库连接失败: ${error.message}`, error.stack);
      throw error;
    }
  }
}
