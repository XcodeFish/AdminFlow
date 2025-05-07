import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { GenConfig } from '../entities/gen-config.entity';
import { CreateConfigDto } from '../dto/create-config.dto';
import { UpdateConfigDto } from '../dto/update-config.dto';
import { QueryConfigDto } from '../dto/query-config.dto';
import { ImportTableDto } from '../dto/import-table.dto';
import { TableColumn } from '../../datasource/services/metadata.service';
import { MetadataService } from '../../datasource/services/metadata.service';
import { DatasourceService } from '../../datasource/services/datasource.service';

@Injectable()
export class ConfigService {
  private readonly logger = new Logger(ConfigService.name);

  constructor(
    @InjectRepository(GenConfig)
    private configRepository: Repository<GenConfig>,
    private metadataService: MetadataService,
    private datasourceService: DatasourceService,
  ) {}

  async create(createConfigDto: CreateConfigDto): Promise<GenConfig> {
    try {
      const { fields, pageConfig, ...rest } = createConfigDto;

      const config = this.configRepository.create({
        ...rest,
        fields: JSON.stringify(fields),
        pageConfig: JSON.stringify(pageConfig),
      });

      return this.configRepository.save(config);
    } catch (error) {
      this.logger.error(`创建代码生成配置失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(
    query: QueryConfigDto,
  ): Promise<{
    items: GenConfig[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const { moduleName, tableName, page = 1, limit = 10 } = query;
      const skip = (page - 1) * limit;

      const queryBuilder = this.configRepository.createQueryBuilder('config');

      if (moduleName) {
        queryBuilder.andWhere('config.moduleName LIKE :moduleName', {
          moduleName: `%${moduleName}%`,
        });
      }

      if (tableName) {
        queryBuilder.andWhere('config.tableName LIKE :tableName', {
          tableName: `%${tableName}%`,
        });
      }

      const [items, total] = await queryBuilder
        .skip(skip)
        .take(limit)
        .orderBy('config.createdAt', 'DESC')
        .getManyAndCount();

      // 转换JSON字段
      const processedItems = items.map((item) => ({
        ...item,
        fields: JSON.parse(item.fields),
        pageConfig: JSON.parse(item.pageConfig),
      }));

      return {
        items: processedItems,
        total,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error(
        `获取代码生成配置列表失败: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findOne(id: number): Promise<GenConfig> {
    try {
      const config = await this.configRepository.findOne({ where: { id } });

      if (!config) {
        throw new NotFoundException(`代码生成配置 [ID: ${id}] 不存在`);
      }

      // 转换JSON字段
      return {
        ...config,
        fields: JSON.parse(config.fields),
        pageConfig: JSON.parse(config.pageConfig),
      };
    } catch (error) {
      this.logger.error(
        `获取代码生成配置详情失败: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async update(
    id: number,
    updateConfigDto: UpdateConfigDto,
  ): Promise<GenConfig> {
    try {
      const config = await this.configRepository.findOne({ where: { id } });

      if (!config) {
        throw new NotFoundException(`代码生成配置 [ID: ${id}] 不存在`);
      }

      // 处理更新数据
      const updateData: any = { ...updateConfigDto };

      if (updateConfigDto.fields) {
        updateData.fields = JSON.stringify(updateConfigDto.fields);
      }

      if (updateConfigDto.pageConfig) {
        updateData.pageConfig = JSON.stringify(updateConfigDto.pageConfig);
      }

      await this.configRepository.update(id, updateData);

      return this.findOne(id);
    } catch (error) {
      this.logger.error(`更新代码生成配置失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const config = await this.configRepository.findOne({ where: { id } });

      if (!config) {
        throw new NotFoundException(`代码生成配置 [ID: ${id}] 不存在`);
      }

      await this.configRepository.remove(config);
    } catch (error) {
      this.logger.error(`删除代码生成配置失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  async importTable(importTableDto: ImportTableDto): Promise<GenConfig> {
    try {
      const { datasourceId, tableName, templateType, author } = importTableDto;

      // 获取数据源
      await this.datasourceService.findOne(datasourceId);

      // 获取表结构
      const tableDetail = await this.metadataService.getTableDetail(
        datasourceId,
        tableName,
      );

      // 生成字段配置
      const fields = this.generateFieldsConfig(tableDetail.columns);

      // 处理模块名称（将表名转换为驼峰命名并移除前缀）
      const moduleName = this.formatModuleName(tableName);

      // 创建默认配置
      const createConfigDto: CreateConfigDto = {
        moduleName,
        tableName,
        description: tableDetail.tableComment || `${moduleName}模块`,
        datasourceId,
        templateType,
        apiPrefix: `/api/${moduleName.toLowerCase().replace(/_/g, '-')}`,
        packageName: `com.adminflow.${moduleName
          .toLowerCase()
          .replace(/_/g, '.')}`,
        fields,
        pageConfig: this.generateDefaultPageConfig(moduleName),
        author,
      };

      return this.create(createConfigDto);
    } catch (error) {
      this.logger.error(`导入表结构失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  private formatModuleName(tableName: string): string {
    // 移除常见前缀（如：sys_、t_、tb_等）
    const nameWithoutPrefix = tableName.replace(/^(sys_|t_|tb_)/, '');

    // 转换为驼峰命名
    return nameWithoutPrefix
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
  }

  private generateFieldsConfig(columns: TableColumn[]): any[] {
    return columns.map((column) => {
      // 获取字段的TypeScript类型
      const tsType = this.mapDbTypeToTsType(column.type);

      // 确定控件类型
      const component = this.getComponentByDbColumn(column);

      // 是否为选择类型字段（通常带有status、type等关键字的字段）
      const isDictType =
        /status|type|state|flag/.test(column.name) &&
        (column.type === 'tinyint' ||
          column.type === 'int' ||
          column.type === 'smallint');

      // 查询类型
      const queryType = this.getQueryTypeByDbColumn(column);

      // 验证规则
      const validate = this.generateValidateRules(column);

      return {
        name: column.name,
        type: column.type,
        tsType,
        length: column.length,
        nullable: column.nullable,
        isPrimary: column.isPrimary,
        isAutoIncrement: column.isAutoIncrement,
        defaultValue: column.defaultValue,
        comment: column.comment || column.name,
        showInList:
          !column.name.includes('password') && !column.name.includes('salt'),
        showInForm:
          !column.isPrimary &&
          !column.name.includes('created_at') &&
          !column.name.includes('updated_at'),
        showInSearch: ['id', 'name', 'title', 'code', 'status', 'type'].some(
          (key) => column.name.includes(key),
        ),
        component,
        dictType: isDictType
          ? `${this.formatModuleName(column.name)}_dict`
          : '',
        queryType,
        validate,
      };
    });
  }

  private mapDbTypeToTsType(dbType: string): string {
    // 映射数据库类型到TypeScript类型
    const typeMap: Record<string, string> = {
      int: 'number',
      bigint: 'number',
      tinyint: 'number',
      smallint: 'number',
      float: 'number',
      double: 'number',
      decimal: 'number',
      varchar: 'string',
      char: 'string',
      text: 'string',
      longtext: 'string',
      date: 'Date',
      datetime: 'Date',
      timestamp: 'Date',
      boolean: 'boolean',
      json: 'object',
    };

    return typeMap[dbType.toLowerCase()] || 'string';
  }

  private getComponentByDbColumn(column: TableColumn): string {
    // 根据字段名和类型推断控件类型
    if (column.isPrimary) {
      return 'InputNumber';
    }

    if (column.name.includes('password')) {
      return 'InputPassword';
    }

    if (
      column.name.includes('content') ||
      column.name.includes('description') ||
      column.name.includes('remark')
    ) {
      return 'Textarea';
    }

    if (
      column.name.includes('image') ||
      column.name.includes('avatar') ||
      column.name.includes('logo')
    ) {
      return 'Upload';
    }

    if (
      column.name.includes('date') ||
      column.name.includes('time') ||
      column.type.includes('date') ||
      column.type.includes('time')
    ) {
      return 'DatePicker';
    }

    if (
      column.name.includes('status') ||
      column.name.includes('type') ||
      column.name.includes('state')
    ) {
      return 'Select';
    }

    if (
      column.name.includes('is_') ||
      column.name.includes('has_') ||
      (column.type === 'tinyint' && column.length === 1)
    ) {
      return 'Switch';
    }

    if (
      column.type === 'int' ||
      column.type === 'bigint' ||
      column.type === 'tinyint' ||
      column.type === 'smallint' ||
      column.type === 'float' ||
      column.type === 'double'
    ) {
      return 'InputNumber';
    }

    return 'Input';
  }

  private getQueryTypeByDbColumn(column: TableColumn): string {
    // 根据字段类型确定查询类型
    if (column.isPrimary) {
      return 'eq';
    }

    if (
      column.name.includes('name') ||
      column.name.includes('title') ||
      column.name.includes('desc') ||
      column.name.includes('remark')
    ) {
      return 'like';
    }

    if (
      column.type === 'int' ||
      column.type === 'bigint' ||
      column.type === 'tinyint' ||
      column.type === 'smallint' ||
      column.name.includes('status') ||
      column.name.includes('type')
    ) {
      return 'eq';
    }

    if (column.type.includes('date') || column.type.includes('time')) {
      return 'daterange';
    }

    return 'eq';
  }

  private generateValidateRules(column: TableColumn): any[] {
    const rules = [];

    // 必填验证
    if (
      !column.nullable &&
      !column.isPrimary &&
      !column.isAutoIncrement &&
      !column.name.includes('created_at') &&
      !column.name.includes('updated_at')
    ) {
      rules.push({
        required: true,
        message: `${column.comment || column.name}不能为空`,
      });
    }

    // 长度验证
    if (column.type === 'varchar' || column.type === 'char') {
      rules.push({
        max: column.length,
        message: `${column.comment || column.name}长度不能超过${column.length}`,
      });
    }

    return rules;
  }

  private generateDefaultPageConfig(moduleName: string): any {
    return {
      list: {
        title: `${moduleName}列表`,
        showCheckbox: true,
        showPagination: true,
        pageSize: 10,
        showOperation: true,
        operations: ['edit', 'delete', 'view'],
      },
      form: {
        width: '500px',
        labelWidth: '100px',
        labelPosition: 'right',
        size: 'medium',
      },
      permissions: {
        list: `${moduleName.toLowerCase()}:list`,
        create: `${moduleName.toLowerCase()}:create`,
        update: `${moduleName.toLowerCase()}:update`,
        delete: `${moduleName.toLowerCase()}:delete`,
        export: `${moduleName.toLowerCase()}:export`,
        import: `${moduleName.toLowerCase()}:import`,
      },
    };
  }
}
