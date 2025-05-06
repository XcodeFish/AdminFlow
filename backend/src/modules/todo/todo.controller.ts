import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { TodoService } from './todo.service';
import { TodoTasksService } from './todo-tasks.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoStatusDto } from './dto/update-todo-status.dto';
import { QueryTodoDto } from './dto/query-todo.dto';

import { OperationLog } from '../../logger/operation-log/decorators/operation-log.decorator';
import { OperationType } from '../../logger/common/enums/logger.enum';

@ApiTags('待办事项')
@Controller('todos')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TodoController {
  constructor(
    private readonly todoService: TodoService,
    private readonly todoTasksService: TodoTasksService,
  ) {}

  @Post('create')
  @ApiOperation({ summary: '创建待办事项' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @OperationLog({
    module: 'TODO管理',
    operationType: OperationType.INSERT,
    operationName: '新增待办事项',
  })
  create(
    @Body() createTodoDto: CreateTodoDto,
    @CurrentUser('userId') userId: string,
    @Request() req: any,
  ) {
    return this.todoService.create(userId, createTodoDto);
  }

  @Get('list')
  @ApiOperation({ summary: '获取待办事项列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findAll(
    @CurrentUser('userId') userId: string,
    @Query() queryTodoDto: QueryTodoDto,
  ) {
    return this.todoService.findAll(userId, queryTodoDto);
  }

  @Patch(':id/update')
  @ApiOperation({ summary: '更新待办事项状态' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @OperationLog({
    module: 'TODO管理',
    operationType: OperationType.UPDATE,
    operationName: '更新待办事项状态',
  })
  updateStatus(
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() updateTodoStatusDto: UpdateTodoStatusDto,
  ) {
    return this.todoService.updateStatus(userId, id, updateTodoStatusDto);
  }

  @Delete(':id/delete')
  @ApiOperation({ summary: '删除待办事项' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @OperationLog({
    module: 'TODO管理',
    operationType: OperationType.DELETE,
    operationName: '删除待办事项',
  })
  remove(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.todoService.remove(userId, id);
  }

  @Post('check-expired')
  @ApiOperation({ summary: '手动检查过期待办事项' })
  async checkExpiredTodos() {
    await this.todoTasksService.handleExpiredTodos();
    return { message: '已完成过期待办事项检查' };
  }
}
