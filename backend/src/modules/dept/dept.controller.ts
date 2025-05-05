// src/modules/system/department/department.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
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
import { PermissionGuard } from '../../core/guards/permission.guard';
import { RequirePermissions } from '../../core/decorators/require-permissions.decorator';
import { DepartmentService } from './dept.service';
import { CreateDepartmentDto } from './dto/create-dept.dto';
import { UpdateDepartmentDto } from './dto/update-dept.dto';
import { QueryDepartmentDto } from './dto/query-dept.dto';
import { Result } from '../../core/result/result';

@Controller('departments')
@ApiTags('部门管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard)
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Get('tree')
  @ApiOperation({ summary: '获取部门树结构' })
  @RequirePermissions('system:dept:list')
  async getDeptTree(@Query('status') status?: number) {
    const data = await this.departmentService.getDeptTree(status);
    return Result.success(data);
  }

  @Get('list')
  @ApiOperation({ summary: '获取部门列表' })
  @RequirePermissions('system:dept:list')
  async getDeptList(@Query() queryDto: QueryDepartmentDto) {
    const data = await this.departmentService.getDeptList(queryDto);
    return Result.success(data);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取部门详情' })
  @RequirePermissions('system:dept:query')
  async getDeptById(@Param('id') id: string) {
    const data = await this.departmentService.getDeptById(id);
    return Result.success(data);
  }

  @Post('create')
  @ApiOperation({ summary: '创建部门' })
  @RequirePermissions('system:dept:create')
  async createDept(@Body() createDto: CreateDepartmentDto) {
    const data = await this.departmentService.createDept(createDto);
    return Result.success(data, '创建成功');
  }

  @Put(':id/update')
  @ApiOperation({ summary: '更新部门' })
  @RequirePermissions('system:dept:update')
  async updateDept(
    @Param('id') id: string,
    @Body() updateDto: UpdateDepartmentDto,
  ) {
    const data = await this.departmentService.updateDept(id, updateDto);
    return Result.success(data, '更新成功');
  }

  @Delete(':id/delete')
  @ApiOperation({ summary: '删除部门' })
  @RequirePermissions('system:dept:delete')
  async deleteDept(@Param('id') id: string) {
    await this.departmentService.deleteDept(id);
    return Result.success(null, '删除成功');
  }
}
