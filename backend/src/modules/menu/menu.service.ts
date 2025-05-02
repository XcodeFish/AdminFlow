import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { MenuEntity } from './entities/menu.entity';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { QueryMenuDto } from './dto/query-menu.dto';
import { MenuTreeNode, UserMenuInfo } from './interfaces/menu.interface';
import { RoleEntity } from '../user/entities/role.entity';
import { UserEntity } from '../user/entities/user.entity';
import { AssignRoleMenusDto } from './dto/assign-role-menus.dto';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(MenuEntity)
    private menuRepository: Repository<MenuEntity>,
    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  /**
   * 创建菜单
   */
  async create(createMenuDto: CreateMenuDto): Promise<MenuEntity> {
    // 检查父菜单是否存在
    if (createMenuDto.parentId) {
      const parentMenu = await this.menuRepository.findOne({
        where: { id: createMenuDto.parentId },
      });
      if (!parentMenu) {
        throw new BadRequestException('父菜单不存在');
      }
    }

    // 创建菜单
    const menu = this.menuRepository.create(createMenuDto);
    return this.menuRepository.save(menu);
  }

  /**
   * 查询所有菜单
   */
  async findAll(query: QueryMenuDto): Promise<[MenuEntity[], number]> {
    const qb = this.menuRepository.createQueryBuilder('menu');

    // 添加筛选条件
    if (query.menuName) {
      qb.andWhere('menu.menuName LIKE :menuName', {
        menuName: `%${query.menuName}%`,
      });
    }

    if (query.status !== undefined) {
      qb.andWhere('menu.status = :status', { status: Number(query.status) });
    }

    // 添加排序
    qb.orderBy('menu.orderNum', 'ASC');

    // 分页查询
    qb.skip((query.page - 1) * query.limit).take(query.limit);

    return qb.getManyAndCount();
  }

  /**
   * 获取菜单树
   */
  async findMenuTree(): Promise<MenuTreeNode[]> {
    const allMenus = await this.menuRepository.find({
      order: { orderNum: 'ASC' },
    });

    return this.buildMenuTree(allMenus);
  }

  /**
   * 根据ID查询菜单
   */
  async findById(id: string): Promise<MenuEntity> {
    const menu = await this.menuRepository.findOne({
      where: { id },
    });

    if (!menu) {
      throw new NotFoundException(`菜单不存在，ID: ${id}`);
    }

    return menu;
  }

  /**
   * 更新菜单
   */
  async update(id: string, updateMenuDto: UpdateMenuDto): Promise<MenuEntity> {
    // 检查菜单是否存在
    const menu = await this.findById(id);

    // 检查父菜单是否存在
    if (updateMenuDto.parentId) {
      // 不能将自己作为自己的父级
      if (updateMenuDto.parentId === id) {
        throw new BadRequestException('不能将菜单的父级设置为自己');
      }

      const parentMenu = await this.menuRepository.findOne({
        where: { id: updateMenuDto.parentId },
      });
      if (!parentMenu) {
        throw new BadRequestException('父菜单不存在');
      }

      // 不能将子菜单设置为父菜单
      const childrenIds = await this.getAllChildMenuIds(id);
      if (childrenIds.includes(updateMenuDto.parentId)) {
        throw new BadRequestException('不能将子菜单设置为父菜单');
      }
    }

    // 更新菜单
    Object.assign(menu, updateMenuDto);
    return this.menuRepository.save(menu);
  }

  /**
   * 删除菜单
   */
  async remove(id: string): Promise<void> {
    // 检查菜单是否存在
    const menu = await this.findById(id);

    // 检查是否有子菜单
    const childMenus = await this.menuRepository.find({
      where: { parentId: id },
    });
    if (childMenus.length > 0) {
      throw new BadRequestException('该菜单下存在子菜单，无法删除');
    }

    // 删除菜单
    await this.menuRepository.remove(menu);
  }

  /**
   * 分配角色菜单
   */
  async assignRoleMenus(assignDto: AssignRoleMenusDto): Promise<void> {
    const { roleId, menuIds } = assignDto;

    // 检查角色是否存在
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['menus'],
    });
    if (!role) {
      throw new NotFoundException(`角色不存在，ID: ${roleId}`);
    }

    // 检查菜单是否都存在
    const menus = await this.menuRepository.find({
      where: { id: In(menuIds) },
    });
    if (menus.length !== menuIds.length) {
      throw new BadRequestException('包含不存在的菜单ID');
    }

    // 更新角色菜单
    role.menus = menus;
    await this.roleRepository.save(role);
  }

  /**
   * 获取当前用户菜单
   */
  async getUserMenus(userId: string): Promise<UserMenuInfo[]> {
    // 获取用户信息和角色
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.menus'],
    });

    if (!user) {
      throw new NotFoundException(`用户不存在，ID: ${userId}`);
    }

    // 检查用户是否为管理员
    const isAdmin = user.roles.some((role) => role.roleKey === 'admin');

    if (isAdmin) {
      // 管理员获取所有可用菜单
      const allMenus = await this.menuRepository.find({
        where: { status: 1 },
        order: { orderNum: 'ASC' },
      });

      return this.buildUserMenuTree(allMenus);
    }

    // 非管理员用户，获取用户所有角色的菜单ID
    const menuIds = new Set<string>();
    for (const role of user.roles) {
      for (const menu of role.menus) {
        menuIds.add(menu.id);
      }
    }

    // 获取所有菜单数据
    const menus = await this.menuRepository.find({
      where: { id: In([...menuIds]), status: 1 },
      order: { orderNum: 'ASC' },
    });

    // 构建菜单树
    return this.buildUserMenuTree(menus);
  }

  /**
   * 获取某个角色的所有菜单ID
   */
  async getRoleMenuIds(roleId: string): Promise<string[]> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['menus'],
    });

    if (!role) {
      throw new NotFoundException(`角色不存在，ID: ${roleId}`);
    }

    return role.menus.map((menu) => menu.id);
  }

  /**
   * 构建菜单树
   * @private
   */
  private buildMenuTree(
    menus: MenuEntity[],
    parentId: string | null = null,
  ): MenuTreeNode[] {
    const tree: MenuTreeNode[] = [];

    menus.forEach((menu) => {
      if (menu.parentId === parentId) {
        const node: MenuTreeNode = {
          id: menu.id,
          menuName: menu.menuName,
          parentId: menu.parentId,
          orderNum: menu.orderNum,
          path: menu.path,
          component: menu.component,
          query: menu.query,
          isExternal: menu.isExternal,
          isCache: menu.isCache,
          menuType: menu.menuType,
          isVisible: menu.isVisible,
          status: menu.status,
          perms: menu.perms,
          icon: menu.icon,
        };

        // 递归查找子节点
        const children = this.buildMenuTree(menus, menu.id);
        if (children.length > 0) {
          node.children = children;
        }

        tree.push(node);
      }
    });

    return tree;
  }

  /**
   * 构建用户菜单树
   * @private
   */
  private buildUserMenuTree(
    menus: MenuEntity[],
    parentId: string | null = null,
  ): UserMenuInfo[] {
    const tree: UserMenuInfo[] = [];

    menus.forEach((menu) => {
      if (menu.parentId === parentId) {
        // 只显示目录和菜单类型，不显示按钮类型
        if (menu.menuType !== 'F' && menu.isVisible === 1) {
          const node: UserMenuInfo = {
            id: menu.id,
            menuName: menu.menuName,
            path: menu.path,
            component: menu.component,
            query: menu.query,
            isExternal: menu.isExternal,
            isCache: menu.isCache,
            menuType: menu.menuType,
            isVisible: menu.isVisible,
            icon: menu.icon,
            perms: menu.perms,
          };

          // 递归查找子节点
          const children = this.buildUserMenuTree(menus, menu.id);
          if (children.length > 0) {
            node.children = children;
          }

          tree.push(node);
        }
      }
    });

    return tree;
  }

  /**
   * 获取所有子菜单ID
   * @private
   */
  private async getAllChildMenuIds(menuId: string): Promise<string[]> {
    const result: string[] = [];
    const allMenus = await this.menuRepository.find();

    const getChildIds = (parentId: string) => {
      const children = allMenus.filter((menu) => menu.parentId === parentId);
      for (const child of children) {
        result.push(child.id);
        getChildIds(child.id);
      }
    };

    getChildIds(menuId);
    return result;
  }
}
