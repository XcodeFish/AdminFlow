import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatasourceModule } from './datasource/datasource.module';
import { ConfigModule } from './config/config.module';
import { GenerateModule } from './generate/generate.module';
import { VersionModule } from './version/version.module';
import { TemplateModule } from './template/template.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([]),
    DatasourceModule,
    ConfigModule,
    GenerateModule,
    VersionModule,
    TemplateModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class GeneratorModule {}
