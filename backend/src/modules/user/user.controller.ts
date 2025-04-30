
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Public } from '../../core/decorators/public.decorator';

@ApiTags('用户管理')
// @ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create')
  @ApiOperation({ summary: '创建用户' })
  @Public()
  @ApiResponse({
    status: 200,
    description: '用户创建成功',
    type: UserResponseDto,
  })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get('list')
  @ApiOperation({ summary: '获取用户列表' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: '操作成功',
    type: [UserResponseDto],
  })
  async findAll(@Query() query: UserQueryDto) {
    return this.userService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取用户' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: '操作成功', type: UserResponseDto })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async findOne(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新用户信息' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: '操作成功', type: UserResponseDto })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除用户' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: '操作成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async remove(@Param('id') id: string) {
    await this.userService.remove(id);
    return { message: '用户删除成功' };
  }

  @Post(':id/reset-password')
  @ApiOperation({ summary: '重置用户密码' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: '密码重置成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async resetPassword(
    @Param('id') id: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    await this.userService.resetPassword(id, resetPasswordDto.password);
    return { message: '密码重置成功' };
  }

  @Put(':id/status')
  @ApiOperation({ summary: '更新用户状态' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: '状态更新成功',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async updateStatus(@Param('id') id: string, @Body('status') status: number) {
    return this.userService.updateStatus(id, status);
  }
}
