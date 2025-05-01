import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Logger } from '@nestjs/common';
import { UserEntity } from '../../modules/user/entities/user.entity';
import { RoleEntity } from '../../modules/user/entities/role.entity';
import { PermissionEntity } from '../../modules/permission/entities/permission.entity';

/**
 * 系统初始数据种子脚本
 * 创建基础的角色、权限和管理员用户
 */
export class InitDataSeed {
  private readonly logger = new Logger(InitDataSeed.name);

  async run(dataSource: DataSource): Promise<void> {
    this.logger.log('开始初始化基础数据...');

    // 开始事务
    await dataSource.transaction(async (manager) => {
      // 1. 创建基础权限
      const permissions = await this.createBasePermissions(manager);
      this.logger.log(`成功创建${permissions.length}个基础权限`);

      // 2. 创建基础角色（管理员和普通用户）
      const adminRole = await this.createAdminRole(manager, permissions);
      const userRole = await this.createUserRole(manager);
      this.logger.log(
        `成功创建基础角色：${adminRole.roleName}, ${userRole.roleName}`,
      );

      // 3. 创建管理员用户
      const adminUser = await this.createAdminUser(manager, [adminRole]);
      this.logger.log(`成功创建管理员用户：${adminUser.username}`);
    });

    this.logger.log('基础数据初始化完成');
  }

  /**
   * 创建基础权限
   */
  private async createBasePermissions(manager): Promise<PermissionEntity[]> {
    // 定义基础权限列表 - 使用实际ID而非字符串数字
    const permissionsList = [
      // 用户管理权限
      {
        id: 'a95e07cd-6fb0-4c55-bff0-62b2eaaf4209',
        permName: '用户管理',
        permKey: 'system:user:menu',
        permType: 0,
        parentId: null, // 顶级菜单
        orderNum: 1,
        path: 'user',
        component: 'system/user/index',
        icon: 'user',
      },
      {
        id: '3b3c5ef9-5afd-41c8-993c-540ec097dbc9',
        permName: '用户查询',
        permKey: 'system:user:query',
        permType: 1,
        parentId: 'a95e07cd-6fb0-4c55-bff0-62b2eaaf4209', // 用户管理的ID
        orderNum: 1,
      },
      {
        id: 'a81ba586-3b58-4e50-9d2c-61def5b455bf',
        permName: '用户新增',
        permKey: 'system:user:create',
        permType: 1,
        parentId: 'a95e07cd-6fb0-4c55-bff0-62b2eaaf4209',
        orderNum: 2,
      },
      {
        id: 'd01e76e6-6983-4efc-8564-4b6bb495c2ba',
        permName: '用户修改',
        permKey: 'system:user:update',
        permType: 1,
        parentId: 'a95e07cd-6fb0-4c55-bff0-62b2eaaf4209',
        orderNum: 3,
      },
      {
        id: 'b20a9b80-033b-4b2a-896e-35d0eb028f10',
        permName: '用户删除',
        permKey: 'system:user:delete',
        permType: 1,
        parentId: 'a95e07cd-6fb0-4c55-bff0-62b2eaaf4209',
        orderNum: 4,
      },
      {
        id: '70ca160e-0020-49ed-ba42-721258276f6a',
        permName: '用户导出',
        permKey: 'system:user:export',
        permType: 1,
        parentId: 'a95e07cd-6fb0-4c55-bff0-62b2eaaf4209',
        orderNum: 5,
      },
      {
        id: 'c1771725-224a-43a0-9247-6b05e06af1f5',
        permName: '重置密码',
        permKey: 'system:user:resetPwd',
        permType: 1,
        parentId: 'a95e07cd-6fb0-4c55-bff0-62b2eaaf4209',
        orderNum: 6,
      },

      // 角色管理权限
      {
        id: '67c13c97-a749-4393-92f8-a9cf2ad482c5',
        permName: '角色管理',
        permKey: 'system:role:menu',
        permType: 0,
        parentId: null,
        orderNum: 2,
        path: 'role',
        component: 'system/role/index',
        icon: 'peoples',
      },
      {
        id: 'c8cf2530-5234-4bdb-ac5e-586cce227e2d',
        permName: '角色查询',
        permKey: 'system:role:query',
        permType: 1,
        parentId: '67c13c97-a749-4393-92f8-a9cf2ad482c5',
        orderNum: 1,
      },
      {
        id: '487f7d0b-e901-401e-9278-e670ebb4a92e',
        permName: '角色新增',
        permKey: 'system:role:create',
        permType: 1,
        parentId: '67c13c97-a749-4393-92f8-a9cf2ad482c5',
        orderNum: 2,
      },
      {
        id: 'a079191a-3716-4745-80be-bebd089990a0',
        permName: '角色修改',
        permKey: 'system:role:update',
        permType: 1,
        parentId: '67c13c97-a749-4393-92f8-a9cf2ad482c5',
        orderNum: 3,
      },
      {
        id: 'dc749be0-12e6-45eb-9723-fa34033d412d',
        permName: '角色删除',
        permKey: 'system:role:delete',
        permType: 1,
        parentId: '67c13c97-a749-4393-92f8-a9cf2ad482c5',
        orderNum: 4,
      },
      {
        id: '7fe236c0-ba99-4aa9-ac12-ad9edac533e5',
        permName: '角色权限',
        permKey: 'system:role:permission',
        permType: 1,
        parentId: '67c13c97-a749-4393-92f8-a9cf2ad482c5',
        orderNum: 5,
      },

      // 菜单/权限管理权限
      {
        id: '82cfaf48-27cb-48ed-8a57-4f246f5fe164',
        permName: '权限管理',
        permKey: 'system:permission:menu',
        permType: 0,
        parentId: null,
        orderNum: 3,
        path: 'permission',
        component: 'system/permission/index',
        icon: 'tree-table',
      },
      {
        id: '93a5d0cd-ca10-4cb0-ad5f-772611fe607e',
        permName: '权限查询',
        permKey: 'system:permission:list',
        permType: 1,
        parentId: '82cfaf48-27cb-48ed-8a57-4f246f5fe164',
        orderNum: 1,
      },
      {
        id: '53483e16-3025-4af7-8260-c38cf484ddbe',
        permName: '权限新增',
        permKey: 'system:permission:create',
        permType: 1,
        parentId: '82cfaf48-27cb-48ed-8a57-4f246f5fe164',
        orderNum: 2,
      },
      {
        id: 'bde77462-d042-4b1f-a9ae-06def47ee08c',
        permName: '权限修改',
        permKey: 'system:permission:update',
        permType: 1,
        parentId: '82cfaf48-27cb-48ed-8a57-4f246f5fe164',
        orderNum: 3,
      },
      {
        id: 'd045413e-f65b-4407-950a-f9dc67182c34',
        permName: '权限删除',
        permKey: 'system:permission:delete',
        permType: 1,
        parentId: '82cfaf48-27cb-48ed-8a57-4f246f5fe164',
        orderNum: 4,
      },
    ];

    // 检查是否已存在权限
    const existingPermissions = await manager.find(PermissionEntity);
    if (existingPermissions.length > 0) {
      this.logger.warn(
        `已存在${existingPermissions.length}个权限，跳过权限创建`,
      );
      return existingPermissions;
    }

    // 创建权限
    const permissions: PermissionEntity[] = [];
    for (const permData of permissionsList) {
      const permission = manager.create(PermissionEntity, {
        ...permData,
        status: 1,
        isVisible: 1,
      });
      permissions.push(await manager.save(permission));
    }

    return permissions;
  }

