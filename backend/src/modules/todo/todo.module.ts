import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';
import { TodoEntity } from './entities/todo.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { TodoTasksService } from './todo-tasks.service';

@Module({
  imports: [TypeOrmModule.forFeature([TodoEntity]), ScheduleModule.forRoot()],
  controllers: [TodoController],
  providers: [TodoService, TodoTasksService],
})
export class TodoModule {}
