import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

// 拦截器
import { LoggingInterceptor } from './core/interceptors/logging.interceptor';
import { TransformInterceptor } from './core/interceptors/transform.interceptor';
import { DataScopeInterceptor } from './core/interceptors/data-scope.interceptor';

// 过滤器
import { GlobalExceptionFilter } from './core/filters/global-exception.filter';
import { EnhancedExceptionFilter } from './core/filters/enhanced-exception.filter';

// 守卫
import { JwtAuthGuard } from './core/guards/jwt-auth.guard';
import { JwtStrategy } from './core/guards/jwt.strategy';
import { RolesGuard } from './core/guards/roles.guard';

// 业务模块
import { UserModule } from './modules/user/user.module';
import { ToolModule } from './modules/tool/tool.module';
import { AuthModule } from './modules/auth/auth.module';
import { PermissionModule } from './modules/permission/permission.module';
import { MenuModule } from './modules/menu/menu.module';
import { TodoModule } from './modules/todo/todo.module';
import { DepartmentModule } from './modules/dept/dept.module';

// 日志管理模块
import { LoggerModule } from './logger/logger.module';
import { ApiLogInterceptor } from './logger/api-log/interceptors/api-log.interceptor';
import { ApiExceptionFilter } from './logger/api-log/filters/api-exception.filter';

// 配置
import appConfig from './configs/app.config';
import databaseConfig from './configs/database.config';
import jwtConfig from './configs/jwt.config';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        '.env.local',
        '.env',
        `.env.${process.env.NODE_ENV || 'development'}`,
      ],
      load: [appConfig, databaseConfig, jwtConfig],
    }),

    // 速率限制模块
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ttl: configService.get('app.throttle.ttl', 60),
        limit: configService.get('app.throttle.limit', 100),
      }),
    }),

    // 缓存模块
    CacheModule.register({
      isGlobal: true,
      ttl: 5 * 60 * 1000,
      max: 1000,
    }),

    // JWT模块
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwt.secret'),
        signOptions: { expiresIn: configService.get('jwt.expiresIn', '8h') },
      }),
    }),

    // 数据库模块
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: configService.get('database.type', 'postgres') as any,
        host: configService.get('database.host', 'localhost'),
        port: configService.get('database.port', 5432),
        username: configService.get('database.username', 'postgres'),
        password: configService.get('database.password', 'postgres'),
        database: configService.get('database.database', 'adminflow') as string, // 添加类型断言
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('database.synchronize', false),
        logging: configService.get('database.logging', false),
        autoLoadEntities: true,
      }),
    }),

    // 业务模块
    AuthModule,
    UserModule,
    ToolModule,
    PermissionModule,
    MenuModule,
    TodoModule,
    DepartmentModule,

    // 日志管理模块
    LoggerModule,
  ],
  providers: [
    // JWT策略
    JwtStrategy,

    // 全局响应拦截器
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },

    // 全局日志拦截器
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },

    // API日志拦截器
    {
      provide: APP_INTERCEPTOR,
      useClass: ApiLogInterceptor,
    },

    // 全局异常过滤器
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },

    // 增强版异常过滤器
    {
      provide: APP_FILTER,
      useClass: EnhancedExceptionFilter,
    },

    // API日志异常过滤器
    {
      provide: APP_FILTER,
      useClass: ApiExceptionFilter,
    },

    // 全局JWT守卫
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },

    // 全局角色守卫
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },

    // 全局速率限制守卫
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },

    // 数据权限拦截器
    {
      provide: APP_INTERCEPTOR,
      useClass: DataScopeInterceptor,
    },
  ],
})
export class AppModule {}
