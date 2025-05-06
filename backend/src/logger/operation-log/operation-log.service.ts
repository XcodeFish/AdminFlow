import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like } from 'typeorm';
import { OperationLogEntity } from './operation-log.entity';
import { OperationLogQueryDto, DeleteOperationLogDto } from './dto/operation-log.dto';

@Injectable()
export class OperationLogService {
  constructor(
    @InjectRepository(OperationLogEntity)
    private operationLogRepository: Repository<OperationLogEntity>,
  ) {}

  /**
   * 创建操作日志
   * @param operationLog 操作日志对象
   */
  async create(operationLog: Partial<OperationLogEntity>): Promise<OperationLogEntity> {
    const log = this.operationLogRepository.create(operationLog);
    return this.operationLogRepository.save(log);
  }

  /**
   * 分页查询操作日志
   * @param queryDto 查询条件
   */
  async findAll(queryDto: OperationLogQueryDto): Promise<{
    list: OperationLogEntity[];
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
      username, 
      operationType, 
      module, 
      status 
    } = queryDto;

    // 构建查询条件
    const where: any = {};
    
    // 时间范围
    if (startTime && endTime) {
      where.operationTime = Between(new Date(startTime), new Date(endTime));
    }
    
    // 用户名模糊查询
    if (username) {
      where.username = Like(`%${username}%`);
    }
    
    // 操作类型
    if (operationType) {
      where.operationType = operationType;
    }
    
    // 模块模糊查询
    if (module) {
      where.module = Like(`%${module}%`);
    }
    
    // 操作状态
    if (status !== undefined) {
      where.status = status;
    }

    // 查询总记录数
    const total = await this.operationLogRepository.count({ where });
    
    // 分页查询
    const list = await this.operationLogRepository.find({
      where,
      order: { operationTime: 'DESC' },
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
   * 根据ID查询操作日志详情
   * @param id 日志ID
   */
  async findOne(id: number): Promise<OperationLogEntity> {
    return this.operationLogRepository.findOne({ where: { id } });
  }

  /**
   * 批量删除操作日志
   * @param deleteDto 删除参数
   */
  async remove(deleteDto: DeleteOperationLogDto): Promise<{ deletedCount: number }> {
    const { ids } = deleteDto;
    const result = await this.operationLogRepository.delete(ids);
    return { deletedCount: result.affected || 0 };
  }

  /**
   * 清空操作日志
   */
  async clean(): Promise<void> {
    await this.operationLogRepository.clear();
  }

  /**
   * 导出操作日志数据
   * @param queryDto 查询条件
   */
  async export(queryDto: OperationLogQueryDto): Promise<OperationLogEntity[]> {
    const { 
      startTime, 
      endTime, 
      username, 
      operationType, 
      module, 
      status 
    } = queryDto;

    // 构建查询条件
    const where: any = {};
    
    // 时间范围
    if (startTime && endTime) {
      where.operationTime = Between(new Date(startTime), new Date(endTime));
    }
    
    // 用户名模糊查询
    if (username) {
      where.username = Like(`%${username}%`);
    }
    
    // 操作类型
    if (operationType) {
      where.operationType = operationType;
    }
    
    // 模块模糊查询
    if (module) {
      where.module = Like(`%${module}%`);
    }
    
    // 操作状态
    if (status !== undefined) {
      where.status = status;
    }

    // 查询所有符合条件的记录（不分页）
    return this.operationLogRepository.find({
      where,
      order: { operationTime: 'DESC' },
    });
  }
}
