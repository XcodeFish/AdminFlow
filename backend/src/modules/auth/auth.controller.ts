// backend/src/modules/auth/auth.controller.ts
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Public } from '@core/decorators/public.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { TokenDto } from './dto/token.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';

import { OperationLog } from '../../logger/operation-log/decorators/operation-log.decorator';
import { OperationType } from '../../logger/common/enums/logger.enum';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: '用户登录', description: '用户登录并获取访问令牌' })
  @ApiResponse({ status: 200, description: '登录成功', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: '用户名或密码错误' })
  @OperationLog({
    module: '登录',
    operationType: OperationType.LOGIN,
    operationName: '用户登录',
  })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '退出登录', description: '用户退出登录' })
  @ApiResponse({ status: 200, description: '退出成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @OperationLog({
    module: '登录',
    operationType: OperationType.LOGOUT,
    operationName: '用户退出登录',
  })
  async logout(@Req() req) {
    const userId = req.user.userId;
    return this.authService.logout(userId);
  }
}
