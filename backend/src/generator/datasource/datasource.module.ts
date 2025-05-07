import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatasourceController } from './datasource.controller';
import { DatasourceService } from './services/datasource.service';
import { DatabaseConnectionService } from './services/database-connection.service';
import { MetadataService } from './services/metadata.service';
import { Datasource } from './entities/datasource.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Datasource])],
  controllers: [DatasourceController],
  providers: [DatasourceService, DatabaseConnectionService, MetadataService],
  exports: [DatasourceService, DatabaseConnectionService, MetadataService],
})
export class DatasourceModule {}
