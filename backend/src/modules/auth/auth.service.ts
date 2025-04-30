import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { TokenDto } from './dto/token.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * 用户登录
   * @param loginDto 登录信息
   * @returns 令牌信息
   */
  async login(loginDto: LoginDto): Promise<TokenDto> {
    const { username, password } = loginDto;

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

    // 更新登录时间
    await this.userService.updateLoginTime(user.id);

    // 创建JWT载荷
    const payload = {
      sub: user.id,
      username: user.username,
      roles,
    };

    // 生成访问令牌
    const accessTokenExpiration = this.configService.get(
      'jwt.accessTokenExpiration',
      '8h',
    );
    const expiresInSeconds = this.parseExpirationToSeconds(
      accessTokenExpiration,
    );

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: expiresInSeconds,
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
