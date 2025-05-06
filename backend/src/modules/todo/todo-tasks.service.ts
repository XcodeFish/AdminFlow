import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { TodoEntity } from './entities/todo.entity';

@Injectable()
export class TodoTasksService {
  private readonly logger = new Logger(TodoTasksService.name);

  constructor(
    @InjectRepository(TodoEntity)
    private readonly todoRepository: Repository<TodoEntity>,
  ) {}

  /**
   * 每小时检查一次待办事项，更新过期的待办事项状态
   * 将过期且状态为"未完成"(0)的待办事项更新为"已过期"(3)
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleExpiredTodos() {
    this.logger.log('开始检查过期待办事项...');

    const now = new Date();

    try {
      // 查找所有开始时间已过、状态仍为"未完成"(0)的待办事项
      const expiredTodos = await this.todoRepository.find({
        where: {
          status: 0, // 未完成
          startTime: LessThan(now), // 开始时间已过
        },
      });

      if (expiredTodos.length === 0) {
        this.logger.log('没有发现过期的待办事项');
        return;
      }

      // 更新状态为"已过期"(3)
      const updatePromises = expiredTodos.map((todo) => {
        todo.status = 3; // 已过期
        return this.todoRepository.save(todo);
      });

      await Promise.all(updatePromises);

      this.logger.log(`成功更新 ${expiredTodos.length} 个过期待办事项的状态`);
    } catch (error) {
      this.logger.error('更新过期待办事项失败', error.stack);
    }
  }
}
