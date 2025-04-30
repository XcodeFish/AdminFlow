import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { getManager, EntityManager } from 'typeorm';

/**
 * 事务装饰器，用于简化数据库事务操作
 * 使用方式：
 * @Transaction()
 * async myMethod(@TransactionManager() manager: EntityManager) {
 *   // 使用传入的EntityManager执行数据库操作
 * }
 */
export function Transaction() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      return getManager().transaction(async (entityManager: EntityManager) => {
        // 找到TransactionManager装饰器的参数位置
        const managerIndex = this.constructor.prototype[`${propertyKey}_transaction_manager_index`];

        if (managerIndex !== undefined) {
          // 如果找到了TransactionManager装饰器的参数位置，则注入EntityManager
          args[managerIndex] = entityManager;
        }

        return originalMethod.apply(this, args);
      });
    };

    return descriptor;
  };
}

/**
 * 事务管理器参数装饰器，用于接收事务管理器
 */
export const TransactionManager = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const args = ctx.getArgs();
    const req = args[0];
    return req.manager;
  }
);

// 分开定义修饰器工厂函数
export function TransactionManagerFactory(): ParameterDecorator {
  return (target: any, key: string, index: number) => {
    // 保存TransactionManager装饰器的参数位置
    target[`${key}_transaction_manager_index`] = index;
  };
}
