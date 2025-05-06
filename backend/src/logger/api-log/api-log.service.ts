import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like, MoreThanOrEqual } from 'typeorm';
import { ApiLogEntity } from './api-log.entity';
import { ApiLogQueryDto, DeleteApiLogDto } from './dto/api-log.dto';

@Injectable()
export class ApiLogService {
  constructor(
    @InjectRepository(ApiLogEntity)
    private apiLogRepository: Repository<ApiLogEntity>,
  ) {}

  /**
   * 创建接口日志
   * @param apiLog 接口日志对象
   */
  async create(apiLog: Partial<ApiLogEntity>): Promise<ApiLogEntity> {
    const log = this.apiLogRepository.create(apiLog);
    return this.apiLogRepository.save(log);
  }

  /**
   * 分页查询接口日志
   * @param queryDto 查询条件
   */
  async findAll(queryDto: ApiLogQueryDto): Promise<{
    list: ApiLogEntity[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const { 
      page = 1, 
      pageSize = 10, 
      startTime, 
      endTime, 
      requestUrl, 
      requestMethod, 
      status, 
      errorLevel,
      minDuration
    } = queryDto;

    // 构建查询条件
    const where: any = {};
    
    // 时间范围
    if (startTime && endTime) {
      where.requestTime = Between(new Date(startTime), new Date(endTime));
    }
    
    // 请求URL模糊查询
    if (requestUrl) {
      where.requestUrl = Like(`%${requestUrl}%`);
    }
    
    // 请求方法
    if (requestMethod) {
      where.requestMethod = requestMethod;
    }
    
    // HTTP状态码
    if (status !== undefined) {
      where.status = status;
    }
    
    // 错误级别
    if (errorLevel) {
      where.errorLevel = errorLevel;
    }
    
    // 最小耗时（筛选慢请求）
    if (minDuration !== undefined) {
      where.duration = MoreThanOrEqual(minDuration);
    }

    // 查询总记录数
    const total = await this.apiLogRepository.count({ where });
    
    // 分页查询
    const list = await this.apiLogRepository.find({
      where,
      order: { requestTime: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    
    const totalPages = Math.ceil(total / pageSize);
    
    return {
      list,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  /**
   * 根据ID查询接口日志详情
   * @param id 日志ID
   */
  async findOne(id: number): Promise<ApiLogEntity> {
    return this.apiLogRepository.findOne({ where: { id } });
  }

  /**
   * 批量删除接口日志
   * @param deleteDto 删除参数
   */
  async remove(deleteDto: DeleteApiLogDto): Promise<{ deletedCount: number }> {
    const { ids } = deleteDto;
    const result = await this.apiLogRepository.delete(ids);
    return { deletedCount: result.affected || 0 };
  }

  /**
   * 清空接口日志
   */
  async clean(): Promise<void> {
    await this.apiLogRepository.clear();
  }

  /**
   * 导出接口日志数据
   * @param queryDto 查询条件
   */
  async export(queryDto: ApiLogQueryDto): Promise<ApiLogEntity[]> {
    const { 
      startTime, 
      endTime, 
      requestUrl, 
      requestMethod, 
      status, 
      errorLevel,
      minDuration
    } = queryDto;

    // 构建查询条件
    const where: any = {};
    
    // 时间范围
    if (startTime && endTime) {
      where.requestTime = Between(new Date(startTime), new Date(endTime));
    }
    
    // 请求URL模糊查询
    if (requestUrl) {
      where.requestUrl = Like(`%${requestUrl}%`);
    }
    
    // 请求方法
    if (requestMethod) {
      where.requestMethod = requestMethod;
    }
    
    // HTTP状态码
    if (status !== undefined) {
      where.status = status;
    }
    
    // 错误级别
    if (errorLevel) {
      where.errorLevel = errorLevel;
    }
    
    // 最小耗时（筛选慢请求）
    if (minDuration !== undefined) {
      where.duration = MoreThanOrEqual(minDuration);
    }

    // 查询所有符合条件的记录（不分页）
    return this.apiLogRepository.find({
      where,
      order: { requestTime: 'DESC' },
    });
  }
}
