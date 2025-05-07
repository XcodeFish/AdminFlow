import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import * as Handlebars from 'handlebars';
import * as fs from 'fs-extra';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as archiver from 'archiver';
import { ConfigService } from '../../config/services/config.service';
import { TemplateService } from '../../template/services/template.service';
import { GenerateOptionsDto } from '../dto/generate-options.dto';

export interface GeneratedFile {
  fileName: string;
  relativePath: string;
  content: string;
  type: 'frontend' | 'backend' | 'sql';
}

export interface GeneratePreviewResult {
  frontend: GeneratedFile[];
  backend: GeneratedFile[];
  sql: GeneratedFile[];
}

export interface DeployResult {
  taskId: string;
  files: {
    frontend: number;
    backend: number;
    sql: number;
  };
  generatedAt: Date;
  deployStatus: string;
  accessUrl: string;
}

@Injectable()
export class GeneratorService {
  private readonly logger = new Logger(GeneratorService.name);
  private readonly tempDir = path.join(process.cwd(), 'temp');
  private readonly frontendDir = path.join(process.cwd(), '../frontend');
  private readonly backendDir = path.join(process.cwd(), '.');
  private readonly tasks = new Map<string, any>();

  constructor(
    private configService: ConfigService,
    private templateService: TemplateService,
  ) {
    // 确保临时目录存在
    fs.ensureDirSync(this.tempDir);
  }

