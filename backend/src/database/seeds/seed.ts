import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from '../../app.module';
import { DataSource } from 'typeorm';
import { InitDataSeed } from './init-data.seed';

async function bootstrap() {
  const logger = new Logger('Seed');

  try {
    logger.log('开始执行种子脚本...');

    // 创建NestJS应用实例
    const app = await NestFactory.create(AppModule);

    // 获取DataSource实例
    const dataSource = app.get(DataSource);

    // 执行初始化数据种子脚本
    const initDataSeed = new InitDataSeed();
    await initDataSeed.run(dataSource);

    logger.log('种子脚本执行完成');
    await app.close();

    process.exit(0);
  } catch (error) {
    logger.error(`种子脚本执行失败: ${error.message}`, error.stack);
    process.exit(1);
  }
}

bootstrap();
