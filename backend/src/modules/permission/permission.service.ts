import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
  Logger,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { RoleEntity } from '../user/entities/role.entity';
import { PermissionEntity } from './entities/permission.entity';
import { UserEntity } from '../user/entities/user.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { AssignRolePermissionsDto } from './dto/assign-role-permissions.dto';
import { AssignUserRolesDto } from './dto/assign-user-roles.dto';
import { QueryPermissionDto } from './dto/query-permission.dto';
import { PermissionAuditEntity } from './entities/permission-audit.entity';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  PageDto,
  PageMetaDto,
  PageOptionsDto,
} from '../../common/dto/page.dto';
import { OperatorInfo } from '../../common/interfaces/operator-info.interface';

@Injectable()
export class PermissionService {
  private readonly logger = new Logger(PermissionService.name);

  constructor(
    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>,
    @InjectRepository(PermissionEntity)
    private permissionRepository: Repository<PermissionEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(PermissionAuditEntity)
    private auditRepository: Repository<PermissionAuditEntity>,
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
  ) {}

  // ==================== 角色管理 ====================

  /**
   * 创建角色
   */
  async createRole(dto: CreateRoleDto): Promise<RoleEntity> {
    // 检查角色标识是否已存在
    const existRole = await this.roleRepository.findOne({
      where: { roleKey: dto.roleKey },
    });

    if (existRole) {
      this.logger.warn(`尝试创建已存在的角色标识: ${dto.roleKey}`);
      throw new ConflictException(`角色标识已存在`);
    }

    const role = this.roleRepository.create(dto);
    return this.roleRepository.save(role);
  }

  /**
   * 更新角色
   */
  async updateRole(id: string, dto: UpdateRoleDto): Promise<RoleEntity> {
    const role = await this.roleRepository.findOne({
      where: { id },
    });

    if (!role) {
      this.logger.warn(`尝试更新不存在的角色: ${id}`);
      throw new NotFoundException(`角色不存在`);
    }

    // 如果更新了roleKey，需要检查是否与其他角色冲突
    if (dto.roleKey && dto.roleKey !== role.roleKey) {
      const existRole = await this.roleRepository.findOne({
        where: { roleKey: dto.roleKey },
      });

      if (existRole) {
        this.logger.warn(`角色标识冲突: ${dto.roleKey}`);
        throw new ConflictException(`角色标识已存在`);
      }
    }

    Object.assign(role, dto);
    return this.roleRepository.save(role);
  }