  async preview(configId: number): Promise<GeneratePreviewResult> {
    try {
      const config = await this.configService.findOne(configId);
      if (!config) {
        throw new NotFoundException(`代码生成配置 [ID: ${configId}] 不存在`);
      }

      // 准备模板变量
      const templateVars = this.prepareTemplateVariables(config);

      // 生成前端代码
      const frontendFiles = await this.generateFrontendCode(templateVars);

      // 生成后端代码
      const backendFiles = await this.generateBackendCode(templateVars);

      // 生成SQL脚本
      const sqlFiles = await this.generateSqlCode(templateVars);

      return {
        frontend: frontendFiles,
        backend: backendFiles,
        sql: sqlFiles,
      };
    } catch (error) {
      this.logger.error(`生成代码预览失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  async deploy(
    configId: number,
    options?: GenerateOptionsDto,
  ): Promise<DeployResult> {
    try {
      // 生成预览代码
      const previewResult = await this.preview(configId);

      // 创建部署任务
      const taskId = `gen-task-${new Date()
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, '')}-${uuidv4().substring(0, 6)}`;
      const task = {
        id: taskId,
        configId,
        status: 'processing',
        progress: 0,
        startTime: new Date(),
        logs: [{ time: new Date(), message: '开始生成代码' }],
        options: options || {
          overwrite: true,
          generateFrontend: true,
          generateBackend: true,
          generateSql: true,
          registerMenu: true,
          registerPermission: true,
        },
      };

      this.tasks.set(taskId, task);

      // 异步部署代码
      this.deployCode(taskId, previewResult, task.options).catch((error) => {
        this.logger.error(`部署代码失败: ${error.message}`, error.stack);
        const task = this.tasks.get(taskId);
        if (task) {
          task.status = 'failed';
          task.logs.push({
            time: new Date(),
            message: `部署失败: ${error.message}`,
          });
        }
      });

      // 更新配置状态
      const config = await this.configService.findOne(configId);
      await this.configService.update(configId, {
        isGenerated: true,
        generatedAt: new Date(),
      });

      return {
        taskId,
        files: {
          frontend: previewResult.frontend.length,
          backend: previewResult.backend.length,
          sql: previewResult.sql.length,
        },
        generatedAt: new Date(),
        deployStatus: 'processing',
        accessUrl: config.apiPrefix,
      };
    } catch (error) {
      this.logger.error(`部署代码失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  async download(
    configId: number,
    type: 'all' | 'frontend' | 'backend' = 'all',
  ): Promise<string> {
    try {
      // 生成预览代码
      const previewResult = await this.preview(configId);

      // 获取配置信息
      const config = await this.configService.findOne(configId);

      // 创建临时目录
      const tempDir = path.join(this.tempDir, uuidv4());
      fs.ensureDirSync(tempDir);

      // 写入文件
      if (type === 'all' || type === 'frontend') {
        for (const file of previewResult.frontend) {
          const filePath = path.join(tempDir, 'frontend', file.relativePath);
          fs.ensureDirSync(path.dirname(filePath));
          fs.writeFileSync(filePath, file.content);
        }
      }

      if (type === 'all' || type === 'backend') {
        for (const file of previewResult.backend) {
          const filePath = path.join(tempDir, 'backend', file.relativePath);
          fs.ensureDirSync(path.dirname(filePath));
          fs.writeFileSync(filePath, file.content);
        }
      }

      if (type === 'all') {
        for (const file of previewResult.sql) {
          const filePath = path.join(tempDir, 'sql', file.relativePath);
          fs.ensureDirSync(path.dirname(filePath));
          fs.writeFileSync(filePath, file.content);
        }
      }

      // 创建ZIP文件
      const zipFileName = `${config.moduleName}-${new Date()
        .toISOString()
        .slice(0, 10)}.zip`;
      const zipFilePath = path.join(this.tempDir, zipFileName);

      await this.createZipArchive(tempDir, zipFilePath);

      // 删除临时目录
      fs.removeSync(tempDir);

      return zipFilePath;
    } catch (error) {
      this.logger.error(`下载代码失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getTaskStatus(taskId: string): Promise<any> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new NotFoundException(`任务 [ID: ${taskId}] 不存在`);
    }
    return task;
  }

  private async deployCode(
    taskId: string,
    previewResult: GeneratePreviewResult,
    options: GenerateOptionsDto,
  ): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) {
      return;
    }

    try {
      // 部署前端代码
      if (options.generateFrontend) {
        task.logs.push({ time: new Date(), message: '开始部署前端代码' });
        for (const file of previewResult.frontend) {
          const filePath = path.join(this.frontendDir, file.relativePath);
          fs.ensureDirSync(path.dirname(filePath));

          // 检查文件是否存在
          if (!options.overwrite && fs.existsSync(filePath)) {
            this.logger.warn(`文件已存在，跳过: ${filePath}`);
            continue;
          }

          fs.writeFileSync(filePath, file.content);
          this.logger.log(`已写入文件: ${filePath}`);
        }
        task.progress = 33;
        task.logs.push({ time: new Date(), message: '前端代码部署完成' });
      }

      // 部署后端代码
      if (options.generateBackend) {
        task.logs.push({ time: new Date(), message: '开始部署后端代码' });
        for (const file of previewResult.backend) {
          const filePath = path.join(this.backendDir, file.relativePath);
          fs.ensureDirSync(path.dirname(filePath));

          // 检查文件是否存在
          if (!options.overwrite && fs.existsSync(filePath)) {
            this.logger.warn(`文件已存在，跳过: ${filePath}`);
            continue;
          }

          fs.writeFileSync(filePath, file.content);
          this.logger.log(`已写入文件: ${filePath}`);
        }
        task.progress = 66;
        task.logs.push({ time: new Date(), message: '后端代码部署完成' });
      }

      // 部署SQL脚本
      if (options.generateSql) {
        task.logs.push({ time: new Date(), message: '开始部署SQL脚本' });
        const sqlDir = path.join(this.backendDir, 'sql');
        fs.ensureDirSync(sqlDir);

        for (const file of previewResult.sql) {
          const filePath = path.join(sqlDir, file.relativePath);
          fs.ensureDirSync(path.dirname(filePath));

          // 检查文件是否存在
          if (!options.overwrite && fs.existsSync(filePath)) {
            this.logger.warn(`文件已存在，跳过: ${filePath}`);
            continue;
          }

          fs.writeFileSync(filePath, file.content);
          this.logger.log(`已写入文件: ${filePath}`);
        }
        task.progress = 90;
        task.logs.push({ time: new Date(), message: 'SQL脚本部署完成' });
      }

      // 更新任务状态
      task.status = 'completed';
      task.progress = 100;
      task.endTime = new Date();
      task.logs.push({ time: new Date(), message: '代码部署完成' });
    } catch (error) {
      this.logger.error(`部署代码失败: ${error.message}`, error.stack);
      task.status = 'failed';
      task.logs.push({
        time: new Date(),
        message: `部署失败: ${error.message}`,
      });
      throw error;
    }
  }

  private async createZipArchive(
    sourceDir: string,
    outputPath: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(outputPath);
      const archive = archiver('zip', {
        zlib: { level: 9 },
      });

      output.on('close', () => {
        resolve();
      });

      archive.on('error', (err) => {
        reject(err);
      });

      archive.pipe(output);
      archive.directory(sourceDir, false);
      archive.finalize();
    });
  }

  private prepareTemplateVariables(config: any): any {
    // 处理模块名转换为类名（首字母大写驼峰）
    const className = this.toPascalCase(config.moduleName);

    // 处理文件名（小写，带连字符）
    const fileName = this.toKebabCase(config.moduleName);

    // 处理属性名（首字母小写驼峰）
    const propertyName = this.toCamelCase(config.moduleName);

    return {
      ...config,
      className,
      fileName,
      propertyName,
    };
  }

  private async generateFrontendCode(
    templateVars: any,
  ): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];

    try {
      // 获取前端模板
      const listTemplate = await this.templateService.findByKey('vue-list');
      const apiTemplate = await this.templateService.findByKey('vue-api');

      // 编译模板
      const compiledListTemplate = Handlebars.compile(listTemplate.content);
      const compiledApiTemplate = Handlebars.compile(apiTemplate.content);

      // 渲染模板
      const listContent = compiledListTemplate(templateVars);
      const apiContent = compiledApiTemplate(templateVars);

      // 添加到结果
      files.push({
        fileName: `${templateVars.fileName}.vue`,
        relativePath: `src/views/${templateVars.fileName}/index.vue`,
        content: listContent,
        type: 'frontend',
      });

      files.push({
        fileName: `${templateVars.fileName}.js`,
        relativePath: `src/api/${templateVars.fileName}.js`,
        content: apiContent,
        type: 'frontend',
      });
    } catch (error) {
      this.logger.error(`生成前端代码失败: ${error.message}`, error.stack);
      throw error;
    }

    return files;
  }

  private async generateBackendCode(
    templateVars: any,
  ): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];

    try {
      // 获取后端模板
      const entityTemplate = await this.templateService.findByKey('entity');
      const dtoTemplate = await this.templateService.findByKey('dto');
      const controllerTemplate = await this.templateService.findByKey(
        'controller',
      );
      const serviceTemplate = await this.templateService.findByKey('service');

      // 编译模板
      const compiledEntityTemplate = Handlebars.compile(entityTemplate.content);
      const compiledDtoTemplate = Handlebars.compile(dtoTemplate.content);
      const compiledControllerTemplate = Handlebars.compile(
        controllerTemplate.content,
      );
      const compiledServiceTemplate = Handlebars.compile(
        serviceTemplate.content,
      );

      // 渲染模板
      const entityContent = compiledEntityTemplate(templateVars);
      const dtoContent = compiledDtoTemplate(templateVars);
      const controllerContent = compiledControllerTemplate(templateVars);
      const serviceContent = compiledServiceTemplate(templateVars);

      // 添加到结果
      const modulePath = `src/modules/${templateVars.fileName}`;

      files.push({
        fileName: `${templateVars.fileName}.entity.ts`,
        relativePath: `${modulePath}/entities/${templateVars.fileName}.entity.ts`,
        content: entityContent,
        type: 'backend',
      });

      files.push({
        fileName: `create-${templateVars.fileName}.dto.ts`,
        relativePath: `${modulePath}/dto/create-${templateVars.fileName}.dto.ts`,
        content: dtoContent,
        type: 'backend',
      });

      files.push({
        fileName: `update-${templateVars.fileName}.dto.ts`,
        relativePath: `${modulePath}/dto/update-${templateVars.fileName}.dto.ts`,
        content: `import { PartialType } from '@nestjs/mapped-types';\nimport { Create${templateVars.className}Dto } from './create-${templateVars.fileName}.dto';\n\nexport class Update${templateVars.className}Dto extends PartialType(Create${templateVars.className}Dto) {}`,
        type: 'backend',
      });

      files.push({
        fileName: `query-${templateVars.fileName}.dto.ts`,
        relativePath: `${modulePath}/dto/query-${templateVars.fileName}.dto.ts`,
        content: `import { IsString, IsOptional, IsNumber, Min } from 'class-validator';\nimport { Type } from 'class-transformer';\n\nexport class Query${templateVars.className}Dto {\n  @IsOptional()\n  @IsNumber()\n  @Min(1)\n  @Type(() => Number)\n  page?: number = 1;\n\n  @IsOptional()\n  @IsNumber()\n  @Min(1)\n  @Type(() => Number)\n  limit?: number = 10;\n}`,
        type: 'backend',
      });

      files.push({
        fileName: `${templateVars.fileName}.controller.ts`,
        relativePath: `${modulePath}/${templateVars.fileName}.controller.ts`,
        content: controllerContent,
        type: 'backend',
      });

      files.push({
        fileName: `${templateVars.fileName}.service.ts`,
        relativePath: `${modulePath}/${templateVars.fileName}.service.ts`,
        content: serviceContent,
        type: 'backend',
      });

      files.push({
        fileName: `${templateVars.fileName}.module.ts`,
        relativePath: `${modulePath}/${templateVars.fileName}.module.ts`,
        content: `import { Module } from '@nestjs/common';\nimport { TypeOrmModule } from '@nestjs/typeorm';\nimport { ${templateVars.className}Controller } from './${templateVars.fileName}.controller';\nimport { ${templateVars.className}Service } from './${templateVars.fileName}.service';\nimport { ${templateVars.className} } from './entities/${templateVars.fileName}.entity';\n\n@Module({\n  imports: [\n    TypeOrmModule.forFeature([${templateVars.className}]),\n  ],\n  controllers: [${templateVars.className}Controller],\n  providers: [${templateVars.className}Service],\n  exports: [${templateVars.className}Service],\n})\nexport class ${templateVars.className}Module {}`,
        type: 'backend',
      });
    } catch (error) {
      this.logger.error(`生成后端代码失败: ${error.message}`, error.stack);
      throw error;
    }

    return files;
  }

  private async generateSqlCode(templateVars: any): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];

    // 简单生成一个SQL文件示例
    const sqlContent = `-- ${templateVars.moduleName} 模块相关SQL脚本
-- 创建于 ${new Date().toISOString()}

-- 添加菜单
INSERT INTO sys_menu (name, path, component, parent_id, icon, sort, permissions)
VALUES ('${templateVars.moduleDescription || templateVars.moduleName}管理', '${
      templateVars.apiPrefix
    }', '${templateVars.fileName}', 0, 'el-icon-document', 100, '${
      templateVars.fileName
    }:list');

-- 添加权限
INSERT INTO sys_permission (code, name, menu_id) VALUES ('${
      templateVars.fileName
    }:list', '查看${
      templateVars.moduleDescription || templateVars.moduleName
    }', LAST_INSERT_ID());
INSERT INTO sys_permission (code, name, menu_id) VALUES ('${
      templateVars.fileName
    }:create', '新增${
      templateVars.moduleDescription || templateVars.moduleName
    }', LAST_INSERT_ID());
INSERT INTO sys_permission (code, name, menu_id) VALUES ('${
      templateVars.fileName
    }:update', '修改${
      templateVars.moduleDescription || templateVars.moduleName
    }', LAST_INSERT_ID());
INSERT INTO sys_permission (code, name, menu_id) VALUES ('${
      templateVars.fileName
    }:delete', '删除${
      templateVars.moduleDescription || templateVars.moduleName
    }', LAST_INSERT_ID());
`;

    files.push({
      fileName: `${templateVars.fileName}-module.sql`,
      relativePath: `${templateVars.fileName}-module.sql`,
      content: sqlContent,
      type: 'sql',
    });

    return files;
  }

  private toPascalCase(str: string): string {
    return str
      .split(/[-_\s]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  private toCamelCase(str: string): string {
    const pascal = this.toPascalCase(str);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
  }

  private toKebabCase(str: string): string {
    return str
      .split(/[-_\s]+/)
      .map((word) => word.toLowerCase())
      .join('-');
  }
}
