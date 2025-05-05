import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, In, EntityManager } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { RoleEntity } from './entities/role.entity';
import { DepartmentEntity } from '../dept/entities/dept.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { PaginatedResponseDto } from '@common/dto/paginated-response.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(DepartmentEntity)
    private readonly departmentRepository: Repository<DepartmentEntity>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
  ) {}

  // ----------------
  // 基础CRUD操作
  // ----------------

  /**
   * 创建用户，使用事务确保数据一致性
   */
  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    return this.userRepository.manager.transaction(
      async (manager: EntityManager) => {
        // 检查用户名是否已存在
        const existingUser = await manager.findOne(UserEntity, {
          where: { username: createUserDto.username },
        });

        if (existingUser) {
          throw new ConflictException('用户名已存在');
        }

        let roles = [];
        // 检查角色是否存在 (只有当提供了roleIds才检查)
        if (createUserDto.roleIds && createUserDto.roleIds.length > 0) {
          roles = await manager.find(RoleEntity, {
            where: { id: In(createUserDto.roleIds) },
          });

          if (roles.length !== createUserDto.roleIds.length) {
            throw new BadRequestException('部分角色不存在');
          }
        }

        // 密码加密
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

        // 创建用户实体
        const user = manager.create(UserEntity, {
          ...createUserDto,
          password: hashedPassword,
          roles,
          // 确保 deptId 是字符串类型
          deptId: createUserDto.deptId ? String(createUserDto.deptId) : null,
        });

        // 保存用户
        return manager.save(user);
      },
    );
  }

  /**
   * 查询用户列表（分页），优化查询性能
   */
  async findAll(
    query: UserQueryDto,
  ): Promise<PaginatedResponseDto<UserEntity & { deptName: string }>> {
    const {
      page = 1,
      pageSize = 10,
      orderBy = 'createdAt',
      orderType = 'desc',
      searchKey,
      status,
      deptId,
      roleId,
    } = query;

    // 使用缓存键
    const cacheKey = `users_list_${JSON.stringify(query)}`;
    const cachedResult = await this.cacheManager.get(cacheKey);

    if (cachedResult) {
      return cachedResult as PaginatedResponseDto<
        UserEntity & { deptName: string }
      >;
    }

    // 构建查询构建器
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy(`user.${orderBy}`, orderType.toUpperCase() as 'ASC' | 'DESC');

    // 确保不返回已删除的用户
    queryBuilder.where('user.deletedAt IS NULL');

    // 添加搜索条件，使用索引提高性能
    if (searchKey) {
      queryBuilder.andWhere(
        '(user.username LIKE :searchKey OR user.nickname LIKE :searchKey OR user.realName LIKE :searchKey OR user.email LIKE :searchKey OR user.phone LIKE :searchKey)',
        { searchKey: `%${searchKey}%` },
      );
    }

    // 添加状态过滤
    if (status !== undefined) {
      queryBuilder.andWhere('user.status = :status', { status });
    }

    // 添加部门过滤
    if (deptId) {
      queryBuilder.andWhere('user.deptId = :deptId', { deptId });
    }

    // 添加角色过滤
    if (roleId) {
      queryBuilder.andWhere('role.id = :roleId', { roleId });
    }

    // 执行查询并计算总数
    const [users, total] = await queryBuilder.getManyAndCount();

    // 添加部门名称信息
    const usersWithDeptName = await Promise.all(
      users.map(async (user) => {
        let deptName = undefined;
        if (user.deptId) {
          const dept = await this.departmentRepository.findOne({
            where: { id: user.deptId },
          });
          deptName = dept?.deptName;
        }
        return { ...user, deptName };
      }),
    );

    // 构建分页响应
    const result = new PaginatedResponseDto(
      usersWithDeptName,
      total,
      page,
      pageSize,
    );

    // 缓存结果，设置5分钟TTL
    await this.cacheManager.set(cacheKey, result, 5 * 60 * 1000);

    return result;
  }

  /**
   * 根据ID查询用户，带缓存
   */
  async findById(id: string): Promise<UserEntity & { deptName: string }> {
    const cacheKey = `user_${id}`;
    const cachedUser = await this.cacheManager.get(cacheKey);

    if (cachedUser) {
      return cachedUser as UserEntity & { deptName: string };
    }

    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException(`ID为${id}的用户不存在`);
    }

    // 查询部门信息
    let deptName = undefined;
    if (user.deptId) {
      const dept = await this.departmentRepository.findOne({
        where: { id: user.deptId },
      });
      deptName = dept?.deptName;
    }

    // 合并部门名称到用户对象
    const userWithDept = { ...user, deptName };

    // 缓存用户信息，30分钟
    await this.cacheManager.set(cacheKey, userWithDept, 30 * 60 * 1000);

    return userWithDept;
  }

  /**
   * 根据用户名查询用户
   */
  async findByUsername(username: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { username },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException(`用户名${username}不存在`);
    }

    return user;
  }

  /**
   * 更新用户，使用事务确保数据一致性
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    return this.userRepository.manager.transaction(
      async (manager: EntityManager) => {
        // 检查用户是否存在
        const user = await manager.findOne(UserEntity, {
          where: { id },
          relations: ['roles'],
        });

        if (!user) {
          throw new NotFoundException(`ID为${id}的用户不存在`);
        }

        // 更新角色
        if (updateUserDto.roleIds && updateUserDto.roleIds.length > 0) {
          const roles = await manager.find(RoleEntity, {
            where: { id: In(updateUserDto.roleIds) },
          });

          if (roles.length !== updateUserDto.roleIds.length) {
            throw new BadRequestException('部分角色不存在');
          }

          user.roles = roles;
          delete updateUserDto.roleIds;
        }

        // 合并更新数据
        Object.assign(user, updateUserDto);

        // 保存更新后的用户
        const updatedUser = await manager.save(user);

        // 清除相关缓存
        await this.cacheManager.del(`user_${id}`);
        // 清除可能包含该用户的列表缓存
        const cacheKeys = await this.cacheManager.store.keys();
        const userListCaches = cacheKeys.filter((key) =>
          key.startsWith('users_list_'),
        );
        await Promise.all(
          userListCaches.map((key) => this.cacheManager.del(key)),
        );

        return updatedUser;
      },
    );
  }

  /**
   * 删除用户，清理缓存
   */
  async remove(id: string): Promise<void> {
    await this.userRepository.manager.transaction(
      async (manager: EntityManager) => {
        const user = await manager.findOne(UserEntity, {
          where: { id },
        });

        if (!user) {
          throw new NotFoundException(`ID为${id}的用户不存在`);
        }

        if (user.username === 'admin') {
          throw new BadRequestException('不能删除系统管理员账户');
        }

        // 软删除用户
        await manager.softDelete(UserEntity, id);

        // 清除相关缓存
        await this.cacheManager.del(`user_${id}`);
        // 清除可能包含该用户的列表缓存
        const cacheKeys = await this.cacheManager.store.keys();
        const userListCaches = cacheKeys.filter((key) =>
          key.startsWith('users_list_'),
        );
        await Promise.all(
          userListCaches.map((key) => this.cacheManager.del(key)),
        );
      },
    );
  }

  // ----------------
  // 业务操作
  // ----------------

  /**
   * 重置用户密码
   */
  async resetPassword(id: string, password: string): Promise<void> {
    const user = await this.findById(id);

    // 密码加密
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    // 更新密码
    user.password = hashedPassword;
    await this.userRepository.save(user);
  }

  /**
   * 修改用户自己的密码
   */
  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const { oldPassword, newPassword, confirmPassword } = changePasswordDto;

    // 确认两次密码输入一致
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('新密码与确认密码不匹配');
    }

    // 查找用户
    const user = await this.findById(userId);

    // 验证原密码
    const isPasswordValid = await this.validatePassword(
      oldPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('原密码错误');
    }

    // 检查新密码是否与旧密码相同
    if (await this.validatePassword(newPassword, user.password)) {
      throw new BadRequestException('新密码不能与当前密码相同');
    }

    // 密码加密
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 更新密码
    user.password = hashedPassword;
    await this.userRepository.save(user);
  }

  async updateLogoutTime(userId: string): Promise<void> {
    await this.userRepository.update(
      { id: userId },
      { lastLogoutTime: new Date() },
    );
  }

  /**
   * 更新用户状态
   */
  async updateStatus(id: string, status: number): Promise<UserEntity> {
    const user = await this.findById(id);

    if (user.username === 'admin' && status === 0) {
      throw new BadRequestException('不能禁用系统管理员账户');
    }

    user.status = status;
    return this.userRepository.save(user);
  }

  /**
   * 更新用户最后登录时间
   */
  async updateLoginTime(id: string): Promise<void> {
    await this.userRepository.update(id, {
      lastLoginTime: new Date(),
    });
  }

  // ----------------
  // 辅助方法
  // ----------------

  /**
   * 校验用户密码
   */
  async validatePassword(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainTextPassword, hashedPassword);
  }
}
