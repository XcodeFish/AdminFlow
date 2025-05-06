import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { LogStatsQueryDto, OperationLogStatsDto, ApiLogStatsDto } from './dto/dashboard.dto';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { Permissions } from '../../core/decorators/permissions.decorator';

@ApiTags('日志统计分析')
@Controller('api/v1/logger/dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('operation-stats')
  @ApiOperation({ summary: '获取操作日志统计数据' })
  @ApiResponse({ status: 200, description: '操作成功', type: OperationLogStatsDto })
  @Permissions('logger:view')
  async getOperationStats(@Query() queryDto: LogStatsQueryDto) {
    const stats = await this.dashboardService.getOperationStats(queryDto);
    return {
      code: 200,
      message: '操作成功',
      data: stats,
      timestamp: Date.now()
    };
  }

  @Get('api-stats')
  @ApiOperation({ summary: '获取接口日志统计数据' })
  @ApiResponse({ status: 200, description: '操作成功', type: ApiLogStatsDto })
  @Permissions('logger:view')
  async getApiStats(@Query() queryDto: LogStatsQueryDto) {
    const stats = await this.dashboardService.getApiStats(queryDto);
    return {
      code: 200,
      message: '操作成功',
      data: stats,
      timestamp: Date.now()
    };
  }
}
