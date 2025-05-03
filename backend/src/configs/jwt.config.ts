import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'your-secret-key-should-be-complex-and-from-env',
  accessTokenExpiration: process.env.JWT_ACCESS_EXPIRATION || '8h',
  refreshTokenExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
  rememberMeExpiration: process.env.JWT_REMEMBER_ME_EXPIRATION || '7d',
  issuer: process.env.JWT_ISSUER || 'admin-flow-api',
  audience: process.env.JWT_AUDIENCE || 'admin-flow-client',
  refreshTokenCookieName: 'refresh_token',
  refreshTokenCookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/auth/refresh',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 与refreshTokenExpiration保持一致
  },
}));
