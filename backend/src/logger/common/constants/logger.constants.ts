export const LOGGER_MODULE = 'LOGGER_MODULE';

// 操作类型
export const OPERATION_TYPES = {
  LOGIN: 'LOGIN',        // 登录
  LOGOUT: 'LOGOUT',      // 登出
  INSERT: 'INSERT',      // 新增
  UPDATE: 'UPDATE',      // 修改
  DELETE: 'DELETE',      // 删除
  EXPORT: 'EXPORT',      // 导出
  IMPORT: 'IMPORT',      // 导入
  OTHER: 'OTHER',        // 其他
};

// 错误级别
export const ERROR_LEVELS = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
};

// 操作状态
export const OPERATION_STATUS = {
  SUCCESS: 1,            // 成功
  FAILED: 0,             // 失败
};

// 时间粒度
export const TIME_GRANULARITY = {
  HOUR: 'hour',
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
};
