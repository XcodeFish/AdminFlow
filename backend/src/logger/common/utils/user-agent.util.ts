import { UAParser } from 'ua-parser-js';

/**
 * 解析用户代理字符串
 * @param userAgent - 用户代理字符串
 * @returns 格式化后的用户代理信息
 */
export function parseUserAgent(userAgent: string): string {
  if (!userAgent) {
    return '未知浏览器 / 未知系统';
  }

  const parser = new UAParser(userAgent);
  const browser = parser.getBrowser();
  const os = parser.getOS();

  const browserInfo = browser.name && browser.version 
    ? `${browser.name} ${browser.version}` 
    : '未知浏览器';
    
  const osInfo = os.name && os.version 
    ? `${os.name} ${os.version}` 
    : '未知系统';

  return `${browserInfo} / ${osInfo}`;
}
