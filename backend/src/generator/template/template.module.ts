import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplateController } from './template.controller';
import { TemplateService } from './services/template.service';
import { Template } from './entities/template.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Template])],
  controllers: [TemplateController],
  providers: [TemplateService],
  exports: [TemplateService],
})
export class TemplateModule implements OnModuleInit {
  constructor(private templateService: TemplateService) {}

  async onModuleInit() {
    // 初始化模板数据
    await this.templateService.initialize();
  }
}
