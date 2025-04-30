// src/modules/tool/swagger/swagger.module.ts
import { Module } from '@nestjs/common';
import { SwaggerController } from './swagger.controller';
import { SwaggerService } from './swagger.service';
import { HttpModule } from '@nestjs/axios';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

@Module({
  imports: [
    HttpModule,
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),
      ],
    }),
  ],
  controllers: [SwaggerController],
  providers: [SwaggerService],
  exports: [SwaggerService],
})
export class SwaggerModule {}
