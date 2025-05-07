import { Controller, Get, Delete, Param, Query, Body, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { ApiLogService } from './api-log.service';
import { ApiLogQueryDto, ApiLogDetailDto, DeleteApiLogDto } from './dto/api-log.dto';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { Permissions } from '../../core/decorators/permissions.decorator';
import { OperationLog } from '../operation-log/decorators/operation-log.decorator';
import { OperationType } from '../common/enums/logger.enum';
import { ExcelExportUtil } from '../common/utils/excel.util';

@ApiTags('接口日志管理')
@Controller('logger/api')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ApiLogController {
  constructor(private readonly apiLogService: ApiLogService) {}

  @Get('list')
  @ApiOperation({ summary: '获取接口日志列表' })
  @ApiResponse({ status: 200, description: '操作成功' })
  @Permissions('logger:api:view')
  async findAll(@Query() queryDto: ApiLogQueryDto) {
    const result = await this.apiLogService.findAll(queryDto);
    // return {
    //   code: 200,
    //   message: '操作成功',
    //   data: result,
    //   timestamp: Date.now()
    // };
    return result;
  }

  @Get(':id')
  @ApiOperation({ summary: '获取接口日志详情' })
  @ApiResponse({ status: 200, description: '操作成功', type: ApiLogDetailDto })
  @Permissions('logger:api:view')
  async findOne(@Param('id') id: string) {
    const log = await this.apiLogService.findOne(+id);

    // 将JSON字符串转换为对象
    if (log) {
      const jsonFields = ['requestHeaders', 'requestParams', 'responseHeaders', 'responseBody'];

      jsonFields.forEach(field => {
        if (log[field]) {
          try {
            log[field] = JSON.parse(log[field]);
          } catch (e) {
            // 忽略解析错误
          }
        }
      });
    }

      // return {
      //   code: 200,
      //   message: '操作成功',
      //   data: log,
      //   timestamp: Date.now()
      // };
      return log;
  }

  @Delete('')
  @ApiOperation({ summary: '删除接口日志' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @Permissions('logger:api:delete')
  @OperationLog({
    module: '接口日志',
    operationType: OperationType.DELETE,
    operationName: '删除接口日志',
  })
  async remove(@Body() deleteDto: DeleteApiLogDto) {
    const result = await this.apiLogService.remove(deleteDto);
    // return {
    //   code: 200,
    //   message: '删除成功',
    //   data: result,
    //     timestamp: Date.now()
    //   };
       return result;
  }

  @Delete('clean')
  @ApiOperation({ summary: '清空接口日志' })
  @ApiResponse({ status: 200, description: '清空成功' })
  @Permissions('logger:api:delete')
  @OperationLog({
    module: '接口日志',
    operationType: OperationType.DELETE,
    operationName: '清空接口日志',
  })
  async clean() {
    await this.apiLogService.clean();
    return {
      code: 200,
      message: '清空成功',
      data: null,
      timestamp: Date.now()
    };
  }

  @Get('export')
  @ApiOperation({ summary: '导出接口日志' })
  @ApiResponse({ status: 200, description: '导出成功', content: { 'application/vnd.ms-excel': {} } })
  @Permissions('logger:api:export')
  @OperationLog({
    module: '接口日志',
    operationType: OperationType.EXPORT,
    operationName: '导出接口日志',
  })
  async export(@Res() response: Response, @Query() queryDto: ApiLogQueryDto) {
    // 获取符合条件的接口日志数据
    const logs = await this.apiLogService.export(queryDto);

    // 使用工具类导出Excel
    await ExcelExportUtil.exportApiLogs(response, logs);
  }
}
