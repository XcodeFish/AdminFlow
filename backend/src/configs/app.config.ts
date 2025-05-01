import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  apiPrefix: 'api/v1',
  appName: 'AdminFlow',

  // 权限相关配置
  adminRoleKey: process.env.ADMIN_ROLE_KEY || 'admin', // 超级管理员角色标识
  permissionCacheTtl: parseInt(process.env.PERMISSION_CACHE_TTL, 10) || 30 * 60, // 权限缓存时间(秒)，默认30分钟
  enablePermissionCheck: process.env.ENABLE_PERMISSION_CHECK !== 'false', // 是否启用权限检查，默认启用

  // CORS配置
  corsOrigins: process.env.CORS_ORIGINS || '*',

  // 限流配置
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL, 10) || 60,
    limit: parseInt(process.env.THROTTLE_LIMIT, 10) || 100,
  },

  // API文档配置
  enableSwagger: process.env.ENABLE_SWAGGER !== 'false',
}));
