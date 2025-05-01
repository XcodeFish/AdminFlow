import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import { PermissionEntity } from './entities/permission.entity';
import { RoleEntity } from '../user/entities/role.entity';
import { UserEntity } from '../user/entities/user.entity';
import { PermissionAuditEntity } from './entities/permission-audit.entity';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PermissionEntity,
      RoleEntity,
      UserEntity,
      PermissionAuditEntity,
    ]),
    EventEmitterModule.forRoot(),
  ],
  controllers: [PermissionController],
  providers: [PermissionService],
  exports: [PermissionService],
})
export class PermissionModule {}
