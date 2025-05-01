/**
 * 操作者信息接口
 * 用于记录权限变更等操作的操作人信息
 */
export interface OperatorInfo {
  /**
   * 操作人ID
   */
  userId: string;

  /**
   * 操作人用户名
   */
  username: string;

  /**
   * 操作人IP地址
   */
  ip: string;
}
