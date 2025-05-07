import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Res,
  Logger,
  ParseIntPipe,
  Query,
  StreamableFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Response } from 'express';
import * as fs from 'fs-extra';
import { GeneratorService } from './services/generator.service';
import { GenerateOptionsDto } from './dto/generate-options.dto';

@ApiTags('代码生成器-代码生成')
@ApiBearerAuth()
@Controller('generator/generate')
export class GenerateController {
  private readonly logger = new Logger(GenerateController.name);

  constructor(private readonly generatorService: GeneratorService) {}

  @Get('preview/:configId')
  @ApiOperation({ summary: '预览代码生成结果' })
  @ApiResponse({ status: 200, description: '预览成功' })
  async preview(@Param('configId', ParseIntPipe) configId: number) {
    this.logger.log(`预览代码生成, 配置ID: ${configId}`);
    const result = await this.generatorService.preview(configId);
    // return {
    //   code: 200,
    //   message: '操作成功',
    //   data: result,
    // };
    return result;
  }

  @Post('deploy/:configId')
  @ApiOperation({ summary: '生成并部署代码' })
  @ApiResponse({ status: 200, description: '部署成功' })
  async deploy(
    @Param('configId', ParseIntPipe) configId: number,
    @Body('options') options?: GenerateOptionsDto,
  ) {
    this.logger.log(
      `部署代码, 配置ID: ${configId}, 选项: ${JSON.stringify(options)}`,
    );
    const result = await this.generatorService.deploy(configId, options);
    // return {
    //   code: 200,
    //   message: '生成并部署成功',
    //   data: result,
    // };
    return result;
  }

  @Get('download/:configId')
  @ApiOperation({ summary: '下载生成的代码' })
  @ApiResponse({ status: 200, description: '下载成功', type: StreamableFile })
  async download(
    @Param('configId', ParseIntPipe) configId: number,
    @Query('type') type: 'all' | 'frontend' | 'backend' = 'all',
    @Res({ passthrough: true }) res: Response,
  ) {
    this.logger.log(`下载代码, 配置ID: ${configId}, 类型: ${type}`);
    const zipFilePath = await this.generatorService.download(configId, type);

    const fileName = `code-${new Date().toISOString().slice(0, 10)}.zip`;
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename=${fileName}`,
    });

    const fileStream = fs.createReadStream(zipFilePath);

    // 返回后清理临时文件
    fileStream.on('end', () => {
      fs.remove(zipFilePath).catch((err) => {
        this.logger.error(`清理临时文件失败: ${err.message}`, err.stack);
      });
    });

    return new StreamableFile(fileStream);
  }

  @Get('task-status/:taskId')
  @ApiOperation({ summary: '获取生成任务状态' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getTaskStatus(@Param('taskId') taskId: string) {
    this.logger.log(`获取任务状态, 任务ID: ${taskId}`);
    const result = await this.generatorService.getTaskStatus(taskId);
    // return {
    //   code: 200,
    //   message: '操作成功',
    //   data: result,
    // };
    return result;
  }
}
