import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DatabaseConnectionService } from './database-connection.service';
import { DatasourceService } from './datasource.service';
import { QueryTablesDto } from '../dto/query-tables.dto';

export interface TableColumn {
  name: string;
  type: string;
  length: number;
  nullable: boolean;
  isPrimary: boolean;
  isAutoIncrement: boolean;
  defaultValue: string | null;
  comment: string;
}

export interface TableIndex {
  name: string;
  columns: string[];
  type: string;
}

export interface TableInfo {
  tableName: string;
  engine: string;
  tableComment: string;
  createTime: string;
  tableRows: number;
  dataLength: string;
}

export interface TableDetail extends TableInfo {
  primaryKey: string;
  columns: TableColumn[];
  indexes: TableIndex[];
}

@Injectable()
export class MetadataService {
  private readonly logger = new Logger(MetadataService.name);

  constructor(
    private datasourceService: DatasourceService,
    private databaseConnectionService: DatabaseConnectionService,
  ) {}

  async getTables(
    datasourceId: number,
    query: QueryTablesDto,
  ): Promise<{
    items: TableInfo[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const { name, page = 1, limit = 20 } = query;
      const datasource = await this.datasourceService.findOne(datasourceId);
      const connection = await this.databaseConnectionService.getConnection(
        datasourceId,
        datasource,
      );

      const result = await this.getTablesForDatabase(
        connection,
        datasource.type,
        datasource.database,
        name,
      );

      // 手动分页
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedItems = result.slice(start, end);

      return {
        items: paginatedItems,
        total: result.length,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error(`获取数据库表列表失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getTableDetail(
    datasourceId: number,
    tableName: string,
  ): Promise<TableDetail> {
    try {
      const datasource = await this.datasourceService.findOne(datasourceId);
      const connection = await this.databaseConnectionService.getConnection(
        datasourceId,
        datasource,
      );

      // 根据数据库类型获取表详情
      if (datasource.type === 'mysql' || datasource.type === 'mariadb') {
        return this.getMysqlTableDetail(
          connection,
          datasource.database,
          tableName,
        );
      } else if (datasource.type === 'postgres') {
        return this.getPostgresTableDetail(connection, tableName);
      } else {
        throw new Error(`不支持的数据库类型: ${datasource.type}`);
      }
    } catch (error) {
      this.logger.error(`获取表结构详情失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async getTablesForDatabase(
    connection: DataSource,
    dbType: string,
    database: string,
    tableName?: string,
  ): Promise<TableInfo[]> {
    if (dbType === 'mysql' || dbType === 'mariadb') {
      return this.getMysqlTables(connection, database, tableName);
    } else if (dbType === 'postgres') {
      return this.getPostgresTables(connection, tableName);
    } else {
      throw new Error(`不支持的数据库类型: ${dbType}`);
    }
  }

  private async getMysqlTables(
    connection: DataSource,
    database: string,
    tableName?: string,
  ): Promise<TableInfo[]> {
    let query = `
      SELECT
        table_name AS tableName,
        engine AS engine,
        table_comment AS tableComment,
        create_time AS createTime,
        table_rows AS tableRows,
        CONCAT(ROUND(data_length / 1024, 2), 'KB') AS dataLength
      FROM
        information_schema.tables
      WHERE
        table_schema = ?
    `;

    const params: any[] = [database];

    if (tableName) {
      query += ` AND table_name LIKE ?`;
      params.push(`%${tableName}%`);
    }

    query += ` ORDER BY create_time DESC`;

    return connection.query(query, params);
  }

  private async getPostgresTables(
    connection: DataSource,
    tableName?: string,
  ): Promise<TableInfo[]> {
    let query = `
      SELECT
        tablename AS "tableName",
        'PostgreSQL' AS "engine",
        obj_description(c.oid) AS "tableComment",
        now()::text AS "createTime",
        (SELECT reltuples::bigint FROM pg_class WHERE relname = tablename) AS "tableRows",
        pg_size_pretty(pg_relation_size(quote_ident(tablename))) AS "dataLength"
      FROM
        pg_tables t
      JOIN
        pg_class c ON c.relname = t.tablename
      WHERE
        schemaname = 'public'
    `;

    const params: any[] = [];

    if (tableName) {
      query += ` AND tablename LIKE $1`;
      params.push(`%${tableName}%`);
    }

    return connection.query(query, params);
  }

  private async getMysqlTableDetail(
    connection: DataSource,
    database: string,
    tableName: string,
  ): Promise<TableDetail> {
    // 获取表基本信息
    const tableInfo = await connection.query(
      `
      SELECT
        table_name AS tableName,
        engine AS engine,
        table_comment AS tableComment,
        create_time AS createTime,
        table_rows AS tableRows,
        CONCAT(ROUND(data_length / 1024, 2), 'KB') AS dataLength
      FROM
        information_schema.tables
      WHERE
        table_schema = ? AND table_name = ?
    `,
      [database, tableName],
    );

    if (!tableInfo || tableInfo.length === 0) {
      throw new NotFoundException(`表 [${tableName}] 不存在`);
    }

    // 获取表字段信息
    const columns = await connection.query(
      `
      SELECT
        column_name AS name,
        data_type AS type,
        CASE
          WHEN character_maximum_length IS NOT NULL THEN character_maximum_length
          WHEN numeric_precision IS NOT NULL THEN numeric_precision
          ELSE 0
        END AS length,
        CASE WHEN is_nullable = 'YES' THEN true ELSE false END AS nullable,
        CASE WHEN column_key = 'PRI' THEN true ELSE false END AS isPrimary,
        CASE WHEN extra = 'auto_increment' THEN true ELSE false END AS isAutoIncrement,
        column_default AS defaultValue,
        column_comment AS comment
      FROM
        information_schema.columns
      WHERE
        table_schema = ? AND table_name = ?
      ORDER BY
        ordinal_position
    `,
      [database, tableName],
    );

    // 获取表索引信息
    const indexes = await connection.query(
      `
      SELECT
        index_name AS name,
        GROUP_CONCAT(column_name ORDER BY seq_in_index) AS columns,
        CASE
          WHEN index_name = 'PRIMARY' THEN 'PRIMARY'
          WHEN non_unique = 0 THEN 'UNIQUE'
          ELSE 'INDEX'
        END AS type
      FROM
        information_schema.statistics
      WHERE
        table_schema = ? AND table_name = ?
      GROUP BY
        index_name, non_unique
    `,
      [database, tableName],
    );

    // 处理索引列
    const processedIndexes = indexes.map((index) => ({
      ...index,
      columns: index.columns.split(','),
    }));

    // 查找主键
    const primaryColumn = columns.find((col) => col.isPrimary)?.name || '';

    return {
      ...tableInfo[0],
      primaryKey: primaryColumn,
      columns,
      indexes: processedIndexes,
    };
  }

  private async getPostgresTableDetail(
    connection: DataSource,
    tableName: string,
  ): Promise<TableDetail> {
    // 获取表基本信息
    const tableInfo = await connection.query(
      `
      SELECT
        tablename AS "tableName",
        'PostgreSQL' AS "engine",
        obj_description(c.oid) AS "tableComment",
        now()::text AS "createTime",
        (SELECT reltuples::bigint FROM pg_class WHERE relname = tablename) AS "tableRows",
        pg_size_pretty(pg_relation_size(quote_ident(tablename))) AS "dataLength"
      FROM
        pg_tables t
      JOIN
        pg_class c ON c.relname = t.tablename
      WHERE
        schemaname = 'public' AND tablename = $1
    `,
      [tableName],
    );

    if (!tableInfo || tableInfo.length === 0) {
      throw new NotFoundException(`表 [${tableName}] 不存在`);
    }

    // 获取表字段信息
    const columns = await connection.query(
      `
      SELECT
        a.attname AS name,
        format_type(a.atttypid, a.atttypmod) AS type,
        CASE
          WHEN a.atttypmod > 0 THEN a.atttypmod - 4
          ELSE 0
        END AS length,
        NOT a.attnotnull AS nullable,
        CASE WHEN pk.contype = 'p' THEN true ELSE false END AS "isPrimary",
        CASE WHEN a.attidentity = 'a' THEN true ELSE false END AS "isAutoIncrement",
        pg_get_expr(d.adbin, d.adrelid) AS "defaultValue",
        COALESCE(col_description(a.attrelid, a.attnum), '') AS comment
      FROM
        pg_attribute a
      LEFT JOIN
        pg_constraint pk ON pk.conrelid = a.attrelid AND a.attnum = ANY(pk.conkey) AND pk.contype = 'p'
      LEFT JOIN
        pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum
      WHERE
        a.attrelid = $1::regclass
        AND a.attnum > 0
        AND NOT a.attisdropped
      ORDER BY
        a.attnum
    `,
      [tableName],
    );

    // 获取表索引信息
    const indexes = await connection.query(
      `
      SELECT
        i.relname AS name,
        string_agg(a.attname, ',') AS columns,
        CASE
          WHEN indisprimary THEN 'PRIMARY'
          WHEN indisunique THEN 'UNIQUE'
          ELSE 'INDEX'
        END AS type
      FROM
        pg_index ix
      JOIN
        pg_class i ON i.oid = ix.indexrelid
      JOIN
        pg_class t ON t.oid = ix.indrelid
      JOIN
        pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
      WHERE
        t.relkind = 'r'
        AND t.relname = $1
      GROUP BY
        i.relname, ix.indisprimary, ix.indisunique
    `,
      [tableName],
    );

    // 处理索引列
    const processedIndexes = indexes.map((index) => ({
      ...index,
      columns: index.columns.split(','),
    }));

    // 查找主键
    const primaryColumn = columns.find((col) => col.isPrimary)?.name || '';

    return {
      ...tableInfo[0],
      primaryKey: primaryColumn,
      columns,
      indexes: processedIndexes,
    };
  }
}
