import { Module } from '@nestjs/common';
import { GenerateController } from './generate.controller';
import { GeneratorService } from './services/generator.service';
import { ConfigModule } from '../config/config.module';
import { TemplateModule } from '../template/template.module';

@Module({
  imports: [ConfigModule, TemplateModule],
  controllers: [GenerateController],
  providers: [GeneratorService],
  exports: [GeneratorService],
})
export class GenerateModule {}
