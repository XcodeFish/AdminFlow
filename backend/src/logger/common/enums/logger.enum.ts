/**
 * 操作类型枚举
 */
export enum OperationType {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  INSERT = 'INSERT',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
  OTHER = 'OTHER',
}

/**
 * 错误级别枚举
 */
export enum ErrorLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

/**
 * 操作状态枚举
 */
export enum OperationStatus {
  SUCCESS = 1,
  FAILED = 0,
}

/**
 * 时间粒度枚举
 */
export enum TimeGranularity {
  HOUR = 'hour',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}
