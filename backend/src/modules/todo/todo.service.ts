import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TodoEntity } from './entities/todo.entity';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoStatusDto } from './dto/update-todo-status.dto';
import { QueryTodoDto } from './dto/query-todo.dto';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(TodoEntity)
    private readonly todoRepository: Repository<TodoEntity>,
  ) {}

  async create(
    userId: string,
    createTodoDto: CreateTodoDto,
  ): Promise<TodoEntity> {
    const todo = this.todoRepository.create({
      ...createTodoDto,
      userId,
    });

    return this.todoRepository.save(todo);
  }

  async findAll(userId: string, queryTodoDto: QueryTodoDto) {
    const { status, page = 1, pageSize = 10 } = queryTodoDto;

    const queryBuilder = this.todoRepository
      .createQueryBuilder('todo')
      .where('todo.userId = :userId', { userId });

    if (status !== undefined) {
      queryBuilder.andWhere('todo.status = :status', { status });
    }

    // 计算总数
    const total = await queryBuilder.getCount();

    // 获取分页数据
    const todos = await queryBuilder
      .orderBy('todo.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    return {
      list: todos,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async updateStatus(
    userId: string,
    id: string,
    updateTodoStatusDto: UpdateTodoStatusDto,
  ) {
    const todo = await this.todoRepository.findOne({ where: { id } });

    if (!todo) {
      throw new NotFoundException('待办事项不存在');
    }

    if (todo.userId !== userId) {
      throw new ForbiddenException('无权操作此待办事项');
    }

    todo.status = updateTodoStatusDto.status;

    return this.todoRepository.save(todo);
  }

  async remove(userId: string, id: string) {
    const todo = await this.todoRepository.findOne({ where: { id } });

    if (!todo) {
      throw new NotFoundException('待办事项不存在');
    }

    if (todo.userId !== userId) {
      throw new ForbiddenException('无权操作此待办事项');
    }

    await this.todoRepository.remove(todo);
    return null;
  }
}