  /**
   * 创建管理员角色
   */
  private async createAdminRole(
    manager,
    permissions: PermissionEntity[],
  ): Promise<RoleEntity> {
    // 检查是否已存在管理员角色
    const existingAdminRole = await manager.findOne(RoleEntity, {
      where: { roleKey: 'admin' },
    });

    if (existingAdminRole) {
      this.logger.warn('管理员角色已存在，跳过创建');

      // 确保管理员角色拥有所有权限
      if (
        !existingAdminRole.permissions ||
        existingAdminRole.permissions.length < permissions.length
      ) {
        existingAdminRole.permissions = permissions;
        await manager.save(existingAdminRole);
        this.logger.log('已更新管理员角色权限');
      }

      return existingAdminRole;
    }

    // 创建管理员角色
    const adminRole = manager.create(RoleEntity, {
      roleName: '超级管理员',
      roleKey: 'admin',
      orderNum: 1,
      status: 1,
      dataScope: 1, // 全部数据权限
      remark: '超级管理员，拥有所有权限',
      parentId: null,
      permissions: permissions, // 分配所有权限
    });

    return manager.save(adminRole);
  }

  /**
   * 创建普通用户角色
   */
  private async createUserRole(manager): Promise<RoleEntity> {
    // 检查是否已存在用户角色
    const existingUserRole = await manager.findOne(RoleEntity, {
      where: { roleKey: 'user' },
    });

    if (existingUserRole) {
      this.logger.warn('普通用户角色已存在，跳过创建');
      return existingUserRole;
    }

    // 创建普通用户角色
    const userRole = manager.create(RoleEntity, {
      id: '8f6433e1-0f1c-4c52-9539-4a05d767d040', // 为角色提供固定ID
      roleName: '普通用户',
      roleKey: 'user',
      orderNum: 2,
      status: 1,
      dataScope: 5, // 仅本人数据权限
      remark: '普通用户，仅有基本功能权限',
      parentId: null, // 设置为null
    });

    return manager.save(userRole);
  }

  /**
   * 创建管理员用户
   */
  private async createAdminUser(
    manager,
    roles: RoleEntity[],
  ): Promise<UserEntity> {
    // 检查是否已存在管理员用户
    const existingAdminUser = await manager.findOne(UserEntity, {
      where: { username: 'admin' },
    });

    if (existingAdminUser) {
      this.logger.warn('管理员用户已存在，跳过创建');

      // 确保管理员用户拥有管理员角色
      if (!existingAdminUser.roles || existingAdminUser.roles.length === 0) {
        existingAdminUser.roles = roles;
        await manager.save(existingAdminUser);
        this.logger.log('已更新管理员用户角色');
      }

      return existingAdminUser;
    }

    // 加密默认密码
    const salt = await bcrypt.genSalt();
    const password = await bcrypt.hash('admin123', salt);

    // 创建管理员用户
    const adminUser = manager.create(UserEntity, {
      username: 'admin',
      password: password,
      nickname: '系统管理员',
      realName: '管理员',
      email: 'admin@example.com',
      phone: '13800138000',
      gender: 1,
      status: 1,
      remark: '系统内置管理员账号',
      roles: roles,
    });

    return manager.save(adminUser);
  }
}