  /**
   * 删除角色
   */
  async deleteRole(id: string): Promise<void> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['users'],
    });

    if (!role) {
      this.logger.warn(`尝试删除不存在的角色: ${id}`);
      throw new NotFoundException(`角色不存在`);
    }

    if (role.users && role.users.length > 0) {
      this.logger.warn(
        `尝试删除已分配给用户的角色: ${id}, 角色名: ${role.roleName}`,
      );
      throw new ConflictException(`角色已分配给用户，无法删除`);
    }

    await this.roleRepository.remove(role);
    this.logger.log(`角色删除成功: ${role.roleName}`);
  }

  /**
   * 获取角色列表
   */
  async getRoles(): Promise<RoleEntity[]> {
    return this.roleRepository.find({
      order: {
        orderNum: 'ASC',
        createdAt: 'DESC',
      },
    });
  }

  /**
   * 获取角色详情
   */
  async getRoleById(id: string): Promise<RoleEntity> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });

    if (!role) {
      this.logger.warn(`尝试获取不存在的角色: ${id}`);
      throw new NotFoundException(`角色不存在`);
    }

    return role;
  }

  /**
   * 获取角色树
   */
  async getRoleTree(): Promise<any[]> {
    const roles = await this.roleRepository.find({
      order: {
        orderNum: 'ASC',
        createdAt: 'DESC',
      },
    });

    return this.buildTree(
      roles,
      (role) => role.id,
      (role) => role.parentId,
      (role, children) => ({
        id: role.id,
        label: role.roleName,
        value: role.id,
        roleKey: role.roleKey,
        status: role.status,
        dataScope: role.dataScope,
        orderNum: role.orderNum,
        remark: role.remark,
        children: children.length > 0 ? children : undefined,
      }),
      '0',
    );
  }

  /**
   * 分配角色权限
   */
  async assignRolePermissions(
    roleId: string,
    dto: AssignRolePermissionsDto,
    operator: OperatorInfo,
  ): Promise<boolean> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });

    if (!role) {
      this.logger.warn(`尝试为不存在的角色分配权限: ${roleId}`);
      throw new NotFoundException(`角色不存在`);
    }

    // 获取权限实体
    const permissions = await this.permissionRepository.find({
      where: { permKey: In(dto.permKeys) },
    });

    if (permissions.length !== dto.permKeys.length) {
      const foundKeys = permissions.map((p) => p.permKey);
      const missingKeys = dto.permKeys.filter(
        (key) => !foundKeys.includes(key),
      );
      this.logger.warn(`部分权限不存在: ${missingKeys.join(', ')}`);
    }

    // 记录变更前的权限（用于审计）
    const beforePermKeys = role.permissions.map((p) => p.permKey);

    // 更新角色权限
    role.permissions = permissions;
    await this.roleRepository.save(role);

    // 记录权限变更审计
    await this.recordPermissionAudit({
      operationType: 1, // 1: 角色权限变更
      targetId: roleId,
      targetName: role.roleName,
      beforeData: beforePermKeys,
      afterData: dto.permKeys,
      operator,
    });

    // 发布权限变更事件，触发缓存更新
    this.eventEmitter.emit('role.permissions.changed', { roleId });

    // 清除相关缓存
    await this.clearRolePermissionCache(roleId);

    return true;
  }

  // ==================== 权限管理 ====================

  /**
   * 创建权限
   */
  async createPermission(dto: CreatePermissionDto): Promise<PermissionEntity> {
    // 检查权限标识是否已存在
    const existPermission = await this.permissionRepository.findOne({
      where: { permKey: dto.permKey },
    });

    if (existPermission) {
      this.logger.warn(`尝试创建已存在的权限标识: ${dto.permKey}`);
      throw new ConflictException(`权限标识已存在`);
    }

    const permission = this.permissionRepository.create(dto);
    return this.permissionRepository.save(permission);
  }

  /**
   * 更新权限
   */
  async updatePermission(
    id: string,
    dto: UpdatePermissionDto,
  ): Promise<PermissionEntity> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });

    if (!permission) {
      this.logger.warn(`尝试更新不存在的权限: ${id}`);
      throw new NotFoundException(`权限不存在`);
    }

    // 如果更新了permKey，需要检查是否与其他权限冲突
    if (dto.permKey && dto.permKey !== permission.permKey) {
      const existPermission = await this.permissionRepository.findOne({
        where: { permKey: dto.permKey },
      });

      if (existPermission) {
        this.logger.warn(`权限标识冲突: ${dto.permKey}`);
        throw new ConflictException(`权限标识已存在`);
      }
    }

    Object.assign(permission, dto);
    return this.permissionRepository.save(permission);
  }

  /**
   * 删除权限
   */
  async deletePermission(id: string): Promise<void> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
      relations: ['roles'],
    });

    if (!permission) {
      this.logger.warn(`尝试删除不存在的权限: ${id}`);
      throw new NotFoundException(`权限不存在`);
    }

    if (permission.roles && permission.roles.length > 0) {
      this.logger.warn(
        `尝试删除已分配给角色的权限: ${id}, 权限名: ${permission.permName}`,
      );
      throw new ConflictException(`权限已分配给角色，无法删除`);
    }

    await this.permissionRepository.remove(permission);
    this.logger.log(`权限删除成功: ${permission.permName}`);
  }

  /**
   * 获取权限列表
   */
  async getPermissions(query: QueryPermissionDto): Promise<PermissionEntity[]> {
    const { permName, permType, status } = query;

    const queryBuilder =
      this.permissionRepository.createQueryBuilder('permission');

    if (permName) {
      queryBuilder.andWhere('permission.permName LIKE :permName', {
        permName: `%${permName}%`,
      });
    }

    if (permType !== undefined) {
      queryBuilder.andWhere('permission.permType = :permType', { permType });
    }

    if (status !== undefined) {
      queryBuilder.andWhere('permission.status = :status', { status });
    }

    queryBuilder.orderBy('permission.orderNum', 'ASC');
    queryBuilder.addOrderBy('permission.createdAt', 'DESC');

    return queryBuilder.getMany();
  }

  /**
   * 获取权限树
   */
  async getPermissionTree(): Promise<any[]> {
    const permissions = await this.permissionRepository.find({
      order: {
        orderNum: 'ASC',
        createdAt: 'DESC',
      },
    });

    return this.buildTree(
      permissions,
      (perm) => perm.id,
      (perm) => perm.parentId,
      (perm, children) => ({
        id: perm.id,
        label: perm.permName,
        value: perm.id,
        permKey: perm.permKey,
        permType: perm.permType,
        parentId: perm.parentId,
        orderNum: perm.orderNum,
        path: perm.path,
        component: perm.component,
        icon: perm.icon,
        status: perm.status,
        isVisible: perm.isVisible,
        children: children.length > 0 ? children : undefined,
      }),
      '0',
    );
  }

  /**
   * 根据ID获取权限详情
   */
  async getPermissionById(id: string): Promise<PermissionEntity> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });

    if (!permission) {
      this.logger.warn(`尝试获取不存在的权限: ${id}`);
      throw new NotFoundException(`权限不存在`);
    }

    return permission;
  }

  /**
   * 获取角色权限列表
   */
  async getRolePermissions(roleId: string): Promise<string[]> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });

    if (!role) {
      this.logger.warn(`尝试获取不存在角色的权限: ${roleId}`);
      throw new NotFoundException('角色不存在');
    }

    return role.permissions.map((permission) => permission.permKey);
  }

  /**
   * 获取用户角色列表
   */
  async getUserRoles(userId: string): Promise<string[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!user) {
      this.logger.warn(`尝试获取不存在用户的角色: ${userId}`);
      throw new NotFoundException('用户不存在');
    }

    return user.roles.map((role) => role.roleKey);
  }

  /**
   * 获取用户角色列表（包含完整角色信息）
   * @param userId 用户ID
   * @returns 角色列表
   */
  async getUserRolesWithDetails(userId: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!user) {
      this.logger.warn(`尝试获取不存在用户的角色: ${userId}`);
      throw new NotFoundException('用户不存在');
    }

    // 返回角色详细信息，符合接口文档格式
    return {
      code: 0,
      message: '查询成功',
      data: user.roles.map((role) => ({
        id: role.id,
        roleName: role.roleName,
        roleKey: role.roleKey,
        dataScope: role.dataScope,
        status: role.status,
      })),
    };
  }

  // ==================== 用户角色管理 ====================

  /**
   * 分配用户角色
   */
  async assignUserRoles(
    userId: string,
    dto: AssignUserRolesDto,
    operator: OperatorInfo,
  ): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!user) {
      this.logger.warn(`尝试为不存在的用户分配角色: ${userId}`);
      throw new NotFoundException(`用户不存在`);
    }

    // 获取角色实体
    const roles = await this.roleRepository.find({
      where: { id: In(dto.roleIds) },
    });

    if (roles.length !== dto.roleIds.length) {
      const foundIds = roles.map((r) => r.id);
      const missingIds = dto.roleIds.filter((id) => !foundIds.includes(id));
      this.logger.warn(`部分角色不存在: ${missingIds.join(', ')}`);
    }

    // 记录变更前的角色（用于审计）
    const beforeRoleIds = user.roles.map((r) => r.id);

    // 更新用户角色
    user.roles = roles;
    await this.userRepository.save(user);

    // 记录角色变更审计
    await this.recordPermissionAudit({
      operationType: 2, // 2: 用户角色变更
      targetId: userId,
      targetName: user.username,
      beforeData: { roleIds: beforeRoleIds },
      afterData: { roleIds: dto.roleIds },
      operator,
    });

    // 发布用户角色变更事件，触发缓存更新
    this.eventEmitter.emit('user.roles.changed', { userId });

    // 清除用户权限缓存
    await this.clearUserPermissionCache(userId);

    return true;
  }

  /**
   * 获取用户拥有的权限标识列表
   */
  async getUserPermissions(userId: string): Promise<string[]> {
    try {
      // 缓存实现
      const cacheKey = `user:${userId}:permissions`;
      const ttl = this.configService.get<number>(
        'app.permissionCacheTtl',
        1800,
      );

      // 尝试从缓存获取
      const cachedPermissions = await this.cacheManager.get<string[]>(cacheKey);
      if (cachedPermissions) {
        this.logger.debug(
          `从缓存获取用户[${userId}]权限: ${cachedPermissions.length}个`,
        );
        return cachedPermissions;
      }

      // 数据库查询
      const permissions = await this.queryUserPermissions(userId);

      // 存入缓存
      await this.cacheManager.set(cacheKey, permissions, ttl);
      this.logger.debug(
        `用户[${userId}]权限已缓存, ${permissions.length}个权限`,
      );

      return permissions;
    } catch (error) {
      this.logger.error(`获取用户权限出错: ${error.message}`, error.stack);
      return [];
    }
  }

  /**
   * 查询用户角色和权限
   * @param userId 用户ID
   * @returns 权限标识列表
   */
  private async queryUserPermissions(userId: string): Promise<string[]> {
    this.logger.debug(`查询用户[${userId}]的所有权限`);

    // 1. 查询用户角色
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!user || !user.roles || user.roles.length === 0) {
      this.logger.debug(`用户[${userId}]没有角色或不存在`);
      return [];
    }

    // 2. 获取角色IDs
    const roleIds = user.roles.map((role) => role.id);
    this.logger.debug(`用户[${userId}]拥有角色: ${roleIds.join(', ')}`);

    // 3. 获取角色关联的所有权限
    const permissionKeys = await this.getPermissionsByRoleIds(roleIds);

    return permissionKeys;
  }

  /**
   * 根据角色ID列表获取所有权限
   * @param roleIds 角色ID列表
   * @returns 权限标识列表
   */
  private async getPermissionsByRoleIds(roleIds: string[]): Promise<string[]> {
    // 查询角色拥有的所有权限
    const roles = await this.roleRepository.find({
      where: { id: In(roleIds) },
      relations: ['permissions'],
    });

    // 获取所有权限并去重
    const permissionSet = new Set<string>();

    for (const role of roles) {
      // 将当前角色的权限添加到集合
      for (const permission of role.permissions || []) {
        permissionSet.add(permission.permKey);
      }

      // 处理角色继承 - 递归获取父角色权限
      if (role.parentId) {
        const parentPerms = await this.getPermissionsByRoleIds([role.parentId]);
        parentPerms.forEach((perm) => permissionSet.add(perm));
      }
    }

    return Array.from(permissionSet);
  }

  /**
   * 获取用户的数据权限级别
   * @param userId 用户ID
   * @returns 数据权限级别 1-全部 2-自定义 3-本部门 4-部门及以下 5-仅本人
   */
  async getUserDataScope(userId: string): Promise<number> {
    // 获取最高权限角色的数据范围设置
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!user?.roles || user.roles.length === 0) {
      return 5; // 默认最小权限：仅本人数据
    }

    // 获取最小值(数值越小，权限范围越大)
    const minDataScope = Math.min(
      ...user.roles.map((role) => role.dataScope || 5),
    );
    return minDataScope;
  }

  /**
   * 获取用户自定义数据权限范围
   * 可用于获取允许访问的部门ID列表
   */
  async getUserCustomDataScope(userId: string): Promise<string[]> {
    // 这里可以实现自定义数据权限逻辑
    // 例如获取用户可访问的部门ID列表
    return [];
  }

  /**
   * 获取部门及其所有子部门ID
   * @param deptId 部门ID
   */
  async getChildDeptIds(deptId: string): Promise<string[]> {
    // 这里需要实现部门子节点查询逻辑
    // 可以调用部门服务获取
    return [];
  }

  // 在权限/角色变更时清除相关缓存
  async clearUserPermissionsCache(userId: string): Promise<void> {
    const cacheKey = `user:${userId}:permissions`;
    await this.cacheManager.del(cacheKey);
    this.logger.debug(`清除用户权限缓存: ${userId}`);
  }

  // 在角色权限变更时，清除所有关联用户的权限缓存
  async clearRoleUsersPermissionsCache(roleId: string): Promise<void> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['users'],
    });

    if (role && role.users && role.users.length > 0) {
      this.logger.debug(
        `清除角色关联的用户权限缓存: ${role.roleName}, 用户数量: ${role.users.length}`,
      );
      await Promise.all(
        role.users.map((user) => this.clearUserPermissionsCache(user.id)),
      );
    }
  }

  // 获取权限审计日志
  async getPermissionAuditLogs(
    operationType?: number,
    targetId?: string,
    startTime?: Date,
    endTime?: Date,
    page = 1,
    limit = 20,
  ): Promise<{ items: PermissionAuditEntity[]; total: number }> {
    const queryBuilder = this.auditRepository.createQueryBuilder('audit');

    if (operationType !== undefined) {
      queryBuilder.andWhere('audit.operationType = :operationType', {
        operationType,
      });
    }

    if (targetId !== undefined) {
      queryBuilder.andWhere('audit.targetId = :targetId', { targetId });
    }

    if (startTime) {
      queryBuilder.andWhere('audit.createdAt >= :startTime', { startTime });
    }

    if (endTime) {
      queryBuilder.andWhere('audit.createdAt <= :endTime', { endTime });
    }

    queryBuilder.orderBy('audit.createdAt', 'DESC');

    const total = await queryBuilder.getCount();
    const items = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();
    return { items, total };
  }

  // 获取角色及其所有父角色的ID - 优化一次性加载所有角色
  private async getAllRoleIds(roleIds: string[]): Promise<string[]> {
    if (!roleIds || roleIds.length === 0) {
      return [];
    }

    // 获取所有角色及其父子关系
    const allRoles = await this.roleRepository.find({
      select: ['id', 'parentId'],
    });

    // 构建角色父子关系映射
    const roleMap = new Map<string, string>();
    for (const role of allRoles) {
      roleMap.set(role.id, role.parentId);
    }

    // 计算所有角色及其父角色
    const result = new Set<string>(roleIds);
    const processedRoles = new Set<string>();

    let currentIds = [...roleIds];

    while (currentIds.length > 0) {
      const nextIds: string[] = [];

      // 处理当前层级角色
      for (const id of currentIds) {
        processedRoles.add(id);
        const parentId = roleMap.get(id);

        // 有效的父角色且未处理过
        if (parentId && parentId !== '0' && !processedRoles.has(parentId)) {
          result.add(parentId);
          nextIds.push(parentId);
        }
      }

      currentIds = nextIds;
    }

    return Array.from(result);
  }

  // 通用树构建函数
  private buildTree<T>(
    items: T[],
    getId: (item: T) => string,
    getParentId: (item: T) => string,
    transformNode: (item: T, children: any[]) => any,
    parentId: string = '0',
  ): any[] {
    const result = [];

    for (const item of items) {
      if (getParentId(item) === parentId) {
        const children = this.buildTree(
          items,
          getId,
          getParentId,
          transformNode,
          getId(item),
        );

        result.push(transformNode(item, children));
      }
    }

    return result;
  }

  // 记录权限变更审计
  private async recordPermissionAudit(params: {
    operationType: number;
    targetId: string;
    targetName: string;
    beforeData: any;
    afterData: any;
    operator: OperatorInfo;
  }): Promise<void> {
    try {
      const audit = this.auditRepository.create({
        operationType: params.operationType,
        targetId: params.targetId,
        targetName: params.targetName,
        beforeData: JSON.stringify(params.beforeData),
        afterData: JSON.stringify(params.afterData),
        operatorId: params.operator.userId,
        operatorName: params.operator.username,
        operatorIp: params.operator.ip,
      });

      await this.auditRepository.save(audit);
      this.logger.debug(
        `已记录权限变更审计: 类型${params.operationType}, 目标${params.targetName}`,
      );
    } catch (error) {
      this.logger.error(`记录权限审计失败: ${error.message}`, error.stack);
    }
  }

  // 清除用户权限缓存
  async clearUserPermissionCache(userId: string | string[]): Promise<void> {
    const userIds = Array.isArray(userId) ? userId : [userId];

    for (const id of userIds) {
      const cacheKey = `user:${id}:permissions`;
      await this.cacheManager.del(cacheKey);
      this.logger.debug(`已清除用户[${id}]权限缓存`);
    }
  }

  /**
   * 清除与角色相关的所有用户权限缓存
   * @param roleId 角色ID
   */
  async clearRolePermissionCache(roleId: string): Promise<void> {
    try {
      // 查询拥有此角色的所有用户
      const users = await this.userRepository
        .createQueryBuilder('user')
        .innerJoin('user.roles', 'role', 'role.id = :roleId', { roleId })
        .getMany();

      // 清除这些用户的权限缓存
      if (users.length > 0) {
        const userIds = users.map((u) => u.id);
        await this.clearUserPermissionCache(userIds);
        this.logger.debug(
          `已清除角色[${roleId}]下${users.length}个用户的权限缓存`,
        );
      }
    } catch (error) {
      this.logger.error(`清除角色权限缓存出错: ${error.message}`, error.stack);
    }
  }

  /**
   * 清除所有权限缓存（用于紧急情况）
   */
  async clearAllPermissionCache(): Promise<void> {
    try {
      // 不使用getClient方法，直接处理
      this.logger.warn('尝试清除所有用户权限缓存');

      // 备用方案：查询所有用户并逐个清除
      const users = await this.userRepository.find();
      for (const user of users) {
        await this.clearUserPermissionCache(user.id);
      }

      this.logger.warn(`已清除所有用户(${users.length}个)权限缓存`);
    } catch (error) {
      this.logger.error(`清除所有权限缓存出错: ${error.message}`, error.stack);
    }
  }

  /**
   * 分页查询权限列表
   * @param page 页码
   * @param take 每页条数
   */
  async getPermissionsWithPagination(page: number, take: number): Promise<any> {
    const queryBuilder =
      this.permissionRepository.createQueryBuilder('permission');

    // 根据分页参数查询
    queryBuilder
      .orderBy('permission.orderNum', 'ASC')
      .addOrderBy('permission.createdAt', 'DESC')
      .skip((page - 1) * take)
      .take(take);

    // 查询权限总数
    const itemCount = await queryBuilder.getCount();

    // 查询当前页数据
    const items = await queryBuilder.getMany();

    // 计算总页数
    const totalPages = Math.ceil(itemCount / take);

    // 返回符合接口文档规范的数据
    return {
      code: 0,
      message: '查询成功',
      data: {
        items,
        meta: {
          itemCount,
          totalPages,
          currentPage: page,
        },
      },
    };
  }
}
