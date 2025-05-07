import { Controller, Get, Delete, Param, Query, Body, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { OperationLogService } from './operation-log.service';
import { OperationLogQueryDto, OperationLogDetailDto, DeleteOperationLogDto } from './dto/operation-log.dto';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { Permissions } from '../../core/decorators/permissions.decorator';
import { OperationLog } from './decorators/operation-log.decorator';
import { OperationType } from '../common/enums/logger.enum';
import { ExcelExportUtil } from '../common/utils/excel.util';

@ApiTags('操作日志管理')
@Controller('logger/operation')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OperationLogController {
  constructor(private readonly operationLogService: OperationLogService) {}

  @Get('list')
  @ApiOperation({ summary: '获取操作日志列表' })
  @ApiResponse({ status: 200, description: '操作成功' })
  @Permissions('logger:operation:view')
  async findAll(@Query() queryDto: OperationLogQueryDto) {
    const result = await this.operationLogService.findAll(queryDto);
    // return {
    //   code: 200,
    //   message: '操作成功',
    //   data: result,
    //   timestamp: Date.now()
    // };
    return result;
  }

  @Get(':id')
  @ApiOperation({ summary: '获取操作日志详情' })
  @ApiResponse({ status: 200, description: '操作成功', type: OperationLogDetailDto })
  @Permissions('logger:operation:view')
  async findOne(@Param('id') id: string) {
    const log = await this.operationLogService.findOne(+id);

    // 将JSON字符串转换为对象
    if (log) {
      if (log.requestParams) {
        try {
          log.requestParams = JSON.parse(log.requestParams);
        } catch (e) {
          // 忽略解析错误
        }
      }

      if (log.responseResult) {
        try {
          log.responseResult = JSON.parse(log.responseResult);
        } catch (e) {
          // 忽略解析错误
        }
      }
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
  @ApiOperation({ summary: '删除操作日志' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @Permissions('logger:operation:delete')
  @OperationLog({
    module: '操作日志',
    operationType: OperationType.DELETE,
    operationName: '删除操作日志',
  })
  async remove(@Body() deleteDto: DeleteOperationLogDto) {
    const result = await this.operationLogService.remove(deleteDto);
    // return {
    //   code: 200,
    //   message: '删除成功',
    //   data: result,
    //   timestamp: Date.now()
    // };
    return result;
  }

  @Delete('clean')
  @ApiOperation({ summary: '清空操作日志' })
  @ApiResponse({ status: 200, description: '清空成功' })
  @Permissions('logger:operation:delete')
  @OperationLog({
    module: '操作日志',
    operationType: OperationType.DELETE,
    operationName: '清空操作日志',
  })
  async clean() {
    await this.operationLogService.clean();
    // return {
    //   code: 200,
    //   message: '清空成功',
    //   data: null,
    //   timestamp: Date.now()
    // };
    return null;
  }

  @Get('export')
  @ApiOperation({ summary: '导出操作日志' })
  @ApiResponse({ status: 200, description: '导出成功', content: { 'application/vnd.ms-excel': {} } })
  @Permissions('logger:operation:export')
  @OperationLog({
    module: '操作日志',
    operationType: OperationType.EXPORT,
    operationName: '导出操作日志',
  })
  async export(@Res() response: Response, @Query() queryDto: OperationLogQueryDto) {
    // 获取符合条件的操作日志数据
    const logs = await this.operationLogService.export(queryDto);

    // 使用工具类导出Excel
    await ExcelExportUtil.exportOperationLogs(response, logs);
  }
}
