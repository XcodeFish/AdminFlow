// src/common/result/result.ts
export class Result<T = any> {
  readonly code: number;
  readonly message: string;
  readonly data: T;

  constructor(code: number, message: string, data: T) {
    this.code = code;
    this.message = message;
    this.data = data;
  }

  static success<T>(data: T, message = 'success'): Result<T> {
    return new Result<T>(200, message, data);
  }

  static error(message = 'error', code = 500): Result<null> {
    return new Result<null>(code, message, null);
  }
}
