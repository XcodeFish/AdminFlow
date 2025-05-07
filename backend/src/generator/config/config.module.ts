import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigController } from './config.controller';
import { ConfigService } from './services/config.service';
import { GenConfig } from './entities/gen-config.entity';
import { DatasourceModule } from '../datasource/datasource.module';

@Module({
  imports: [TypeOrmModule.forFeature([GenConfig]), DatasourceModule],
  controllers: [ConfigController],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
