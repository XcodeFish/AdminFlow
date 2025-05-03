import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { TokenDto } from './dto/token.dto';
import { LoginResponseDto } from './dto/login-response.dto';

// 如果存在权限服务，直接导入
import { PermissionService } from '../permission/permission.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private permissionService: PermissionService, // 添加权限服务依赖
  ) {}

  /**
   * 用户登录
   * @param loginDto 登录信息
   * @returns 令牌信息
   */
  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const { username, password, rememberMe = false } = loginDto;

    // 查找用户
    const user = await this.userService.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 检查用户状态
    if (user.status !== 1) {
      throw new UnauthorizedException('用户已被禁用，请联系管理员');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 获取用户角色
    const roles = user.roles?.map((role) => role.roleKey) || [];

    // 判断是否是超级管理员
    const isAdmin = roles.includes(
      this.configService.get('app.adminRoleKey', 'admin'),
    );

    // 获取用户权限
    let permissions: string[] = [];
    try {
      // 获取用户所有权限（包括角色继承的权限）
      permissions = await this.permissionService.getUserPermissions(user.id);
      this.logger.debug(
        `用户[${username}]权限加载完成，共${permissions.length}个权限`,
      );
    } catch (error) {
      this.logger.error(
        `加载用户[${username}]权限失败: ${error.message}`,
        error.stack,
      );
      // 权限加载失败时，如果是管理员，给予所有权限
      if (isAdmin) {
        this.logger.warn(`超级管理员[${username}]权限加载失败，将授予所有权限`);
        // 此处可以查询所有系统权限并赋予
      }
    }

    // 更新登录时间
    await this.userService.updateLoginTime(user.id);

    // 创建JWT载荷
    const payload = {
      sub: user.id,
      username: user.username,
      roles,
      permissions,
      isAdmin, // 添加管理员标记，便于验证
    };

    // 根据 rememberMe 设置不同的令牌过期时间
    let accessTokenExpiration = this.configService.get(
      'jwt.accessTokenExpiration',
      '8h',
    );

    // 如果勾选了记住我 使用长期令牌过期时间（7d)
    if (rememberMe) {
      accessTokenExpiration = this.configService.get(
        'jwt.accessTokenExpiration',
        '7d',
      );
    }

    const expiresInSeconds = this.parseExpirationToSeconds(
      accessTokenExpiration,
    );

    // 添加过期时间到令牌选项
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: accessTokenExpiration,
    });

    // 创建用户响应对象，移除敏感字段
    const userResponse = {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      realName: user.realName,
      email: user.email,
      phone: user.phone,
      gender: user.gender,
      avatar: user.avatar,
      status: user.status,
      deptId: user.deptId,
      roles:
        user.roles?.map((role) => ({
          id: +role.id, // Convert string to number
          roleName: role.roleName,
          roleKey: role.roleKey,
          orderNum: role.orderNum,
          remark: role.remark,
          dataScope: role.dataScope,
          status: role.status,
        })) || [],
      createdAt: user.createdAt,
      lastLoginTime: user.lastLoginTime,
    };

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: expiresInSeconds,
      userInfo: userResponse,
    };
  }

  /**
   * 解析过期时间字符串为秒数
   * @param expiration 过期时间字符串，如"8h"、"7d"
   * @returns 秒数
   */
  private parseExpirationToSeconds(expiration: string): number {
    const unit = expiration.slice(-1);
    const value = parseInt(expiration.slice(0, -1), 10);

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 24 * 60 * 60;
      default:
        return 3600 * 8; // 默认8小时
    }
  }
}
