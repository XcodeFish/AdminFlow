import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { QueryMenuDto } from './dto/query-menu.dto';
import { AssignRoleMenusDto } from './dto/assign-role-menus.dto';
import { MenuEntity } from './entities/menu.entity';
import { MenuTreeNode, UserMenuInfo } from './interfaces/menu.interface';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { RolesGuard } from '../../core/guards/roles.guard';

@ApiTags('菜单管理')
@Controller('system/menu')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: '创建菜单' })
  @ApiResponse({ status: 201, type: MenuEntity })
  async create(@Body() createMenuDto: CreateMenuDto): Promise<MenuEntity> {
    return this.menuService.create(createMenuDto);
  }

  @Get()
  @ApiOperation({ summary: '查询菜单列表' })
  @ApiResponse({ status: 200, type: [MenuEntity] })
  async findAll(@Query() query: QueryMenuDto): Promise<{
    items: MenuEntity[];
    total: number;
  }> {
    const [items, total] = await this.menuService.findAll(query);
    return { items, total };
  }

  @Get('tree')
  @ApiOperation({ summary: '获取菜单树' })
  @ApiResponse({ status: 200 })
  async getMenuTree(): Promise<MenuTreeNode[]> {
    return this.menuService.findMenuTree();
  }

  @Get('user')
  @ApiOperation({ summary: '获取当前用户菜单' })
  @ApiResponse({ status: 200 })
  async getUserMenus(
    @CurrentUser('userId') userId: string,
  ): Promise<UserMenuInfo[]> {
    return this.menuService.getUserMenus(userId);
  }

  @Get('role/:roleId')
  @Roles('admin')
  @ApiOperation({ summary: '获取角色菜单ID列表' })
  @ApiParam({ name: 'roleId', description: '角色ID' })
  @ApiResponse({ status: 200, type: [String] })
  async getRoleMenuIds(@Param('roleId') roleId: string): Promise<string[]> {
    return this.menuService.getRoleMenuIds(roleId);
  }

  @Post('role/assign')
  @Roles('admin')
  @ApiOperation({ summary: '分配角色菜单' })
  @ApiResponse({ status: 200 })
  async assignRoleMenus(@Body() assignDto: AssignRoleMenusDto): Promise<void> {
    return this.menuService.assignRoleMenus(assignDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID查询菜单' })
  @ApiParam({ name: 'id', description: '菜单ID' })
  @ApiResponse({ status: 200, type: MenuEntity })
  async findOne(@Param('id') id: string): Promise<MenuEntity> {
    return this.menuService.findById(id);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: '更新菜单' })
  @ApiParam({ name: 'id', description: '菜单ID' })
  @ApiResponse({ status: 200, type: MenuEntity })
  async update(
    @Param('id') id: string,
    @Body() updateMenuDto: UpdateMenuDto,
  ): Promise<MenuEntity> {
    return this.menuService.update(id, updateMenuDto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: '删除菜单' })
  @ApiParam({ name: 'id', description: '菜单ID' })
  @ApiResponse({ status: 200 })
  async remove(@Param('id') id: string): Promise<void> {
    return this.menuService.remove(id);
  }
}
