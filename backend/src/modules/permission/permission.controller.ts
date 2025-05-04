import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PermissionService } from './permission.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { AssignRolePermissionsDto } from './dto/assign-role-permissions.dto';
import { AssignUserRolesDto } from './dto/assign-user-roles.dto';
import { QueryPermissionDto } from './dto/query-permission.dto';
import { PageOptionsDto } from '../../common/dto/page.dto';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Permissions } from '../../core/decorators/permissions.decorator';
import { Roles } from '../../core/decorators/roles.decorator';

@ApiTags('权限管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  // ==================== 角色管理 ====================

  @Post('roles')
  @ApiOperation({ summary: '创建角色' })
  @Permissions(['system:role:create'])
  createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.permissionService.createRole(createRoleDto);
  }

  @Put('roles/:id')
  @ApiOperation({ summary: '更新角色' })
  @ApiParam({ name: 'id', description: '角色ID' })
  @Permissions(['system:role:update'])
  updateRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.permissionService.updateRole(id, updateRoleDto);
  }

  @Delete('roles/:id')
  @ApiOperation({ summary: '删除角色' })
  @ApiParam({ name: 'id', description: '角色ID' })
  @Permissions(['system:role:delete'])
  deleteRole(@Param('id', ParseUUIDPipe) id: string) {
    return this.permissionService.deleteRole(id);
  }

  @Get('roles')
  @ApiOperation({ summary: '获取角色列表' })
  @Permissions(['system:role:list'])
  getRoles() {
    return this.permissionService.getRoles();
  }

  @Get('roles/:id')
  @ApiOperation({ summary: '获取角色详情' })
  @ApiParam({ name: 'id', description: '角色ID' })
  @Permissions(['system:role:query'])
  getRoleById(@Param('id', ParseUUIDPipe) id: string) {
    return this.permissionService.getRoleById(id);
  }

  @Put('roles/:roleId/permissions')
  @Permissions(['system:role:permission'])
  @ApiOperation({ summary: '分配角色权限' })
  assignRolePermissions(
    @Param('roleId', ParseUUIDPipe) roleId: string,
    @Body() dto: AssignRolePermissionsDto,
    @Request() req,
  ) {
    const operator = {
      userId: req.user.userId,
      username: req.user.username,
      ip: req.ip || req.connection?.remoteAddress || '0.0.0.0',
    };

    return this.permissionService.assignRolePermissions(roleId, dto, operator);
  }

  @Get('audit-logs')
  @ApiOperation({ summary: '获取权限审计日志' })
  @Permissions(['system:permission:audit'])
  getPermissionAuditLogs(
    @Query('operationType') operationType?: number,
    @Query('targetId') targetId?: string,
    @Query('startTime') startTime?: Date,
    @Query('endTime') endTime?: Date,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.permissionService.getPermissionAuditLogs(
      operationType,
      targetId,
      startTime,
      endTime,
      page,
      limit,
    );
  }

  @Get('roles/tree')
  @ApiOperation({ summary: '获取角色树' })
  @Permissions(['system:role:list'])
  getRoleTree() {
    return this.permissionService.getRoleTree();
  }

  @Post('roles/:id/children')
  @ApiOperation({ summary: '添加子角色' })
  @ApiParam({ name: 'id', description: '父角色ID' })
  @Permissions(['system:role:create'])
  addChildRole(
    @Param('id', ParseUUIDPipe) parentId: string,
    @Body() createRoleDto: CreateRoleDto,
  ) {
    // 设置父角色ID
    createRoleDto['parentId'] = parentId;
    return this.permissionService.createRole(createRoleDto);
  }

  // ==================== 权限管理 ====================

  @Post()
  @Permissions(['system:permission:create'])
  @ApiOperation({ summary: '创建权限' })
  @ApiResponse({ status: 201, description: '创建成功' })
  createPermission(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionService.createPermission(createPermissionDto);
  }

  /**
   * 查询权限列表
   */
  @Get('/permission/list')
  @Permissions(['system:permission:list'])
  @ApiOperation({ summary: '获取权限列表', description: '分页查询所有权限' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: '页码',
    type: Number,
  })
  @ApiQuery({
    name: 'take',
    required: false,
    description: '每页条数',
    type: Number,
  })
  getPermissions(@Query('page') page = 1, @Query('take') take = 10) {
    return this.permissionService.getPermissionsWithPagination(page, take);
  }

  @Get('perms')
  @ApiOperation({ summary: '获取权限列表' })
  @Permissions(['system:permission:list'])
  getPermissionsList(@Query() query: QueryPermissionDto) {
    return this.permissionService.getPermissions(query);
  }

  @Get('tree')
  @Permissions(['system:permission:list'])
  @ApiOperation({ summary: '获取权限树' })
  getPermissionTree() {
    return this.permissionService.getPermissionTree();
  }

  @Get(':id')
  @Permissions(['system:permission:list'])
  @ApiOperation({ summary: '获取单个权限详情' })
  getPermissionById(@Param('id', ParseUUIDPipe) id: string) {
    // Implement using existing methods
    return this.permissionService.getPermissionById(id);
  }

  @Put(':id')
  @Permissions(['system:permission:update'])
  @ApiOperation({ summary: '更新权限' })
  updatePermission(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionService.updatePermission(id, updatePermissionDto);
  }

  @Delete(':id')
  @Permissions(['system:permission:delete'])
  @ApiOperation({ summary: '删除权限' })
  @HttpCode(HttpStatus.NO_CONTENT)
  deletePermission(@Param('id', ParseUUIDPipe) id: string) {
    return this.permissionService.deletePermission(id);
  }

  // ==================== 用户角色管理 ====================

  @Put('users/:userId/roles')
  @Permissions(['system:user:update'])
  @ApiOperation({ summary: '分配用户角色' })
  assignUserRoles(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: AssignUserRolesDto,
    @Request() req,
  ) {
    const operator = {
      userId: req.user.userId,
      username: req.user.username,
      ip: req.ip || req.connection?.remoteAddress || '0.0.0.0',
    };

    return this.permissionService.assignUserRoles(userId, dto, operator);
  }

  @Get('users/:userId/roles')
  @Permissions(['system:user:query'])
  @ApiOperation({ summary: '获取用户角色列表' })
  getUserRoles(@Param('userId', ParseUUIDPipe) userId: string) {
    // 返回用户角色列表，包含完整角色信息，符合接口文档
    return this.permissionService.getUserRolesWithDetails(userId);
  }

  @Get('users/:userId/permissions')
  @Permissions(['system:user:query'])
  @ApiOperation({ summary: '获取用户权限列表' })
  getUserPermissions(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.permissionService.getUserPermissions(userId);
  }

  @Get('roles/:roleId/permissions')
  @Permissions(['system:role:permission'])
  @ApiOperation({ summary: '获取角色权限列表' })
  getRolePermissions(@Param('roleId', ParseUUIDPipe) roleId: string) {
    // Implement this method in service
    return this.permissionService.getRolePermissions(roleId);
  }

  @Delete('cache/all')
  @Roles(['admin'])
  @ApiOperation({ summary: '清除所有权限缓存（管理员使用）' })
  @HttpCode(HttpStatus.NO_CONTENT)
  clearAllPermissionCache() {
    return this.permissionService.clearAllPermissionCache();
  }

  @Delete('cache/users/:userId')
  @Permissions(['system:user:update'])
  @ApiOperation({ summary: '清除指定用户权限缓存' })
  @HttpCode(HttpStatus.NO_CONTENT)
  clearUserPermissionCache(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.permissionService.clearUserPermissionCache(userId);
  }
}
