import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt.secret', 'admin-flow-2025'),
    });
  }

  async validate(payload: any) {
    this.logger.debug(`JWT验证通过，用户: ${payload.username}`);

    // 确保角色和权限始终是数组
    const roles = Array.isArray(payload.roles) ? payload.roles : [];
    const permissions = Array.isArray(payload.permissions)
      ? payload.permissions
      : [];

    // 记录用户权限信息
    this.logger.debug(
      `用户[${payload.username}]角色: ${roles.join(', ') || '无'}`,
    );
    this.logger.debug(`用户[${payload.username}]权限: ${permissions.length}个`);

    // 返回用户信息，将作为请求中的user对象
    return {
      userId: payload.sub,
      username: payload.username,
      roles: roles,
      permissions: permissions,
      isAdmin: payload.isAdmin === true,
    };
  }
}
