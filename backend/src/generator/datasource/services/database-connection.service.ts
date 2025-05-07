import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Datasource } from '../entities/datasource.entity';
import { TestConnectionDto } from '../dto/test-connection.dto';

@Injectable()
export class DatabaseConnectionService {
  private readonly logger = new Logger(DatabaseConnectionService.name);
  private connections: Map<number, DataSource> = new Map();

  constructor() {}

  async createConnection(datasource: Datasource): Promise<DataSource> {
    try {
      const dataSource = new DataSource({
        type: datasource.type as any,
        host: datasource.host,
        port: datasource.port,
        username: datasource.username,
        password: datasource.password,
        database: datasource.database,
        synchronize: false,
        logging: ['error', 'warn'],
        entities: [],
        ...(datasource.options || {}),
      });

      await dataSource.initialize();
      this.connections.set(datasource.id, dataSource);
      return dataSource;
    } catch (error) {
      this.logger.error(`创建数据库连接失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getConnection(
    datasourceId: number,
    datasource?: Datasource,
  ): Promise<DataSource> {
    if (
      this.connections.has(datasourceId) &&
      this.connections.get(datasourceId).isInitialized
    ) {
      return this.connections.get(datasourceId);
    }

    if (!datasource) {
      throw new Error(`数据源 [ID: ${datasourceId}] 未找到或未初始化`);
    }

    return this.createConnection(datasource);
  }

  async closeConnection(datasourceId: number): Promise<void> {
    if (this.connections.has(datasourceId)) {
      const connection = this.connections.get(datasourceId);
      if (connection.isInitialized) {
        await connection.destroy();
      }
      this.connections.delete(datasourceId);
    }
  }

  async closeAllConnections(): Promise<void> {
    for (const [datasourceId, connection] of this.connections.entries()) {
      if (connection.isInitialized) {
        await connection.destroy();
      }
      this.connections.delete(datasourceId);
    }
  }

  async testConnection(
    testDto: TestConnectionDto,
  ): Promise<{ connected: boolean; version: string; connectTime: string }> {
    const startTime = process.hrtime();

    try {
      const dataSource = new DataSource({
        type: testDto.type as any,
        host: testDto.host,
        port: testDto.port,
        username: testDto.username,
        password: testDto.password,
        database: testDto.database,
        synchronize: false,
        logging: false,
        entities: [],
        ...(testDto.options || {}),
      });

      await dataSource.initialize();

      let version = '';
      if (testDto.type === 'mysql' || testDto.type === 'mariadb') {
        const result = await dataSource.query('SELECT VERSION() as version');
        version = `${testDto.type.toUpperCase()} ${result[0].version}`;
      } else if (testDto.type === 'postgres') {
        const result = await dataSource.query('SELECT version()');
        version = `PostgreSQL ${result[0].version}`;
      } else {
        version = `${testDto.type.toUpperCase()}`;
      }

      await dataSource.destroy();

      const endTime = process.hrtime(startTime);
      const connectTime = `${Math.round(
        endTime[0] * 1000 + endTime[1] / 1000000,
      )}ms`;

      return {
        connected: true,
        version,
        connectTime,
      };
    } catch (error) {
      this.logger.error(`测试数据库连接失败: ${error.message}`, error.stack);
      throw error;
    }
  }
}
