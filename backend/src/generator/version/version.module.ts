import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VersionController } from './version.controller';
import { VersionService } from './services/version.service';
import { GenVersion } from './entities/gen-version.entity';
import { ConfigModule } from '../config/config.module';
import { GenerateModule } from '../generate/generate.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GenVersion]),
    ConfigModule,
    GenerateModule,
  ],
  controllers: [VersionController],
  providers: [VersionService],
  exports: [VersionService],
})
export class VersionModule {}
