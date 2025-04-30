import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerConfigDto } from './dto/swagger-config.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as fs from 'fs';
import * as path from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpAdapterHost } from '@nestjs/core';

@Injectable()
export class SwaggerService {
  private readonly logger = new Logger(SwaggerService.name);
  private swaggerJson: any = null;
  private config: SwaggerConfigDto = {
    title: 'Admin flow API',
    description: 'Admin flow API文档',
    version: '1.0',
    basePath: '/api/v1',
  };

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly adapterHost: HttpAdapterHost,
  ) {
    // 初始化配置
    this.initConfig();
  }

  private initConfig() {
    try {
      const configPath = path.join(process.cwd(), 'swagger-config.json');
      if (fs.existsSync(configPath)) {
        const configData = fs.readFileSync(configPath, 'utf8');
        this.config = JSON.parse(configData);
      } else {
        // 保存默认配置
        fs.writeFileSync(
          configPath,
          JSON.stringify(this.config, null, 2),
          'utf8',
        );
      }
    } catch (error) {
      this.logger.error('初始化Swagger配置失败', error);
    }
  }

  async getSwaggerJson() {
    if (!this.swaggerJson) {
      try {
        // 提供基本的静态Swagger结构
        this.swaggerJson = {
          openapi: '3.0.0',
          info: {
            title: this.config.title || 'API',
            description: this.config.description || 'API文档',
            version: this.config.version || '1.0',
          },
          tags: [{ name: '默认', description: '默认API分组' }],
          paths: {},
        };

        // 如果需要，可以从文件加载更详细的文档
        // const jsonPath = path.join(process.cwd(), 'swagger-docs.json');
        // if (fs.existsSync(jsonPath)) {
        //   const data = fs.readFileSync(jsonPath, 'utf8');
        //   this.swaggerJson = JSON.parse(data);
        // }
      } catch (error) {
        this.logger.error('获取Swagger文档失败', error);
        return { error: '获取Swagger文档失败' };
      }
    }
    return this.swaggerJson;
  }

  async updateConfig(configDto: SwaggerConfigDto) {
    try {
      this.config = { ...this.config, ...configDto };
      const configPath = path.join(process.cwd(), 'swagger-config.json');
      fs.writeFileSync(
        configPath,
        JSON.stringify(this.config, null, 2),
        'utf8',
      );
      // 清空缓存，下次获取时重新加载
      this.swaggerJson = null;
      return { message: '配置更新成功' };
    } catch (error) {
      this.logger.error('更新Swagger配置失败', error);
      return { error: '更新配置失败' };
    }
  }

  async testApi(path: string, query: any, body?: any, method: string = 'GET') {
    try {
      // 修复：获取完整的apiPrefix，包括v1部分
      const apiPrefix = this.configService.get('app.apiPrefix', 'api/v1');
      const port = this.configService.get('PORT', 3000);

      // 调试日志
      this.logger.log(`当前配置: apiPrefix=${apiPrefix}, port=${port}`);

      // 构建URL时使用完整的apiPrefix
      const baseUrl = `http://localhost:${port}/`;

      // 避免路径拼接问题
      const formattedPath = path.startsWith('/') ? path.substring(1) : path;
      const url = `${baseUrl}${apiPrefix}/${formattedPath}`;

      this.logger.log(`测试请求URL: ${method} ${url}`);

      // 其余代码不变...
    } catch (error) {
      // ...
    }
  }

  async getModules() {
    const swaggerData = await this.getSwaggerJson();
    if (!swaggerData || swaggerData.error) {
      return { error: '获取模块列表失败' };
    }

    // 从tags中提取模块信息
    const modules = swaggerData.tags.map((tag) => ({
      name: tag.name,
      description: tag.description,
    }));

    return modules;
  }

  async getEndpoints() {
    const swaggerData = await this.getSwaggerJson();
    if (!swaggerData || swaggerData.error) {
      return { error: '获取接口列表失败' };
    }

    const endpoints: any[] = [];
    const paths = swaggerData.paths;

    for (const path in paths) {
      for (const method in paths[path]) {
        const endpoint = paths[path][method];
        endpoints.push({
          path,
          method: method.toUpperCase(),
          summary: endpoint.summary,
          description: endpoint.description,
          tags: endpoint.tags,
          parameters: endpoint.parameters,
          responses: endpoint.responses,
          security: endpoint.security,
        });
      }
    }

    return endpoints;
  }
}
