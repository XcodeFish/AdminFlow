import { Request } from 'express';

/**
 * 获取客户端IP地址
 * @param request - Express请求对象
 * @returns IP地址
 */
export function getClientIp(request: Request): string {
  const ip = 
    request.headers['x-forwarded-for'] ||
    request.headers['x-real-ip'] ||
    request.connection.remoteAddress ||
    request.socket.remoteAddress;
    
  if (typeof ip === 'string') {
    return ip.split(',')[0].trim();
  } else if (Array.isArray(ip)) {
    return ip[0];
  }
  
  return '未知IP';
}
