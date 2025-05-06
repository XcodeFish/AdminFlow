import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { OperationLogEntity } from '../operation-log/operation-log.entity';
import { ApiLogEntity } from '../api-log/api-log.entity';
import { LogStatsQueryDto } from './dto/dashboard.dto';
import { TimeGranularity, OperationStatus } from '../common/enums/logger.enum';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(OperationLogEntity)
    private operationLogRepository: Repository<OperationLogEntity>,
    @InjectRepository(ApiLogEntity)
    private apiLogRepository: Repository<ApiLogEntity>,
  ) {}

  /**
   * 获取操作日志统计数据
   * @param queryDto 查询条件
   */
  async getOperationStats(queryDto: LogStatsQueryDto) {
    const { startTime, endTime, timeGranularity = TimeGranularity.DAY } = queryDto;
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    // 查询条件
    const where = {
      operationTime: Between(startDate, endDate),
    };

    // 1. 获取各操作类型的操作次数
    const operationTypesCountQuery = await this.operationLogRepository
      .createQueryBuilder('log')
      .select('log.operationType', 'type')
      .addSelect('COUNT(log.id)', 'count')
      .where('log.operationTime BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('log.operationType')
      .getRawMany();

    const operationTypesCount = {};
    operationTypesCountQuery.forEach(item => {
      operationTypesCount[item.type] = parseInt(item.count, 10);
    });

    // 2. 获取操作成功与失败的次数
    const operationStatusCountQuery = await this.operationLogRepository
      .createQueryBuilder('log')
      .select('log.status', 'status')
      .addSelect('COUNT(log.id)', 'count')
      .where('log.operationTime BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('log.status')
      .getRawMany();

    const operationStatusCount = {
      success: 0,
      fail: 0,
    };

    operationStatusCountQuery.forEach(item => {
      if (parseInt(item.status, 10) === OperationStatus.SUCCESS) {
        operationStatusCount.success = parseInt(item.count, 10);
      } else {
        operationStatusCount.fail = parseInt(item.count, 10);
      }
    });

    // 3. 获取操作最频繁的模块TOP10
    const topModulesQuery = await this.operationLogRepository
      .createQueryBuilder('log')
      .select('log.module', 'name')
      .addSelect('COUNT(log.id)', 'count')
      .where('log.operationTime BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('log.module')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    const topModules = topModulesQuery.map(item => ({
      name: item.name,
      count: parseInt(item.count, 10),
    }));

    // 4. 获取操作最频繁的用户TOP10
    const topUsersQuery = await this.operationLogRepository
      .createQueryBuilder('log')
      .select('log.username', 'username')
      .addSelect('COUNT(log.id)', 'count')
      .where('log.operationTime BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('log.username')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    const topUsers = topUsersQuery.map(item => ({
      username: item.username,
      count: parseInt(item.count, 10),
    }));

    // 5. 获取时间分布
    const timeDistributionQuery = await this.getTimeDistribution(
      'operation',
      startDate,
      endDate,
      timeGranularity,
    );

    return {
      operationTypesCount,
      operationStatusCount,
      topModules,
      topUsers,
      timeDistribution: timeDistributionQuery,
    };
  }

  /**
   * 获取接口日志统计数据
   * @param queryDto 查询条件
   */
  async getApiStats(queryDto: LogStatsQueryDto) {
    const { startTime, endTime, timeGranularity = TimeGranularity.DAY } = queryDto;
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    // 1. 获取各HTTP方法的请求次数
    const methodCountQuery = await this.apiLogRepository
      .createQueryBuilder('log')
      .select('log.requestMethod', 'method')
      .addSelect('COUNT(log.id)', 'count')
      .where('log.requestTime BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('log.requestMethod')
      .getRawMany();

    const methodCount = {};
    methodCountQuery.forEach(item => {
      methodCount[item.method] = parseInt(item.count, 10);
    });

    // 2. 获取各HTTP状态码的分布
    const statusCountQuery = await this.apiLogRepository
      .createQueryBuilder('log')
      .select('log.status', 'status')
      .addSelect('COUNT(log.id)', 'count')
      .where('log.requestTime BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('log.status')
      .getRawMany();

    const statusCount = {};
    statusCountQuery.forEach(item => {
      statusCount[item.status] = parseInt(item.count, 10);
    });

    // 3. 获取响应最慢的接口TOP10
    const topSlowApisQuery = await this.apiLogRepository
      .createQueryBuilder('log')
      .select('log.requestUrl', 'url')
      .addSelect('log.requestMethod', 'method')
      .addSelect('AVG(log.duration)', 'avgDuration')
      .addSelect('COUNT(log.id)', 'count')
      .where('log.requestTime BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('log.requestUrl')
      .addGroupBy('log.requestMethod')
      .orderBy('avgDuration', 'DESC')
      .limit(10)
      .getRawMany();

    const topSlowApis = topSlowApisQuery.map(item => ({
      url: item.url,
      method: item.method,
      avgDuration: Math.round(parseFloat(item.avgDuration)),
      count: parseInt(item.count, 10),
    }));

    // 4. 获取错误率最高的接口TOP10
    const topErrorApisQuery = await this.apiLogRepository
      .createQueryBuilder('log')
      .select('log.requestUrl', 'url')
      .addSelect('log.requestMethod', 'method')
      .addSelect('COUNT(CASE WHEN log.status >= 400 THEN 1 ELSE NULL END)', 'errorCount')
      .addSelect('COUNT(log.id)', 'totalCount')
      .where('log.requestTime BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('log.requestUrl')
      .addGroupBy('log.requestMethod')
      .having('COUNT(log.id) > 5') // 只考虑调用次数大于5次的接口
      .orderBy('errorCount * 1.0 / totalCount', 'DESC') // 按错误率排序
      .limit(10)
      .getRawMany();

    const topErrorApis = topErrorApisQuery.map(item => ({
      url: item.url,
      method: item.method,
      errorCount: parseInt(item.errorCount, 10),
      totalCount: parseInt(item.totalCount, 10),
    }));

    // 5. 获取时间分布
    const timeDistributionQuery = await this.getTimeDistribution(
      'api',
      startDate,
      endDate,
      timeGranularity,
    );

    return {
      methodCount,
      statusCount,
      topSlowApis,
      topErrorApis,
      timeDistribution: timeDistributionQuery,
    };
  }

  /**
   * 获取时间分布数据
   * @param logType 日志类型
   * @param startDate 开始时间
   * @param endDate 结束时间
   * @param timeGranularity 时间粒度
   */
  private async getTimeDistribution(
    logType: 'operation' | 'api',
    startDate: Date,
    endDate: Date,
    timeGranularity: TimeGranularity,
  ) {
    let dateFormat: string;
    let dateColumn: string;

    // 根据日志类型确定使用的日期列
    if (logType === 'operation') {
      dateColumn = 'operationTime';
    } else {
      dateColumn = 'requestTime';
    }

    // 根据时间粒度确定日期格式
    switch (timeGranularity) {
      case TimeGranularity.HOUR:
        dateFormat = '%Y-%m-%d %H:00:00';
        break;
      case TimeGranularity.DAY:
        dateFormat = '%Y-%m-%d';
        break;
      case TimeGranularity.WEEK:
        dateFormat = '%Y-%u'; // ISO周格式：年-周数
        break;
      case TimeGranularity.MONTH:
        dateFormat = '%Y-%m';
        break;
      default:
        dateFormat = '%Y-%m-%d';
    }

    const repository = logType === 'operation' ? this.operationLogRepository : this.apiLogRepository;
    
    // 基础查询
    const query = repository
      .createQueryBuilder('log')
      .where(`log.${dateColumn} BETWEEN :startDate AND :endDate`, { startDate, endDate });

    if (logType === 'api') {
      // 接口日志需要额外计算平均响应时间
      return await query
        .select(`DATE_FORMAT(log.${dateColumn}, '${dateFormat}')`, 'time')
        .addSelect('COUNT(log.id)', 'count')
        .addSelect('AVG(log.duration)', 'avgDuration')
        .groupBy('time')
        .orderBy('time', 'ASC')
        .getRawMany()
        .then(results => results.map(item => ({
          time: item.time,
          count: parseInt(item.count, 10),
          avgDuration: Math.round(parseFloat(item.avgDuration)),
        })));
    } else {
      // 操作日志只需要计算次数
      return await query
        .select(`DATE_FORMAT(log.${dateColumn}, '${dateFormat}')`, 'time')
        .addSelect('COUNT(log.id)', 'count')
        .groupBy('time')
        .orderBy('time', 'ASC')
        .getRawMany()
        .then(results => results.map(item => ({
          time: item.time,
          count: parseInt(item.count, 10),
        })));
    }
  }
}
