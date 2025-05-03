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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoStatusDto } from './dto/update-todo-status.dto';
import { QueryTodoDto } from './dto/query-todo.dto';

@ApiTags('待办事项')
@Controller('todos')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Post('create')
  @ApiOperation({ summary: '创建待办事项' })
  @ApiResponse({ status: 201, description: '创建成功' })
  create(
    @CurrentUser('id') userId: string,
    @Body() createTodoDto: CreateTodoDto,
  ) {
    return this.todoService.create(userId, createTodoDto);
  }

  @Get('list')
  @ApiOperation({ summary: '获取待办事项列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findAll(
    @CurrentUser('id') userId: string,
    @Query() queryTodoDto: QueryTodoDto,
  ) {
    return this.todoService.findAll(userId, queryTodoDto);
  }

  @Patch(':id/update')
  @ApiOperation({ summary: '更新待办事项状态' })
  @ApiResponse({ status: 200, description: '更新成功' })
  updateStatus(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() updateTodoStatusDto: UpdateTodoStatusDto,
  ) {
    return this.todoService.updateStatus(userId, id, updateTodoStatusDto);
  }

  @Delete(':id/delete')
  @ApiOperation({ summary: '删除待办事项' })
  @ApiResponse({ status: 200, description: '删除成功' })
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.todoService.remove(userId, id);
  }
}
