import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Res,
  Header,
  Logger,
  Req,
  All,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SwaggerService } from './swagger.service';
import { SwaggerConfigDto } from './dto/swagger-config.dto';
import { Public } from 'src/core/decorators/public.decorator';
import { join } from 'path';

@ApiTags('Swagger工具')
@Controller('tool/swagger')
export class SwaggerController {
  private readonly logger = new Logger(SwaggerController.name);
  constructor(private readonly swaggerService: SwaggerService) {}

  @Public()
  @Get('json')
  @ApiOperation({ summary: '获取Swagger JSON文档' })
  @ApiResponse({ status: 200, description: 'Swagger文档数据' })
  getSwaggerJson() {
    return this.swaggerService.getSwaggerJson();
  }

  @Post('config')
  @ApiOperation({ summary: '修改Swagger配置' })
  @ApiResponse({ status: 200, description: '配置修改成功' })
  updateConfig(@Body() configDto: SwaggerConfigDto) {
    return this.swaggerService.updateConfig(configDto);
  }

  @Public()
  @Get('test')
  @ApiOperation({ summary: '接口测试页面' })
  @ApiResponse({ status: 200, description: '接口测试页面', type: Object })
  @Header('Content-Type', 'text/html')
  getTestPage(@Res() res) {
    const htmlPath = join(process.cwd(), 'templates/swagger-test.html');
    return res.sendFile(htmlPath);
  }

  @Public()
  @All('test/*')
  @ApiOperation({ summary: '接口测试' })
  @ApiResponse({ status: 200, description: '接口测试结果' })
  testApi(@Req() req, @Query() query: any, @Body() body?: any) {
    // 从原始URL中提取实际路径
    const fullPath = req.url.split('/test/')[1].split('?')[0];
    const method = query._method || req.method;

    return this.swaggerService.testApi(fullPath, query, body, method);
  }

  @Public()
  @Get('modules')
  @ApiOperation({ summary: '获取所有模块列表' })
  @ApiResponse({ status: 200, description: '模块列表' })
  getModules() {
    return this.swaggerService.getModules();
  }
  @Public()
  @Get('endpoints')
  @ApiOperation({ summary: '获取所有接口列表' })
  @ApiResponse({ status: 200, description: '接口列表' })
  async getEndpoints() {
    // 添加async/await确保等待Promise完成
    const result = await this.swaggerService.getEndpoints();
    this.logger.log('Endpoints result:', result);
    return result;
  }
}
