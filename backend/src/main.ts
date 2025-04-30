import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);

  // 安全增强 - 但允许swagger-test.html页面使用内联脚本
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: [`'self'`],
          scriptSrc: [`'self'`, `'unsafe-inline'`],
          scriptSrcAttr: [`'unsafe-inline'`], // 添加这一行
          styleSrc: [`'self'`, `'unsafe-inline'`],
        },
      },
    }),
  );

  // 启用CORS
  app.enableCors({
    origin: configService.get('app.corsOrigins', '*'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 压缩响应
  app.use(compression());

  // 解析Cookie
  app.use(cookieParser());

  // HTTP请求日志
  if (configService.get('app.nodeEnv') !== 'production') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  // 全局前缀
  // app.setGlobalPrefix('api/v1');
  // 全局请求前缀
  const apiPrefix = configService.get('app.apiPrefix', 'api');
  app.setGlobalPrefix(apiPrefix);

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 剔除未在DTO中声明的属性
      forbidNonWhitelisted: true, // 如果请求包含未在DTO中声明的属性，则抛出错误
      transform: true, // 自动转换类型
      transformOptions: {
        enableImplicitConversion: false, // 禁用隐式类型转换
      },
    }),
  );

  // Swagger API 文档
  if (configService.get('app.enableSwagger', true)) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('AdminFlow API')
      .setDescription('The AdminFlow API description')
      .setVersion('1.0')
      .addBearerAuth()
      // .addServer(`/${apiPrefix}`)
      // .addTag('系统管理', '系统核心功能管理')
      // .addTag('监控管理', '系统监控相关功能')
      // .addTag('工具模块', '系统工具和实用功能')
      .setExternalDoc('接口测试工具', `/api/v1/tool/swagger/test`)
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          in: 'header',
        },
        'Authorization',
      )
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

    logger.log(`Swagger 文档已启用: /${apiPrefix}/docs`);
  }

  // CORS设置
  // app.enableCors({
  //   origin: true,
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  //   credentials: true,
  // });

  const port = configService.get<number>('PORT', 7080);
  await app.listen(port);
  console.log(`应用启动成功: http://localhost:${port}/${apiPrefix}/docs`);
}

bootstrap();
